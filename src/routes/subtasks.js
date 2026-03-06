// Subtask routes - returns Express router
module.exports = (db) => {
  const express = require('express');
  const router = express.Router();
  
  // POST /api/cards/:cardId/subtasks - Create subtask
  router.post('/cards/:cardId/subtasks', (req, res) => {
    try {
      const { cardId } = req.params;
      const { title } = req.body;
      
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      // Get max position for this card's subtasks
      const posStmt = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as nextPos FROM subtasks WHERE card_id = ?');
      posStmt.bind([parseInt(cardId)]);
      posStmt.step();
      const nextPos = posStmt.getAsObject().nextPos;
      posStmt.free();
      
      // Insert subtask (using array format for stmt.run)
      const stmt = db.prepare('INSERT INTO subtasks (card_id, title, done, position) VALUES (?, ?, 0, ?)');
      stmt.run([parseInt(cardId), title.trim(), nextPos]);
      stmt.free();
      
      // Get created subtask
      const getStmt = db.prepare('SELECT * FROM subtasks WHERE card_id = ? ORDER BY id DESC LIMIT 1');
      getStmt.bind([parseInt(cardId)]);
      getStmt.step();
      const subtask = getStmt.getAsObject();
      getStmt.free();
      
      res.json(subtask);
    } catch (error) {
      console.error('Error creating subtask:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // PATCH /api/subtasks/:id - Update subtask
  router.patch('/subtasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { title, done, position } = req.body;
      
      const updates = [];
      const params = [];
      
      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (done !== undefined) {
        updates.push('done = ?');
        params.push(done ? 1 : 0);
      }
      if (position !== undefined) {
        updates.push('position = ?');
        params.push(position);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      params.push(parseInt(id));
      
      const stmt = db.prepare('UPDATE subtasks SET ' + updates.join(', ') + ' WHERE id = ?');
      stmt.run(params);
      stmt.free();
      
      const getStmt = db.prepare('SELECT * FROM subtasks WHERE id = ?');
      getStmt.bind([parseInt(id)]);
      getStmt.step();
      const subtask = getStmt.getAsObject();
      getStmt.free();
      
      res.json(subtask);
    } catch (error) {
      console.error('Error updating subtask:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // DELETE /api/subtasks/:id - Delete subtask
  router.delete('/subtasks/:id', (req, res) => {
    try {
      const { id } = req.params;
      
      const stmt = db.prepare('DELETE FROM subtasks WHERE id = ?');
      stmt.run([parseInt(id)]);
      stmt.free();
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting subtask:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  return router;
};
