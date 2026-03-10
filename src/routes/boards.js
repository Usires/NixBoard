// Board routes
module.exports = (db) => {
  const express = require('express');
  const router = express.Router();
  
  // Get board with lanes and cards
  router.get('/:id', (req, res) => {
    // Get board title from DB or use default
    let boardTitle = 'NixBoard v0.8.2';
    try {
      const titleStmt = db.prepare('SELECT value FROM board_config WHERE key = ?');
      titleStmt.bind(['title']);
      if (titleStmt.step()) {
        boardTitle = titleStmt.getAsObject().value || boardTitle;
      }
      titleStmt.free();
    } catch(e) {
      // Table might not exist, use default
    }
    
    const board = { id: 1, title: boardTitle, lanes: [] };
    
    const lanesStmt = db.prepare('SELECT * FROM lanes ORDER BY position');
    while (lanesStmt.step()) {
      const lane = lanesStmt.getAsObject();
      lane.cards = [];
      
      const cardsStmt = db.prepare('SELECT * FROM cards WHERE lane_id = ? AND archived = 0 ORDER BY position');
      cardsStmt.bind([lane.id]);
      while (cardsStmt.step()) {
        const card = cardsStmt.getAsObject();
        // Get subtasks
        const subtasksStmt = db.prepare('SELECT * FROM subtasks WHERE card_id = ?');
        subtasksStmt.bind([card.id]);
        card.subtasks = [];
        while (subtasksStmt.step()) {
          card.subtasks.push(subtasksStmt.getAsObject());
        }
        subtasksStmt.free();
        lane.cards.push(card);
      }
      cardsStmt.free();
      board.lanes.push(lane);
    }
    lanesStmt.free();
    
    res.json(board);
  });
  
  // Update board
  router.patch('/:id', (req, res) => {
    const { title, name } = req.body;
    const newTitle = title || name; // Accept either 'title' or 'name' from frontend
    if (newTitle) {
      try {
        // Create config table if not exists
        db.run('CREATE TABLE IF NOT EXISTS board_config (key TEXT PRIMARY KEY, value TEXT)');
        db.run('INSERT OR REPLACE INTO board_config (key, value) VALUES (?, ?)', ['title', newTitle]);
        res.json({ success: true, title: newTitle });
      } catch(e) {
        res.status(500).json({ error: e.message });
      }
    } else {
      res.json({ success: true });
    }
  });
  
  // Export board
  router.get('/export', (req, res) => {
    const exportData = { lanes: [] };
    
    const lanesStmt = db.prepare('SELECT * FROM lanes ORDER BY position');
    while (lanesStmt.step()) {
      const lane = lanesStmt.getAsObject();
      lane.cards = [];
      
      const cardsStmt = db.prepare('SELECT * FROM cards WHERE lane_id = ? AND archived = 0 ORDER BY position');
      cardsStmt.bind([lane.id]);
      while (cardsStmt.step()) {
        const card = cardsStmt.getAsObject();
        card.subtasks = [];
        
        const subtasksStmt = db.prepare('SELECT * FROM subtasks WHERE card_id = ?');
        subtasksStmt.bind([card.id]);
        while (subtasksStmt.step()) {
          card.subtasks.push(subtasksStmt.getAsObject());
        }
        subtasksStmt.free();
        lane.cards.push(card);
      }
      cardsStmt.free();
      exportData.lanes.push(lane);
    }
    lanesStmt.free();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=nixboard-export.json');
    res.json(exportData);
  });
  
  return router;
};
