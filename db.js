/**
 * db.js — قاعدة البيانات SQLite
 * تهيئة الجداول عند أول تشغيل
 */
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'budget.db');
const db = new Database(DB_PATH);

// تفعيل foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// إنشاء الجداول
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    type        TEXT    NOT NULL CHECK(type IN ('income','expense')),
    category    TEXT    NOT NULL DEFAULT 'أخرى',
    icon        TEXT    NOT NULL DEFAULT 'payments',
    color_class TEXT    NOT NULL DEFAULT 'bg-secondary-container/50 text-on-secondary-container',
    date        TEXT    NOT NULL,
    is_recurring INTEGER NOT NULL DEFAULT 0,
    recurrence_period TEXT DEFAULT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS savings_goals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    target      REAL    NOT NULL,
    current     REAL    NOT NULL DEFAULT 0,
    icon        TEXT    NOT NULL DEFAULT 'savings',
    color_class TEXT    NOT NULL DEFAULT 'bg-primary-container/10 text-primary-container',
    deadline    TEXT    DEFAULT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    category     TEXT    NOT NULL,
    limit_amount REAL    NOT NULL,
    month_year   TEXT    NOT NULL,
    UNIQUE(category, month_year)
  );

  CREATE TABLE IF NOT EXISTS bills (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    due_day     INTEGER NOT NULL,
    category    TEXT    NOT NULL DEFAULT 'سكن',
    icon        TEXT    NOT NULL DEFAULT 'receipt',
    color_class TEXT    NOT NULL DEFAULT 'bg-secondary-container/50 text-on-secondary-container',
    is_paid     INTEGER NOT NULL DEFAULT 0,
    month_year  TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// بيانات تجريبية إن كانت قاعدة البيانات جديدة
const count = db.prepare('SELECT COUNT(*) as c FROM transactions').get();
if (count.c === 0) {
  const insertTx = db.prepare(`
    INSERT INTO transactions (title, amount, type, category, icon, color_class, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date();
  const fmt = (d) => d.toLocaleDateString('ar-EG', { day:'numeric', month:'long', year:'numeric' });
  const d1 = new Date(now); d1.setDate(d1.getDate()-2);
  const d2 = new Date(now); d2.setDate(d2.getDate()-4);
  const d3 = new Date(now); d3.setDate(d3.getDate()-6);
  const d4 = new Date(now); d4.setDate(d4.getDate()-8);

  insertTx.run('غداء عمل - شاورما', 450, 'expense', 'طعام', 'restaurant', 'bg-secondary-container/50 text-on-secondary-container', fmt(d1));
  insertTx.run('اشتراك نتفليكس', 650, 'expense', 'ترفيه', 'movie', 'bg-secondary-container/50 text-on-secondary-container', fmt(d2));
  insertTx.run('راتب شهري', 150000, 'income', 'دخل', 'payments', 'bg-primary-container/10 text-primary-container', fmt(d3));
  insertTx.run('فاتورة الكهرباء', 3200, 'expense', 'سكن', 'home', 'bg-secondary-container/50 text-on-secondary-container', fmt(d4));

  const insertGoal = db.prepare(`
    INSERT INTO savings_goals (title, target, current, icon, color_class)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertGoal.run('صندوق الطوارئ', 500000, 150000, 'home', 'bg-primary-container/10 text-primary-container');
  insertGoal.run('شراء حاسوب جديد', 1200000, 400000, 'laptop_mac', 'bg-secondary-container/50 text-on-secondary-container');

  const monthYear = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const insertBill = db.prepare(`
    INSERT INTO bills (title, amount, due_day, category, icon, color_class, month_year)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertBill.run('فاتورة الكهرباء', 3200, 10, 'سكن', 'bolt', 'bg-secondary-container/50 text-on-secondary-container', monthYear);
  insertBill.run('فاتورة الإنترنت', 1200, 15, 'تقنية', 'wifi', 'bg-primary-container/10 text-primary-container', monthYear);
  insertBill.run('إيجار الشقة', 50000, 1, 'سكن', 'home', 'bg-secondary-container/50 text-on-secondary-container', monthYear);

  const insertBudget = db.prepare(`
    INSERT OR IGNORE INTO budgets (category, limit_amount, month_year)
    VALUES (?, ?, ?)
  `);
  insertBudget.run('طعام', 20000, monthYear);
  insertBudget.run('ترفيه', 10000, monthYear);
  insertBudget.run('سكن', 80000, monthYear);
  insertBudget.run('تقنية', 15000, monthYear);

  console.log('✅ تمت تهيئة قاعدة البيانات ببيانات تجريبية.');
}

module.exports = db;
