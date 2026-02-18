const initSqlJs = require('sql.js');
const fs = require('fs');

(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('/app/data/kanban.db'));
  
  const lanes = [];
  const ls = db.prepare('SELECT id FROM lanes');
  while (ls.step()) lanes.push(ls.getAsObject().id);
  ls.free();
  
  lanes.forEach(laneId => {
    // Order by existing position first, then by ID to break ties
    const cards = [];
    const cs = db.prepare('SELECT id FROM cards WHERE lane_id = ? ORDER BY COALESCE(position, 999999), id');
    cs.bind([laneId]);
    while (cs.step()) cards.push(cs.getAsObject().id);
    cs.free();
    
    cards.forEach((id, idx) => {
      db.run('UPDATE cards SET position = ? WHERE id = ?', [idx + 1, id]);
    });
    console.log(laneId + ': ' + cards.length + ' cards fixed');
  });
  
  fs.writeFileSync('/app/data/kanban.db', db.export());
  console.log('All positions fixed!');
})();
