const express = require('express');
const cors = require('cors');
const path = require('path');

const CONFIG = {
  PORT: process.env.PORT || 3000,
  DB_PATH: process.env.DB_PATH || '/app/data/kanban.db',
};

const { initDb } = require('./src/services/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Initialize database and start server
initDb().then(db => {
  // Import routes
  const boardsRouter = require('./src/routes/boards')(db);
  const cardsRouter = require('./src/routes/cards')(db);
  
  // Mount routes
  app.use('/api/boards', boardsRouter);
  app.use('/api/cards', cardsRouter);
  
  // Generate code endpoint
  const CODE_WORDS = ['SPAR', 'LILAC', 'GALE', 'CLAW', 'STAR', 'BOLD', 'COIL', 'CORN', 'ZEST', 'COME', 'NOVA', 'CODE', 'PREF', 'VEX', 'XENO', 'FERN', 'MEDI', 'BURY'];
  app.get('/api/generate-code', (req, res) => {
    const code = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
    res.json({ code });
  });
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  
  app.listen(CONFIG.PORT, () => {
    console.log(`NixBoard API running on port ${CONFIG.PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
