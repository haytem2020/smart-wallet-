/**
 * server.js — الخادم الرئيسي
 * Express + SQLite backend لتطبيق الميزانية الذكية
 */
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const db      = require('./db'); // تهيئة DB عند الاستيراد

const transactionsRouter = require('./routes/transactions');
const savingsRouter      = require('./routes/savings');
const budgetsRouter      = require('./routes/budgets');
const billsRouter        = require('./routes/bills');
const insightsRouter     = require('./routes/insights');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────
app.use(cors({ origin: '*' })); // السماح بطلبات من الصفحة المحلية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// تقديم الـ Frontend من مجلد الأب
app.use(express.static(path.join(__dirname, '..')));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/transactions', transactionsRouter);
app.use('/api/savings',      savingsRouter);
app.use('/api/budgets',      budgetsRouter);
app.use('/api/bills',        billsRouter);
app.use('/api/insights',     insightsRouter);

// ─── Health Check ──────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'الميزانية الذكية API تعمل بشكل صحيح ✅',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'خطأ داخلي في الخادم', details: err.message });
});

// ─── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 الميزانية الذكية API تعمل على: http://localhost:${PORT}`);
  console.log(`📊 الـ Frontend:       http://localhost:${PORT}/code.html`);
  console.log(`🔗 API Status:         http://localhost:${PORT}/api/status\n`);
});
