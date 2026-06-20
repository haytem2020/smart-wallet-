/**
 * routes/budgets.js — الميزانيات الشهرية
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET الميزانيات مع نسبة الإنفاق الفعلي
router.get('/', (req, res) => {
  const now = new Date();
  const { month_year = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}` } = req.query;

  const budgets = db.prepare('SELECT * FROM budgets WHERE month_year=? ORDER BY category').all(month_year);

  const enriched = budgets.map(b => {
    const spent = db.prepare(`
      SELECT COALESCE(SUM(amount),0) as total
      FROM transactions
      WHERE category=? AND type='expense'
      AND strftime('%Y-%m', created_at) = ?
    `).get(b.category, month_year);

    const spentAmount = spent?.total || 0;
    const percentage = b.limit_amount > 0 ? Math.round((spentAmount / b.limit_amount) * 100) : 0;
    const status = percentage >= 100 ? 'exceeded' : percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'ok';
    return { ...b, spent: spentAmount, percentage, status };
  });

  res.json({ budgets: enriched, month_year });
});

// POST إضافة أو تعديل ميزانية
router.post('/', (req, res) => {
  const now = new Date();
  const { category, limit_amount, month_year = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}` } = req.body;
  if (!category || !limit_amount) return res.status(400).json({ error: 'البيانات ناقصة' });

  db.prepare(`
    INSERT INTO budgets (category, limit_amount, month_year)
    VALUES (?, ?, ?)
    ON CONFLICT(category, month_year) DO UPDATE SET limit_amount=excluded.limit_amount
  `).run(category, Number(limit_amount), month_year);

  res.json({ success: true, category, limit_amount: Number(limit_amount), month_year });
});

// DELETE حذف ميزانية
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM budgets WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
