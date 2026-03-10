# Making of: NixBoard

## The Goal
Build a collaborative task board with:
- Standard Kanban columns (Backlog, In Progress, Done, Blocked)
- Add/edit/delete cards
- Color customization
- API access for n8n automation

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Browser    │ ←→  │  nginx      │ ←→  │  Express    │
│  (Vue.js)   │     │  (proxy)    │     │  + SQLite   │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Frontend**: Vue.js 3 (single HTML file, CDN-loaded)
- **Backend**: Express.js + sql.js (pure JS SQLite)
- **Database**: SQLite file (`kanban.db`)
- **Deployment**: Docker Compose

## Files Created

### 1. docker-compose.yml
```yaml
version: "3.8"
services:
  frontend:
    image: nginx:alpine
    volumes:
      - ./frontend:/usr/share/nginx/html:ro
    ports:
      - "3035:80"
  backend:
    image: node:20
    volumes:
      - ./backend:/app
    ports:
      - "3036:3000"
    command: sh -c "npm install && mkdir -p data && node src/index.js"
```

### 2. Backend (Express + SQLite)

**package.json** - Dependencies only:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sql.js": "^1.10.2",
    "cors": "^2.8.5"
  }
}
```

**src/index.js** - Key parts:

```javascript
// Database init with sql.js (pure JS, no native deps)
const SQL = await initSqlJs();
let db = new SQL.Database();

// Create tables
db.run(`CREATE TABLE boards (...);
         CREATE TABLE lanes (...);
         CREATE TABLE cards (...);`);

// Seed default board
db.run("INSERT INTO boards (name) VALUES (?)", ['Nix & Dirk Todos']);

// API Endpoints
app.get('/api/boards/:id', ...)
app.post('/api/cards', ...)
app.patch('/api/cards/:id', ...)
app.delete('/api/cards/:id', ...)
```

### 3. Frontend (Vue.js 3)

Single HTML file with inline Vue:

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>

<div id="app">
  <div class="lane" v-for="lane in board.lanes" :key="lane.id">
    <!-- cards -->
  </div>
</div>

<script>
const { createApp, ref, reactive, onMounted } = Vue;

createApp({
  setup() {
    const board = reactive({ lanes: [] });
    
    const loadBoard = async () => {
      const data = await api('/api/boards/1');
      board.lanes = data.lanes || [];
    };
    
    return { board };  // ← IMPORTANT: return reactive object, not copied value
  }
}).mount('#app');
</script>
```

## Key Decisions

### Why sql.js instead of better-sqlite3 or sqlite3?
- Both require native compilation → fails on Alpine/ARM
- sql.js is pure JavaScript → works everywhere
- Slight performance hit, but fine for this use case

### Why separate containers?
- Simpler debugging
- Frontend can be swapped (React, Svelte, etc.)
- Backend can be scaled separately

## Troubleshooting Log

### Issue 1: better-sqlite3 won't load
```
TypeError: Cannot open database because the directory does not exist
```
**Cause**: Alpine image missing build tools for native module
**Fix**: Switched to sql.js

### Issue 2: sql.js wrong path
```
ENOENT: no such file or directory '/app/src/data/kanban.db'
```
**Cause**: Used `__dirname` which resolved to `/app/src`
**Fix**: Hardcoded path to `/app/data/kanban.db`

### Issue 3: Vue not showing data
**Cause**: Returned `lanes: board.lanes` which captured empty array value at return time, not reactive reference
**Fix**: Use `board.lanes` directly in template

### Issue 4: API calls returning 404
**Cause**: Frontend called `/api/cards` but nginx proxy adds `/api` prefix
**Fix**: Updated frontend to call full path `/api/cards`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/boards | List boards |
| GET | /api/boards/:id | Get board with lanes/cards |
| POST | /api/cards | Create card |
| PATCH | /api/cards/:id | Update card |
| DELETE | /api/cards/:id | Delete card |

### Example: Create Card
```bash
curl -X POST http://kanban.asbach-games.fritz.box/api/cards \
  -H "Content-Type: application/json" \
  -d '{"lane_id":"backlog","title":"Test task","color":"#ef4444"}'
```

### Example: Move Card
```bash
curl -X PATCH http://kanban.asbach-games.fritz.box/api/cards/1 \
  -H "Content-Type: application/json" \
  -d '{"lane_id":"in-progress"}'
```

## URLs
- **Frontend**: http://kanban.asbach-games.fritz.box
- **API**: http://kanban.asbach-games.fritz.box/api/

## Implemented Features ✅
- [x] Drag-and-drop between lanes
- [x] Subtasks
- [x] User assignment
- [x] Due dates
- [x] 8 themes (including Darth Mode & Chrome with DeLorean)
- [x] Card codes (4-letter handles)
- [x] Backup/Restore (export/import JSON)
- [x] Security hardening (XSS, SQL injection protection)

---

## Session: 2026-03-06 - Agent Review & Bugfix

### Participants
- **Dirk** - Product Owner, Captain
- **Nix** - AI First Officer
- **ArchBot** - Architecture reviewer
- **DesignBot** - UX reviewer  
- **RefactorBot** - Code quality reviewer
- **QABot** - QA reviewer

### Agenda
1. Agent walkthrough of board content (card-level)
2. Agent walkthrough of code (implementation-level)
3. Fix critical bugs found

### Issues Found

#### Board Content Review
- CLAW card overdue (due 2026-02-20)
- COIL blocked by decision needed
- LILAC/XENO need verification

#### Code Review Results

**Frontend Issues:**
- Single 34KB HTML file getting unwieldy
- Error handling via alert() - poor UX
- No tests

**Backend Issues:**
- CODE_WORDS duplicated (18 vs 39 words)
- **CRITICAL**: Subtask CRUD endpoints missing!
- **CRITICAL**: sql.js stmt.run() called with spread args instead of array - silent failure!

### Fixes Applied

1. **Subtask CRUD** - Added full REST API:
   - POST /api/cards/:cardId/subtasks
   - PATCH /api/subtasks/:id
   - DELETE /api/subtasks/:id

2. **Card Move Fix** - Fixed stmt.run parameter format in cards.js:
   - Changed `stmt.run(...values)` → `stmt.run(values)`

3. **CODE_WORDS** - Synced to cards.js (39 words)

### New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/cards/:cardId/subtasks | Create subtask |
| PATCH | /api/subtasks/:id | Update subtask |
| DELETE | /api/subtasks/:id | Delete subtask |

### Lessons Learned
- sql.js stmt.run() expects array, not spread
- Frontend can call endpoints that don't exist - always verify API
- Agent code reviews find real bugs!



---

## Session: 2026-03-10 - UI Polish & Archive (v0.9)

### Participants
- **Dirk** - Product Owner, Captain
- **Nix** - AI First Officer

### Agenda
1. Fix Archive button (showArchive not defined error)
2. Implement Archive as overlay instead of inline view
3. Style modals to match current theme
4. Improve header button visibility

### Issues Found

1. **Archive Toggle Error**
   - Error: `ReferenceError: showArchive is not defined`
   - Cause: Functions defined outside Vue setup() scope
   - Fix: Moved toggleArchive, restoreCard, deleteArchivedCard inside setup()

2. **Archive View Style**
   - Was rendering below board as inline div
   - User expected overlay/modal
   - Fix: Created .archive-overlay with backdrop blur and slide-in animation

3. **Modal Theme Colors**
   - Always showed purple gradient regardless of theme
   - Cause: Modal doesn't exist in DOM until clicked, setTheme couldn't find it
   - Fix: Use CSS variables (--modal-bg, --modal-text) set on documentElement

4. **Header Buttons**
   - All in one row, tiny icons
   - Fix: Split into two rows, larger buttons with labels

### Changes Applied

1. **Archive Overlay**
   - Added .archive-overlay CSS with fixed positioning
   - Backdrop blur effect
   - Slide-in animation from top
   - Close via × button, ESC key, or clicking outside

2. **Theme-Aware Modals**
   - Extended themes object with modal gradient
   - CSS variables for dynamic theming
   - Each theme has unique modal background

3. **Header Redesign**
   - Two rows: themes (top), tools (bottom)
   - 18px emoji buttons with white background
   - Tool buttons show labels: "💾 Save", "📥 Load", "📦 Archive"
   - Hover scale effect (1.15x)

### New Features Summary (v0.9)
- [x] Archive overlay with theme styling
- [x] Modal overlay with backdrop blur
- [x] Theme-aware modal colors
- [x] ESC key to close archive
- [x] Two-row header with visible buttons
- [x] YouTube tag filtering

### Lessons Learned
- Vue refs defined in setup() can't be accessed from global scope
- CSS variables are better than direct DOM manipulation for theming
- CSS backdrop-filter creates nice overlay effects
