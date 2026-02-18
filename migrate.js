const initSqlJs = require('sql.js');
const fs = require('fs');

// Random 4-letter words for card codes
const WORDS = ['FROG', 'STAR', 'BOLD', 'WILD', 'ZEST', 'BLAZE', 'DREAM', 'ECHO', 'FERN', 'GALE', 'HARP', 'IVY', 'JADE', 'KITE', 'LUNA', 'MYTH', 'NOVA', 'OPAL', 'PYRE', 'QUIZ', 'RUNE', 'SPAR', 'TWIG', 'URSA', 'VEX', 'WISP', 'YARN', 'ZINC', 'AMBER', 'BASS', 'CLOUD', 'DUSK', 'EMBER', 'FLAKE', 'GLINT', 'HUSH', 'INKY', 'JOLT', 'KRILL', 'LILAC', 'MIST', 'NIMB', 'ONYX', 'PUFF', 'RIND', 'SHIM', 'TIDE', 'VANE', 'WAVE', 'XENO', 'YAWL', 'ZEN'];

function randomCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

async function migrate() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('/app/data/kanban.db'));
  
  // Add assigned_to column if it doesn't exist
  try {
    db.run("ALTER TABLE cards ADD COLUMN assigned_to TEXT DEFAULT ''");
    console.log('Migration: added assigned_to column');
  } catch (e) {
    if (!e.message.includes('duplicate column name')) {
      console.log('Migration: assigned_to already exists');
    }
  }
  
  // Add tags column if it doesn't exist
  try {
    db.run("ALTER TABLE cards ADD COLUMN tags TEXT DEFAULT ''");
    console.log('Migration: added tags column');
  } catch (e) {
    if (!e.message.includes('duplicate column name')) {
      console.log('Migration: tags already exists');
    }
  }
  
  // Add code column if it doesn't exist
  try {
    db.run("ALTER TABLE cards ADD COLUMN code TEXT DEFAULT ''");
    console.log('Migration: added code column');
  } catch (e) {
    if (!e.message.includes('duplicate column name')) {
      console.log('Migration: code already exists');
    }
  }
  
  // Add due_date column if it doesn't exist
  try {
    db.run("ALTER TABLE cards ADD COLUMN due_date TEXT DEFAULT ''");
    console.log('Migration: added due_date column');
  } catch (e) {
    if (!e.message.includes('duplicate column name')) {
      console.log('Migration: due_date already exists');
    }
  }
  
  // Generate codes for existing cards that don't have one
  const cards = [];
  const stmt = db.prepare('SELECT id, code FROM cards');
  while (stmt.step()) {
    const row = stmt.getAsObject();
    if (!row.code) {
      row.code = randomCode();
      db.run('UPDATE cards SET code = ? WHERE id = ?', [row.code, row.id]);
    }
    cards.push(row);
  }
  stmt.free();
  console.log(`Migration: assigned codes to ${cards.length} cards`);
  
  // Add subtasks table if not exists  
  db.run(`
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    )
  `);
  fs.writeFileSync('/app/data/kanban.db', db.export());
  console.log('Migration: done');
  
  process.exit(0);
}

migrate();
