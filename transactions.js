/**
 * routes/transactions.js — إدارة المعاملات
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET جلب كل المعاملات مع فلترة اختيارية
router.get('/', (req, res) => {
  const { type, category, search, from, to, limit = 100, offset = 0 } = req.query;
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];

  if (type)     { sql += ' AND type = ?';             params.push(type); }
  if (category) { sql += ' AND category = ?';         params.push(category); }
  if (search)   { sql += ' AND title LIKE ?';         params.push(`%${search}%`); }
  if (from)     { sql += ' AND created_at >= ?';      params.push(from); }
  if (to)       { sql += ' AND created_at <= ?';      params.push(to + ' 23:59:59'); }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const transactions = db.prepare(sql).all(...params);

  // Count without limit/offset
  let countSql = 'SELECT COUNT(*) as c FROM transactions WHERE 1=1';
  const countParams = [];
  if (type)     { countSql += ' AND type = ?';     countParams.push(type); }
  if (category) { countSql += ' AND category = ?'; countParams.push(category); }
  if (search)   { countSql += ' AND title LIKE ?'; countParams.push(`%${search}%`); }

  const totalCount = db.prepare(countSql).get(...countParams);

  res.json({ transactions, total: totalCount.c });
});

// GET ملخص الإحصائيات
router.get('/summary', (req, res) => {
  const { month_year } = req.query;

  let dateFilter = '';
  const params = [];

  if (month_year) {
    dateFilter = "AND strftime('%Y-%m', created_at) = ?";
    params.push(month_year);
  }

  const income  = db.prepare(
    `SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='income' ${dateFilter}`
  ).get(...params);

  const expense = db.prepare(
    `SELECT COALESCE(SUM(amount),0) as total FROM transactions WHERE type='expense' ${dateFilter}`
  ).get(...params);

  const balance = (income?.total || 0) - (expense?.total || 0);

  // مصاريف حسب الفئة
  const byCategory = db.prepare(
    `SELECT category, SUM(amount) as total FROM transactions WHERE type='expense' ${dateFilter} GROUP BY category ORDER BY total DESC`
  ).all(...params);

  // اتجاه شهري (آخر 6 أشهر)
  const monthly = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month,
           SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
           SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
    FROM transactions
    WHERE created_at >= date('now', '-6 months')
    GROUP BY month
    ORDER BY month ASC
  `).all();

  res.json({ income: income?.total || 0, expense: expense?.total || 0, balance, byCategory, monthly });
});

// POST إضافة معاملة جديدة
router.post('/', (req, res) => {
  const { title, amount, type, category, icon, color_class, date, is_recurring, recurrence_period } = req.body;
  if (!title || !amount || !type) return res.status(400).json({ error: 'البيانات ناقصة' });

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO transactions (title, amount, type, category, icon, color_class, date, is_recurring, recurrence_period, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    title, Number(amount), type,
    category || 'أخرى',
    icon || 'payments',
    color_class || 'bg-secondary-container/50 text-on-secondary-container',
    date || now.split('T')[0],
    is_recurring ? 1 : 0,
    recurrence_period || null,
    now
  );
  const newTx = db.prepare('SELECT * FROM transactions WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(newTx);
});

// DELETE حذف معاملة
router.delete('/:id', (req, res) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id=?').get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'المعاملة غير موجودة' });
  db.prepare('DELETE FROM transactions WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// GET تصدير CSV
router.get('/export/csv', (req, res) => {
  const transactions = db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all();
  const header = 'ID,العنوان,المبلغ,النوع,الفئة,التاريخ\n';
  const rows = transactions.map(t =>
    `${t.id},"${t.title}",${t.amount},"${t.type}","${t.category}","${t.date}"`
  ).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=budget-transactions.csv');
  res.send('\uFEFF' + header + rows); // BOM for Arabic Excel
});

module.exports = router;
