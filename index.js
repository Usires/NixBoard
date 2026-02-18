const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// ============================================
// CONSTANTS (Clean Code: No Magic Numbers)
// ============================================
const CONFIG = {
  PORT: process.env.PORT || process.env.API_PORT || 3000,
  DB_PATH: process.env.DB_PATH || '/app/data/kanban.db',
  BOARD_NAME: process.env.BOARD_NAME || 'My Project Board',
  DEFAULT_LANES: (process.env.DEFAULT_LANES || 'Backlog,In Progress,Done,Blocked').split(','),
};

const LIMITS = {
  TITLE_MAX: 1000,
  DESC_MAX: 5000,
  TAG_MAX: 500,
  ASSIGN_MAX: 100,
  CODE_MAX: 4,
  SUBTASK_MAX: 500,
  REQUEST_SIZE: '1mb',
};

// Card code words (140 words - 88 mph Delorean speed Easter egg!)
const CODE_WORDS = [
  'FROG', 'STAR', 'BOLD', 'WILD', 'ZEST', 'BLAZE', 'DREAM', 'ECHO', 'FERN', 'GALE',
  'HARP', 'IVY', 'JADE', 'KITE', 'LUNA', 'MYTH', 'NOVA', 'OPAL', 'PYRE', 'QUIZ',
  'RUNE', 'SPAR', 'TWIG', 'URSA', 'VEX', 'WISP', 'YARN', 'ZINC', 'AMBER', 'BASS',
  'CLOUD', 'DUSK', 'EMBER', 'FLAKE', 'GLINT', 'HUSH', 'INKY', 'JOLT', 'KRILL', 'LILAC',
  'MIST', 'NIMB', 'ONYX', 'PUFF', 'RIND', 'SHIM', 'TIDE', 'VANE', 'WAVE', 'XENO',
  'YAWL', 'ZEN', 'ABLE', 'ACID', 'AGED', 'ALSO', 'AMID', 'ARCH', 'AUTO', 'AWAY', 'BACK',
  'BALD', 'BARK', 'BEAM', 'BELL', 'BELT', 'BEND', 'BEST', 'BIKE', 'BIRD', 'BITE',
  'BLAH', 'BLED', 'BLEW', 'BLOB', 'BLOG', 'BLOW', 'BLUE', 'BOAT', 'BODY', 'BOIL',
  'BOLD', 'BOLT', 'BOMB', 'BOND', 'BONE', 'BOOK', 'BOOM', 'BOOT', 'BORN', 'BOSS',
  'BOTH', 'BOWL', 'BRED', 'BREW', 'BRIM', 'BULK', 'BUMP', 'BUNK', 'BURN', 'BURY',
  'BUSH', 'BUSY', 'CAGE', 'CAKE', 'CALM', 'CAMP', 'CANE', 'CAPE', 'CARD', 'CARE',
  'CARL', 'CARP', 'CART', 'CASE', 'CASH', 'CAST', 'CAVE', 'CHAT', 'CHIP', 'CHOP',
  'CITE', 'CITY', 'CLAD', 'CLAM', 'CLAN', 'CLAP', 'CLAW', 'CLAY', 'CLUB', 'CLUE',
  'COAL', 'COAT', 'COCK', 'CODE', 'COIL', 'COIN', 'COLD', 'COMB', 'COME', 'CONE',
  'COOK', 'COOL', 'COPE', 'COPY', 'CORD', 'CORE', 'CORK', 'CORN', 'COST', 'COSY'
];

const DEFAULT_COLOR = '#3b82f6';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Generate a random 4-letter code for cards */
const generateCardCode = () => CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} str - Input string to sanitize
 * @returns {string} Sanitized string
 */
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validate required fields for card creation/update
 * @param {object} data - Data to validate
 * @param {string[]} required - Required field names
 * @returns {string|null} Error message or null if valid
 */
const validateRequired = (data, required) => {
  for (const field of required) {
    if (!data[field]) {
      return `${field} is required`;
    }
  }
  return null;
};

// ============================================
// APP SETUP
// ============================================

const app = express();

// Configure CORS
// NOTE: Default '*' is fine for self-hosted home lab use (no auth, local network).
// For production exposed to the web, set CORS_ORIGIN env var to your domain.
// When accessed via nginx reverse proxy, CORS doesn't matter (browser only talks to nginx).
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

async function initDb() {
  const SQL = await initSqlJs();
  let db;
  
  if (fs.existsSync(CONFIG.DB_PATH)) {
    const buffer = fs.readFileSync(CONFIG.DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS lanes (
      id TEXT PRIMARY KEY,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (board_id) REFERENCES boards(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lane_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#3b82f6',
      assigned_to TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lane_id) REFERENCES lanes(id)
    )
  `);
  
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

  // Seed default board if empty
  const boardCount = db.exec("SELECT COUNT(*) as count FROM boards");
  if (boardCount.length === 0 || boardCount[0].values[0][0] === 0) {
    db.run("INSERT INTO boards (name) VALUES (?)", [CONFIG.BOARD_NAME]);
    const boardId = db.exec("SELECT last_insert_rowid() as id")[0].values[0][0];
    
    DEFAULT_LANES.forEach((title, idx) => {
      const laneId = title.toLowerCase().replace(/\s+/g, '-');
      db.run('INSERT INTO lanes (id, board_id, title, position) VALUES (?, ?, ?, ?)', 
        [laneId, boardId, title, idx]);
    });
    
    saveDb(db);
  }
  
  return db;
}

function saveDb(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(CONFIG.DB_PATH, buffer);
}

let db;

app.use(cors(corsOptions));
app.use(express.json({ limit: LIMITS.REQUEST_SIZE }));

// Generate a new random card code
app.get('/api/generate-code', (req, res) => {
  res.json({ code: generateCardCode() });
});

// Get all boards
app.get('/api/boards', (req, res) => {
  const stmt = db.prepare('SELECT * FROM boards');
  const boards = [];
  while (stmt.step()) boards.push(stmt.getAsObject());
  stmt.free();
  res.json(boards);
});

// Update board name
app.patch('/api/boards/:id', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  
  db.run('UPDATE boards SET name = ? WHERE id = ?', [name, parseInt(req.params.id)]);
  saveDb(db);
  
  res.json({ success: true, name });
});

// Get board with lanes and cards
app.get('/api/boards/:id', (req, res) => {
  const boardStmt = db.prepare('SELECT * FROM boards WHERE id = ?');
  boardStmt.bind([parseInt(req.params.id)]);
  if (!boardStmt.step()) return res.status(404).json({ error: 'Board not found' });
  const board = boardStmt.getAsObject();
  boardStmt.free();
  
  const lanesStmt = db.prepare('SELECT * FROM lanes WHERE board_id = ? ORDER BY position');
  lanesStmt.bind([parseInt(req.params.id)]);
  const lanes = [];
  while (lanesStmt.step()) lanes.push(lanesStmt.getAsObject());
  lanesStmt.free();
  
  const cardsStmt = db.prepare('SELECT * FROM cards ORDER BY position');
  const cards = [];
  while (cardsStmt.step()) cards.push(cardsStmt.getAsObject());
  cardsStmt.free();
  
  const subtasksStmt = db.prepare('SELECT * FROM subtasks ORDER BY position');
  const subtasks = [];
  while (subtasksStmt.step()) {
    const st = subtasksStmt.getAsObject();
    st.done = !!st.done;
    subtasks.push(st);
  }
  subtasksStmt.free();
  
  const cardsWithSubtasks = cards.map(card => ({
    ...card,
    subtasks: subtasks.filter(st => st.card_id === card.id)
  }));
  
  const lanesWithCards = lanes.map(lane => ({
    ...lane,
    cards: cardsWithSubtasks.filter(card => card.lane_id === lane.id)
  }));
  
  res.json({ ...board, lanes: lanesWithCards });
});

// Create card
app.post('/api/cards', (req, res) => {
  const { lane_id, title, description, color, assigned_to, tags, due_date } = req.body;
  
  // Validate required fields
  if (!lane_id || !title) {
    return res.status(400).json({ error: 'lane_id and title are required' });
  }
  
  // Limit input length
  const safeTitle = sanitize(title.substring(0, LIMITS.TITLE_MAX));
  const safeDesc = sanitize((description || '').substring(0, LIMITS.DESC_MAX));
  const safeTags = sanitize((tags || '').substring(0, LIMITS.TAG_MAX));
  const safeAssign = sanitize((assigned_to || '').substring(0, LIMITS.ASSIGN_MAX));
  const safeDueDate = due_date || '';
  
  const maxStmt = db.prepare('SELECT MAX(position) as max FROM cards WHERE lane_id = ?');
  maxStmt.bind([lane_id]);
  maxStmt.step();
  const maxPos = maxStmt.getAsObject().max || 0;
  maxStmt.free();
  
  db.run('INSERT INTO cards (lane_id, title, description, color, assigned_to, tags, due_date, position, code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [lane_id, safeTitle, safeDesc, color || DEFAULT_COLOR, safeAssign, safeTags, safeDueDate, maxPos + 1, generateCardCode()]);
  
  const idStmt = db.prepare('SELECT last_insert_rowid() as id');
  idStmt.step();
  const id = idStmt.getAsObject().id;
  idStmt.free();
  
  saveDb(db);
  
  const cardStmt = db.prepare('SELECT * FROM cards WHERE id = ?');
  cardStmt.bind([id]);
  cardStmt.step();
  const card = cardStmt.getAsObject();
  cardStmt.free();
  
  res.json(card);
});

// Update card
app.patch('/api/cards/:id', (req, res) => {
  const { title, description, color, lane_id, position, assigned_to, tags, code, due_date } = req.body;
  const cardId = parseInt(req.params.id);
  
  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }
  
  // Get current card
  const getStmt = db.prepare('SELECT * FROM cards WHERE id = ?');
  getStmt.bind([cardId]);
  if (!getStmt.step()) {
    getStmt.free();
    return res.status(404).json({ error: 'Card not found' });
  }
  const currentCard = getStmt.getAsObject();
  getStmt.free();
  
  const updates = [];
  const values = [];
  
  if (title !== undefined) { 
    updates.push('title = ?'); 
    values.push(sanitize(title.substring(0, LIMITS.TITLE_MAX))); 
  }
  if (description !== undefined) { 
    updates.push('description = ?'); 
    values.push(sanitize(description.substring(0, LIMITS.DESC_MAX))); 
  }
  if (color !== undefined) { updates.push('color = ?'); values.push(color); }
  if (lane_id !== undefined) { updates.push('lane_id = ?'); values.push(lane_id); }
  if (assigned_to !== undefined) { 
    updates.push('assigned_to = ?'); 
    values.push(sanitize(assigned_to.substring(0, LIMITS.ASSIGN_MAX))); 
  }
  if (tags !== undefined) { 
    updates.push('tags = ?'); 
    values.push(sanitize(tags.substring(0, LIMITS.TAG_MAX))); 
  }
  if (code !== undefined && code !== null) {
    updates.push('code = ?');
    values.push(sanitize(code.substring(0, LIMITS.CODE_MAX).toUpperCase()));
  }
  if (due_date !== undefined && due_date !== null) {
    updates.push('due_date = ?');
    values.push(due_date || '');
  }
  
  // Handle position and lane changes - recalculate positions
  const needsPositionRecalc = (lane_id !== undefined && lane_id !== currentCard.lane_id) || position !== undefined;
  
  if (needsPositionRecalc) {
    const newPos = parseInt(position || 1);
    const targetLane = lane_id || currentCard.lane_id;
    const oldLane = currentCard.lane_id;
    
    // If moving to different lane, clear old lane positions
    if (oldLane !== targetLane) {
      const oldStmt = db.prepare('SELECT id FROM cards WHERE lane_id = ? ORDER BY position');
      oldStmt.bind([oldLane]);
      let idx = 1;
      while (oldStmt.step()) {
        db.run('UPDATE cards SET position = ? WHERE id = ?', [idx, oldStmt.getAsObject().id]);
        idx++;
      }
      oldStmt.free();
    }
    
    // Get all cards in target lane ordered by position
    const laneCards = [];
    const stmt = db.prepare('SELECT id FROM cards WHERE lane_id = ? ORDER BY position');
    stmt.bind([targetLane]);
    while (stmt.step()) laneCards.push(stmt.getAsObject());
    stmt.free();
    
    // Insert card at new position and reorder
    let found = false;
    laneCards.forEach((c, idx) => {
      let newPosition = idx + 1;
      if (!found && newPosition >= newPos) {
        newPosition = newPosition + 1;
      }
      if (c.id === cardId) {
        newPosition = newPos;
        found = true;
      }
      db.run('UPDATE cards SET position = ? WHERE id = ?', [newPosition, c.id]);
    });
    
    // Update lane_id if changed
    if (lane_id !== undefined && lane_id !== currentCard.lane_id) {
      db.run('UPDATE cards SET lane_id = ? WHERE id = ?', [lane_id, cardId]);
    }
    
    saveDb(db);
    
    const cardStmt = db.prepare('SELECT * FROM cards WHERE id = ?');
    cardStmt.bind([cardId]);
    cardStmt.step();
    const card = cardStmt.getAsObject();
    cardStmt.free();
    
    return res.json(card);
  }
  
  // No position recalculation needed - simple update
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  
  values.push(cardId);
  db.run(`UPDATE cards SET ${updates.join(', ')} WHERE id = ?`, values);
  saveDb(db);
  
  const cardStmt = db.prepare('SELECT * FROM cards WHERE id = ?');
  cardStmt.bind([cardId]);
  cardStmt.step();
  const card = cardStmt.getAsObject();
  cardStmt.free();
  
  res.json(card);
});

// Delete card
app.delete('/api/cards/:id', (req, res) => {
  db.run('DELETE FROM cards WHERE id = ?', [parseInt(req.params.id)]);
  saveDb(db);
  res.json({ success: true });
});

// Get subtasks for a card
app.get('/api/cards/:cardId/subtasks', (req, res) => {
  const stmt = db.prepare('SELECT * FROM subtasks WHERE card_id = ? ORDER BY position');
  stmt.bind([parseInt(req.params.cardId)]);
  const subtasks = [];
  while (stmt.step()) {
    const st = stmt.getAsObject();
    st.done = !!st.done;
    subtasks.push(st);
  }
  stmt.free();
  res.json(subtasks);
});

// Create subtask
app.post('/api/cards/:cardId/subtasks', (req, res) => {
  const { title } = req.body;
  const cardId = parseInt(req.params.cardId);
  
  if (!title || !cardId) {
    return res.status(400).json({ error: 'title and cardId are required' });
  }
  
  const safeTitle = sanitize(title.substring(0, LIMITS.SUBTASK_MAX));
  
  const maxStmt = db.prepare('SELECT MAX(position) as max FROM subtasks WHERE card_id = ?');
  maxStmt.bind([cardId]);
  maxStmt.step();
  const maxPos = maxStmt.getAsObject().max || 0;
  maxStmt.free();
  
  db.run('INSERT INTO subtasks (card_id, title, position) VALUES (?, ?, ?)',
    [cardId, safeTitle, maxPos + 1]);
  
  const idStmt = db.prepare('SELECT last_insert_rowid() as id');
  idStmt.step();
  const id = idStmt.getAsObject().id;
  idStmt.free();
  
  saveDb(db);
  
  const stmt = db.prepare('SELECT * FROM subtasks WHERE id = ?');
  stmt.bind([id]);
  stmt.step();
  const subtask = stmt.getAsObject();
  subtask.done = !!subtask.done;
  stmt.free();
  
  res.json(subtask);
});

// Update subtask
app.patch('/api/subtasks/:id', (req, res) => {
  const { title, done, position } = req.body;
  const subtaskId = parseInt(req.params.id);
  
  const updates = [];
  const values = [];
  
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (done !== undefined) { updates.push('done = ?'); values.push(done ? 1 : 0); }
  if (position !== undefined) { updates.push('position = ?'); values.push(position); }
  
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  
  values.push(subtaskId);
  db.run(`UPDATE subtasks SET ${updates.join(', ')} WHERE id = ?`, values);
  saveDb(db);
  
  const stmt = db.prepare('SELECT * FROM subtasks WHERE id = ?');
  stmt.bind([subtaskId]);
  stmt.step();
  const subtask = stmt.getAsObject();
  subtask.done = !!subtask.done;
  stmt.free();
  
  res.json(subtask);
});

// Delete subtask
app.delete('/api/subtasks/:id', (req, res) => {
  db.run('DELETE FROM subtasks WHERE id = ?', [parseInt(req.params.id)]);
  saveDb(db);
  res.json({ success: true });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  db = await initDb();
  app.listen(CONFIG.PORT, () => {
    console.log(`Kanban API running on port ${CONFIG.PORT}`);
  });
}

start();
