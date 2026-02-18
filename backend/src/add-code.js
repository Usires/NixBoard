const initSqlJs = require('sql.js');
const fs = require('fs');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('/app/data/kanban.db'));
  
  try {
    db.run("ALTER TABLE cards ADD COLUMN code TEXT DEFAULT ''");
    console.log('Added code column');
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  // Generate codes for existing cards
  const WORDS = ['FROG', 'STAR', 'BOLD', 'WILD', 'ZEST', 'BLAZE', 'DREAM', 'ECHO', 'FERN', 'GALE', 'HARP', 'IVY', 'JADE', 'KITE', 'LUNA', 'MYTH', 'NOVA', 'OPAL', 'PYRE', 'QUIZ', 'RUNE', 'SPAR', 'TWIG', 'URSA', 'VEX', 'WISP', 'YARN', 'ZINC', 'AMBER', 'BASS', 'CLOUD', 'DUSK', 'EMBER', 'FLAKE', 'GLINT', 'HUSH', 'INKY', 'JOLT', 'KRILL', 'LILAC', 'MIST', 'NIMB', 'ONYX', 'PUFF', 'RIND', 'SHIM', 'TIDE', 'VANE', 'WAVE', 'XENO', 'YAWL', 'ZEN'];
  
  const stmt = db.prepare('SELECT id FROM cards');
  while (stmt.step()) {
    const id = stmt.getAsObject().id;
    db.run('UPDATE cards SET code = ? WHERE id = ?', [WORDS[Math.floor(Math.random() * WORDS.length)], id]);
  }
  stmt.free();
  
  fs.writeFileSync('/app/data/kanban.db', db.export());
  console.log('Done! Generated codes for all cards');
})();
