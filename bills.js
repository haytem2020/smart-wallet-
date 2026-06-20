/**
 * routes/bills.js — تتبع الفواتير الشهرية
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET جلب فواتير الشهر
router.get('/', (req, res) => {
  const now = new Date();
  const { month_year = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}` } = req.query;
  const bills = db.prepare('SELECT * FROM bills WHERE month_year=? ORDER BY due_day ASC').all(month_year);

  const today = now.getDate();
  const enriched = bills.map(b => {
    const daysLeft = b.due_day - today;
    const isOverdue = !b.is_paid && daysLeft < 0;
    const isDueSoon = !b.is_paid && daysLeft >= 0 && daysLeft <= 3;
    return { ...b, days_left: daysLeft, is_overdue: isOverdue, is_due_soon: isDueSoon };
  });

  const totalPaid = bills.filter(b => b.is_paid).reduce((s, b) => s + b.amount, 0);
  const totalPending = bills.filter(b => !b.is_paid).reduce((s, b) => s + b.amount, 0);

  res.json({ bills: enriched, totalPaid, totalPending, month_year });
});

// POST إضافة فاتورة (تُضاف لكل الأشهر القادمة تلقائياً)
router.post('/', (req, res) => {
  const now = new Date();
  const { title, amount, due_day, category, icon, color_class, month_year } = req.body;
  if (!title || !amount || !due_day) return res.status(400).json({ error: 'البيانات ناقصة' });

  const targetMonth = month_year || `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const result = db.prepare(`
    INSERT INTO bills (title, amount, due_day, category, icon, color_class, month_year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title, Number(amount), Number(due_day),
    category || 'سكن',
    icon || 'receipt',
    color_class || 'bg-secondary-container/50 text-on-secondary-container',
    targetMonth
  );
  const newBill = db.prepare('SELECT * FROM bills WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(newBill);
});

// PATCH وضع علامة مدفوعة / غير مدفوعة
router.patch('/:id/toggle', (req, res) => {
  const bill = db.prepare('SELECT * FROM bills WHERE id=?').get(req.params.id);
  if (!bill) return res.status(404).json({ error: 'الفاتورة غير موجودة' });
  const newState = bill.is_paid ? 0 : 1;
  db.prepare('UPDATE bills SET is_paid=? WHERE id=?').run(newState, bill.id);
  const updated = db.prepare('SELECT * FROM bills WHERE id=?').get(bill.id);
  res.json(updated);
});

// DELETE حذف فاتورة
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM bills WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// POST نسخ فواتير شهر لشهر جديد
router.post('/copy-month', (req, res) => {
  const { from_month, to_month } = req.body;
  if (!from_month || !to_month) return res.status(400).json({ error: 'البيانات ناقصة' });
  const sourceBills = db.prepare('SELECT * FROM bills WHERE month_year=?').all(from_month);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO bills (title, amount, due_day, category, icon, color_class, month_year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  sourceBills.forEach(b => insert.run(b.title, b.amount, b.due_day, b.category, b.icon, b.color_class, to_month));
  res.json({ success: true, copied: sourceBills.length });
});

module.exports = router;
