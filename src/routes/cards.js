// Card routes
const CODE_WORDS = ['SPAR', 'LILAC', 'GALE', 'CLAW', 'STAR', 'BOLD', 'COIL', 'CORN', 'ZEST', 'COME', 'NOVA', 'CODE', 'PREF', 'VEX', 'XENO', 'FERN', 'MEDI', 'BURY', 'WIKI', 'BLAZE', 'FLUX', 'GLINT', 'HAZE', 'IVY', 'JADE', 'KITE', 'LUNA', 'MIST', 'ONYX', 'PEARL', 'QUartz', 'RUNE', 'SHIMMER', 'TIDE', 'UMBRA', 'VAULT', 'WAVE', 'YARN', 'ZEPHYR'];

const generateUniqueCardCode = (db) => {
  const usedCodes = [];
  const stmt = db.prepare('SELECT code FROM cards');
  while (stmt.step()) {
    usedCodes.push(stmt.getAsObject().code);
  }
  stmt.free();
  
  const available = CODE_WORDS.filter(c => !usedCodes.includes(c));
  if (available.length === 0) {
    throw new Error('No more available codes - please expand CODE_WORDS');
  }
  return available[Math.floor(Math.random() * available.length)];
};

const isCodeUnique = (db, code, excludeCardId = null) => {
  const stmt = excludeCardId 
    ? db.prepare('SELECT COUNT(*) as count FROM cards WHERE code = ? AND id != ?')
    : db.prepare('SELECT COUNT(*) as count FROM cards WHERE code = ?');
  const params = excludeCardId ? [code, excludeCardId] : [code];
  stmt.bind(params);
  stmt.step();
  const result = stmt.getAsObject().count;
  stmt.free();
  return result === 0;
};

module.exports = (db) => {
  const express = require('express');
  const router = express.Router();
  
  // Get all cards
  router.get('/', (req, res) => {
    try {
      const cards = [];
      const stmt = db.prepare('SELECT * FROM cards ORDER BY lane_id, position');
      while (stmt.step()) {
        cards.push(stmt.getAsObject());
      }
      stmt.free();
      res.json(cards);
    } catch(e) {
      console.error('Error fetching cards:', e);
      res.status(500).json({ error: e.message });
    }
  });
  
  // Create card
  router.post('/', (req, res) => {
    const { title, description, color, lane_id, tags, code } = req.body;
    
    // Validate code uniqueness if provided
    if (code && !isCodeUnique(db, code)) {
      return res.status(400).json({ error: `Code "${code}" is already in use` });
    }
    
    // Get max position
    const maxStmt = db.prepare('SELECT MAX(position) as max FROM cards WHERE lane_id = ?');
    maxStmt.bind([lane_id]);
    maxStmt.step();
    const maxPos = maxStmt.getAsObject().max || 0;
    maxStmt.free();
    
    const cardCode = code || generateUniqueCardCode(db);
    const stmt = db.prepare('INSERT INTO cards (title, description, color, lane_id, position, code, tags) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run([title, description || '', color || '#3b82f6', lane_id, maxPos + 1, cardCode, tags || '']);
    stmt.free();
    
    const newCard = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    res.json({ id: newCard, code: cardCode, lane_id, position: maxPos + 1 });
  });
  
  // Update card
  router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate code uniqueness if code is being changed
    if (updates.code && !isCodeUnique(db, updates.code, id)) {
      return res.status(400).json({ error: `Code "${updates.code}" is already in use` });
    }
    
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    values.push(id);
    
    const stmt = db.prepare(`UPDATE cards SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(values);
    stmt.free();
    
    res.json({ success: true });
  });
  
  // Delete card
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    // Delete subtasks first
    const delSubtasks = db.prepare('DELETE FROM subtasks WHERE card_id = ?');
    delSubtasks.run([id]);
    delSubtasks.free();
    
    const stmt = db.prepare('DELETE FROM cards WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    
    res.json({ success: true });
  });
  
  // Archive card
  router.post('/:id/archive', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE cards SET archived = 1, archived_at = datetime("now") WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    res.json({ success: true });
  });
  
  // Unarchive card
  router.post('/:id/unarchive', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE cards SET archived = 0, archived_at = NULL WHERE id = ?');
    stmt.run([id]);
    stmt.free();
    res.json({ success: true });
  });
  
  // Get archived cards
  router.get('/archived', (req, res) => {
    try {
      const cards = [];
      const stmt = db.prepare('SELECT * FROM cards WHERE archived = 1 ORDER BY archived_at DESC');
      while (stmt.step()) {
        cards.push(stmt.getAsObject());
      }
      stmt.free();
      res.json(cards);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });
  
  return router;
};
