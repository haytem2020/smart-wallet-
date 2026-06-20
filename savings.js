/**
 * routes/savings.js — أهداف التوفير
 */
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET جلب كل الأهداف
router.get('/', (req, res) => {
  const goals = db.prepare('SELECT * FROM savings_goals ORDER BY created_at DESC').all();
  const total = goals.reduce((sum, g) => sum + g.current, 0);
  res.json({ goals, total });
});

// POST إضافة هدف جديد
router.post('/', (req, res) => {
  const { title, target, current = 0, icon, color_class, deadline } = req.body;
  if (!title || !target) return res.status(400).json({ error: 'البيانات ناقصة' });
  const stmt = db.prepare(`
    INSERT INTO savings_goals (title, target, current, icon, color_class, deadline)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(title, Number(target), Number(current),
    icon || 'savings',
    color_class || 'bg-primary-container/10 text-primary-container',
    deadline || null
  );
  const newGoal = db.prepare('SELECT * FROM savings_goals WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json(newGoal);
});

// PATCH إضافة مبلغ للهدف (ادخار)
router.patch('/:id/deposit', (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) return res.status(400).json({ error: 'مبلغ غير صحيح' });
  const goal = db.prepare('SELECT * FROM savings_goals WHERE id=?').get(req.params.id);
  if (!goal) return res.status(404).json({ error: 'الهدف غير موجود' });
  const newCurrent = goal.current + Number(amount);
  db.prepare('UPDATE savings_goals SET current=? WHERE id=?').run(newCurrent, goal.id);
  const updated = db.prepare('SELECT * FROM savings_goals WHERE id=?').get(goal.id);
  res.json(updated);
});

// DELETE حذف هدف
router.delete('/:id', (req, res) => {
  const goal = db.prepare('SELECT * FROM savings_goals WHERE id=?').get(req.params.id);
  if (!goal) return res.status(404).json({ error: 'الهدف غير موجود' });
  db.prepare('DELETE FROM savings_goals WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// PUT تعديل الهدف
router.put('/:id', (req, res) => {
  const { title, target, deadline } = req.body;
  const goal = db.prepare('SELECT * FROM savings_goals WHERE id=?').get(req.params.id);
  if (!goal) return res.status(404).json({ error: 'الهدف غير موجود' });
  db.prepare('UPDATE savings_goals SET title=?, target=?, deadline=? WHERE id=?')
    .run(title || goal.title, target || goal.target, deadline || goal.deadline, goal.id);
  const updated = db.prepare('SELECT * FROM savings_goals WHERE id=?').get(goal.id);
  res.json(updated);
});

module.exports = router;
