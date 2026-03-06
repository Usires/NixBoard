// Database initialization service
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Use absolute path from the app root (two levels up from src/services)
const DB_PATH = path.resolve(__dirname, '..', '..', 'data', 'kanban.db');

const createTables = (db) => {
  db.run(`
    CREATE TABLE IF NOT EXISTS lanes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      board_id INTEGER DEFAULT 1
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#3b82f6',
      lane_id TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      code TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      due_date TEXT DEFAULT '',
      assigned_to TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      card_id INTEGER NOT NULL
    )
  `);
};

const seedDefaultBoard = (db) => {
  const lanes = [
    { id: 'backlog', title: 'Backlog', position: 0 },
    { id: 'in-progress', title: 'In Progress', position: 1 },
    { id: 'done', title: 'Done', position: 2 },
    { id: 'blocked', title: 'Blocked', position: 3 }
  ];
  
  const stmt = db.prepare('INSERT OR IGNORE INTO lanes (id, title, position) VALUES (?, ?, ?)');
  for (const lane of lanes) {
    stmt.run([lane.id, lane.title, lane.position]);
  }
  stmt.free();
};

const loadExistingDb = () => {
  if (fs.existsSync(DB_PATH)) {
    return fs.readFileSync(DB_PATH);
  }
  return null;
};

const initDb = async () => {
  const SQL = await initSqlJs();
  
  let dbBuffer = loadExistingDb();
  const db = dbBuffer ? new SQL.Database(dbBuffer) : new SQL.Database();
  
  createTables(db);
  seedDefaultBoard(db);
  
  // Save after initialization
  const data = db.export();
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  
  // Auto-save wrapper for db.run()
  const originalDbRun = db.run.bind(db);
  db.run = (...args) => {
    originalDbRun(...args);
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  };

  // Auto-save wrapper for stmt.run() - wrap the prepare method
  const originalPrepare = db.prepare.bind(db);
  db.prepare = (sql) => {
    const stmt = originalPrepare(sql);
    const originalStmtRun = stmt.run.bind(stmt);
    stmt.run = (...args) => {
      originalStmtRun(...args);
      const data = db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    };
    return stmt;
  };
  
  return db;
};

module.exports = { initDb };
