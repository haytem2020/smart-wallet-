/**
 * routes/insights.js — التحليلات الذكية ودرجة الصحة المالية
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET درجة الصحة المالية + نصائح
router.get('/health', (req, res) => {
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const prevMonthYear = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth()+1).padStart(2,'0')}`;

  // دخل ومصاريف هذا الشهر
  const income  = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='income' AND strftime('%Y-%m',created_at)=?`).get(monthYear)?.t || 0;
  const expense = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='expense' AND strftime('%Y-%m',created_at)=?`).get(monthYear)?.t || 0;

  // عدد أشهر بها دخل (انتظام)
  const activeMonths = db.prepare(`SELECT COUNT(DISTINCT strftime('%Y-%m',created_at)) as c FROM transactions WHERE type='income'`).get()?.c || 0;

  // نسبة الادخار
  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  // الالتزام بالميزانية
  const budgets = db.prepare('SELECT * FROM budgets WHERE month_year=?').all(monthYear);
  let budgetScore = 100;
  if (budgets.length > 0) {
    const exceeded = budgets.filter(b => {
      const spent = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE category=? AND type='expense' AND strftime('%Y-%m',created_at)=?`).get(b.category, monthYear)?.t || 0;
      return spent > b.limit_amount;
    }).length;
    budgetScore = Math.max(0, 100 - (exceeded / budgets.length) * 100);
  }

  // تنوع الدخل
  const incomeCategories = db.prepare(`SELECT COUNT(DISTINCT category) as c FROM transactions WHERE type='income'`).get()?.c || 0;
  const diversityScore = Math.min(100, incomeCategories * 33);

  // الحساب النهائي
  const healthScore = Math.round(
    (Math.min(100, Math.max(0, savingsRate * 2)) * 0.40) +
    (budgetScore * 0.30) +
    (diversityScore * 0.20) +
    (Math.min(100, activeMonths * 17) * 0.10)
  );

  // توليد النصائح
  const tips = [];
  if (savingsRate < 20) tips.push({ icon: 'savings', text: `نسبة ادخارك ${savingsRate.toFixed(1)}%. حاول رفعها إلى 20% على الأقل.`, severity: 'warning' });
  if (expense > income) tips.push({ icon: 'warning', text: 'مصاريفك تتجاوز دخلك هذا الشهر!', severity: 'danger' });
  if (budgets.length === 0) tips.push({ icon: 'pie_chart', text: 'أنشئ ميزانيات شهرية للتحكم في إنفاقك بشكل أفضل.', severity: 'info' });
  if (healthScore >= 80) tips.push({ icon: 'emoji_events', text: 'أداء مالي ممتاز! استمر على هذا النهج.', severity: 'success' });

  // أعلى فئة إنفاق
  const topCat = db.prepare(`
    SELECT category, SUM(amount) as t FROM transactions
    WHERE type='expense' AND strftime('%Y-%m',created_at)=?
    GROUP BY category ORDER BY t DESC LIMIT 1
  `).get(monthYear);
  if (topCat && topCat.t > income * 0.5) {
    tips.push({ icon: 'receipt_long', text: `تنفق ${((topCat.t/income)*100).toFixed(0)}% من دخلك على "${topCat.category}". راجع هذا البند.`, severity: 'warning' });
  }

  // مقارنة بالشهر السابق
  const prevExpense = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='expense' AND strftime('%Y-%m',created_at)=?`).get(prevMonthYear)?.t || 0;
  if (prevExpense > 0 && expense > prevExpense * 1.2) {
    tips.push({ icon: 'trending_up', text: `مصاريفك ارتفعت بنسبة ${(((expense-prevExpense)/prevExpense)*100).toFixed(0)}% مقارنةً بالشهر الماضي.`, severity: 'warning' });
  }

  res.json({
    score: healthScore,
    components: {
      savings: Math.round(Math.min(100, Math.max(0, savingsRate * 2))),
      budget: Math.round(budgetScore),
      diversity: Math.round(diversityScore),
      regularity: Math.min(100, activeMonths * 17)
    },
    tips,
    income, expense, savingsRate: savingsRate.toFixed(1)
  });
});

// GET نصائح سريعة بناءً على نمط الإنفاق
router.get('/tips', (req, res) => {
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const categories = db.prepare(`
    SELECT category, SUM(amount) as total
    FROM transactions WHERE type='expense' AND strftime('%Y-%m',created_at)=?
    GROUP BY category ORDER BY total DESC
  `).all(monthYear);

  const income = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM transactions WHERE type='income' AND strftime('%Y-%m',created_at)=?`).get(monthYear)?.t || 1;

  const smartTips = [];
  const allTipsPool = [
    { id: 1, icon: 'coffee', title: 'قاعدة 50/30/20', text: 'خصص 50% للضروريات، 30% للترفيه، 20% للادخار.', category: 'general' },
    { id: 2, icon: 'calculate', title: 'حساب التراكم', text: 'ادخار 500 دج يومياً يعني 180,000 دج سنوياً!', category: 'general' },
    { id: 3, icon: 'restaurant', title: 'الطعام خارج البيت', text: 'تحضير الطعام في المنزل يوفر 40-60% من مصاريف الأكل.', category: 'طعام' },
    { id: 4, icon: 'movie', title: 'الترفيه الذكي', text: 'شارك اشتراكات البث مع العائلة لتوفير المال.', category: 'ترفيه' },
    { id: 5, icon: 'local_gas_station', title: 'النقل الاقتصادي', text: 'استخدام النقل العام أو الدراجة يوفر تكاليف الوقود والصيانة.', category: 'نقل' },
    { id: 6, icon: 'shopping_bag', title: 'قبل الشراء', text: 'انتظر 48 ساعة قبل أي شراء غير ضروري لتجنب الشراء العاطفي.', category: 'تسوق' },
    { id: 7, icon: 'electric_bolt', title: 'الكهرباء', text: 'تقليل درجة التكييف بـ 2° يوفر 14% من استهلاك الكهرباء.', category: 'سكن' },
    { id: 8, icon: 'savings', title: 'الادخار التلقائي', text: 'قم بتحويل مبلغ ثابت للادخار أول كل شهر قبل أي إنفاق.', category: 'general' },
  ];

  // تصفية النصائح ذات الصلة
  const topCategory = categories[0]?.category;
  const relevant = allTipsPool.filter(t => t.category === topCategory || t.category === 'general').slice(0, 4);
  smartTips.push(...relevant);

  res.json({ tips: smartTips });
});

module.exports = router;
