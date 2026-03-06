# Changelog - NixBoard

## [0.8.2] - 2026-02-25 - UX Improvements Release

---

## [0.8.3] - 2026-03-06 - Agent Review & Bugfix Release

### Added
- **Subtask CRUD Endpoints** - Complete REST API for subtask management
  - POST /api/cards/:cardId/subtasks - Create subtask
  - PATCH /api/subtasks/:id - Update subtask (title, done, position)
  - DELETE /api/subtasks/:id - Delete subtask

### Fixed
- **Manual Card Move Persistence** - Fixed sql.js stmt.run parameter format
  - Changed from spread to array format - this was a silent failure!
- **Missing Subtask Endpoints** - Frontend was calling non-existent endpoints
  - Added full subtask CRUD to backend
  - Code synced to /home/dirk/nixboard/

### Refactored
- CODE_WORDS unified in cards.js (39 words now)

### Security Notes
- No auth - still suitable for local/homelab use only

---

## [0.8.2.1] - 2026-03-06 - Agent Code Review

### Agent Walkthrough Results

#### Architecture (archbot)
- Frontend: Vue 3 via CDN, SortableJS, single 34KB HTML file
- Backend: Express plus sql.js, file-based SQLite

#### Code Quality (designbot)
- Creative theming system (9 themes)
- Smooth drag-drop

#### Refactoring (refactorbot) - Critical Findings
- CODE_WORDS duplicated (index.js vs cards.js) - FIXED
- Missing subtask CRUD endpoints - FIXED
- No transactions, no indexes, no migrations

#### QA (qabot)
- No tests
- Error handling via alert - poor UX


### Added
- **Sticky Lane Headers** - Lane headers now stay visible when scrolling
- **Fixed Add Card Button** - "+" button moved to lane header, separate from draggable cards
- **Board Title Persistence** - Title now saves to database correctly

### Fixed
- **Export Endpoint** - Was calling wrong path (/api/export → /api/boards/export)
- **Favicon** - Added favicon.svg
- **Board Title API** - Fixed PATCH endpoint to accept both 'title' and 'name' fields
- **Load Board** - Fixed frontend to read data.title (not data.name)
- **Card Descriptions** - Now properly saved and loaded from database

### Changed
- **Padding** - Reduced top padding from 80px to 20px
- **Design** - Improved card colors (left border), IBM Plex Sans fonts, muted gradients
- **Sticky Headers** - Added semi-transparent background for better visibility

---

## [0.8.1] - 2026-02-25 - Bugfix Release

### Fixed
- Board title now persists correctly to database
- Frontend: Fixed data.title → boardTitle mapping
- Backend: Accepts both 'title' and 'name' fields for compatibility
- MD Explorer: Fixed API port (3036 → 3038)

---

## [0.8.0] - 2026-02-25 - Clean Code Release

### Added
- **Clean Code Refactor** - Backend architecture overhaul
  - Split monolithic index.js into src/routes/ and src/services/
  - New src/services/db.js - Database initialization
  - New src/routes/boards.js - Board endpoints
  - New src/routes/cards.js - Card endpoints
- **Filter System (CORN)** - Card filtering by title and tags
  - Filter bar below board title
  - Searches both title and tags
  - Hidden card counter
- **Agent Review System** - Three AI agents for code quality
  - RefactorBot (Clean Code)
  - ArchBot (Clean Architecture)
  - DesignBot (UX/UI)

### Changed
- **UI Improvements**
  - Typography: IBM Plex Sans (distinctive, no system fallbacks)
  - Gradient: Muted colors (less "AI purple")
  - Cards: Left border color indicator instead of top bar
  - Card hover: Lift effect with transform
  - Theme buttons: Increased to 14px, 1.2x hover scale
- **Backend**
  - Fixed PATCH /api/boards/:id endpoint
  - Board title now persists to database
  - Better error handling in routes
- **Security**
  - MD Explorer: Improved path validation (isAllowedPath)
  - Added .env file for secrets

### Fixed
- MD Explorer API port (3036 → 3038)
- Backend DB path resolution
- Duplicate MD routes removed

---

## [0.7.0] - 2026-02-19 - Galaxy Release

### Added
- **Galaxy Theme** - New theme with warp drive star animation
  - Deep purple/space gradient background
  - 100 animated stars warping outward (Windows 3.1 screensaver style)
  - Purple glow accents
  - Light lavender text
- **Theme Tooltips** - Hover over theme buttons to see names
- **AGENTS.md** - New AI agent integration guide
  - Card codes explanation
  - Example curl commands
  - Agent configuration tips

### Changed
- **Footer Text** - Changed to white for better readability on all themes
- **Darth Theme** - Updated with dark red accent gradient
- **Theme Buttons** - Uniform styling (removed special Chrome/Darth button styles)
- **Default Lanes** - Now uppercase: BACKLOG, IN PROGRESS, DONE, BLOCKED

---

## [0.6.0] - 2026-02-18 - Darth Mode Release

### Added
- **Darth Mode Theme** - Dark theme with red accents
  - Black/deep purple gradient background
  - Red glow effects
  - Red tagline "I find your lack of faith disturbing"
- **Due Dates** - Date field for cards with color coding
  - Green: not due yet
  - Yellow: due today
  - Red: overdue
- **Quick Delete** - Trash icon on cards (visible on hover)
  - Delete requires confirmation
- **Backup/Restore** - Export/import board data as JSON
  - API: GET /api/export, POST /api/import
  - UI buttons: 💾 export, 📥 import
- **Improved Gradient Animation** - Faster (8s) diagonal animation

### Security
- Added CORS security note to code (explaining * is OK for self-hosted)

---

## [0.5.0] - 2026-02-18 - Beta Release

### Added
- **NixBoard Branding** - Renamed from "Kanban Board" to "NixBoard"
- **Agent-friendly** - Designed for AI assistants like OpenClaw
- **Faster Theme Animation** - 8s animation (was 15s), 600% gradient (was 400%)
- **Card Codes** - 140 unique 4-letter memorable handles (Easter egg: 88 mph = 140 km/h Delorean speed!)
  - API endpoint: `GET /api/generate-code`
  - Frontend button to regenerate codes
  - Codes displayed on cards and in edit modal
- **Chrome Theme** - Back to the Future themed
  - Red/orange/gold gradient cycling
  - DeLorean time machine animation (drives across header every 5-10 min)
  - Time flash effect when car disappears
- **Clean Code Refactoring**
  - Constants grouped in CONFIG and LIMITS objects
  - No more magic numbers
  - JSDoc comments on utility functions
  - Single source of truth (CODE_WORDS only in backend)

### Fixed
- **Position Persistence** - Drag-and-drop now correctly saves card positions
- **Duplicate Codes** - Fixed error when updating cards without code field

### Security
- All user inputs sanitized (XSS prevention)
- Parameterized SQL queries
- Request size limits
- Configurable CORS

---

## [Unreleased] - Refactoring Round 1

### Fixed

#### High Priority (Security)
1. ✅ **SQL Injection** - UPDATE queries now properly validate card ID
2. ✅ **XSS Prevention** - Added input sanitization for title, description, tags, assigned_to
3. ✅ **CORS** - Added configurable CORS with environment variable support

#### Medium Priority (UX/Performance)
4. ✅ **Loading States** - Added loading indicator to UI
5. ✅ **Error Handling** - API shows alert on failure, added global error handler
6. ✅ **Input Validation** - Added length limits and required field validation

### Code Quality Issues Found

#### Frontend (index.html)

1. **Magic Numbers**
   - `window.scrollY > 50` - scroll threshold hardcoded
   - `300` - glow timeout hardcoded
   - `setTimeout(() => titleInput.value?.focus(), 0)` - focus delay
   
2. **Duplicate Code**
   - `const theme = themes[currentTheme.value]` appears twice (setup and onMounted)
   - Theme colors duplicated in multiple places

3. **Missing Error Handling**
   - API calls don't show user-friendly error messages
   - No loading states during API calls

4. **Vue Best Practices**
   - Direct DOM manipulation with `document.querySelector` instead of Vue refs
   - Should use `ref()` for theme elements instead of `document.querySelector`

5. **CSS Organization**
   - Styles mixed inline and in `<style>` block
   - Some unused classes may exist

6. **Security**
   - No input sanitization for tags (XSS potential when displaying)
   - No rate limiting on API calls

#### Backend (index.js)

1. **SQL Injection Risk**
   - Using string interpolation in SQL queries: `db.run('UPDATE ... SET ${updates.join...}')`
   - Should use parameterized queries throughout

2. **Error Handling**
   - Generic error messages
   - No logging to file
   - SQLite errors not gracefully handled

3. **Security**
   - No authentication/authorization
   - No input validation (length limits, sanitization)
   - No CORS configuration (allows all origins)

4. **Performance**
   - Database saved after every write (could batch)
   - No indexes on frequently queried columns (lane_id, position)
   - Full board load fetches all cards every time

5. **Missing Features**
   - No API for lanes CRUD
   - No pagination for large boards
   - No backup/restore functionality

### Recommended Fixes (Priority Order)

#### High Priority
- [x] Add input sanitization for tags/description (XSS prevention)
- [x] Fix SQL query construction (use parameterized queries)
- [x] Add CORS configuration

#### Medium Priority  
- [x] Add Vue refs for DOM elements instead of document.querySelector
- [x] Add loading states to UI
- [x] Add API error handling with user feedback

#### Low Priority
- [x] Extract magic numbers to constants ✅
- [ ] Add database indexes for performance
- [ ] Implement pagination for large boards

---

## [1.0.0] - 2026-02-17

### Added
- Drag-and-drop between lanes (SortableJS)
- Subtasks support (create, toggle, delete)
- User assignment to cards
- Tags/labels for cards
- Color coding for cards
- Editable board title (persists to backend)
- 6 gradient themes (Purple, Ocean, Sunset, Forest, Fire, Ashes)
- Theme switcher buttons in header
- Frosted glass effect on header boxes
- Two-layer sticky headers
- Colored lane headers
- Glow effect on card drop
- Footer with credits and tech stack
- Hourly Kanban monitor cron job
- Morning report and bedtime reminder on Telegram
- Open source documentation (README, LICENSE, CONTRIBUTING)

### Technical Details
- Frontend: Vue.js 3 (single HTML file, CDN-loaded)
- Backend: Express.js + sql.js (SQLite)
- Deployment: Docker Compose

---

## [0.1.0] - 2026-02-16

### Added
- Initial Kanban board with 4 lanes (Backlog, In Progress, Done, Blocked)
- Basic card CRUD operations
- SQLite database persistence
- Docker Compose setup

---

## [0.8.3] - 2026-03-06 - Agent Review & Bugfix Release

### Added
- **Subtask CRUD Endpoints** - Complete REST API for subtask management
  - POST /api/cards/:cardId/subtasks - Create subtask
  - PATCH /api/subtasks/:id - Update subtask (title, done, position)
  - DELETE /api/subtasks/:id - Delete subtask

### Fixed
- **Manual Card Move Persistence** - Fixed sql.js stmt.run() parameter format (array vs spread)
  - Changed from  to  - this was a silent failure!
- **Missing Subtask Endpoints** - Frontend was calling non-existent subtask endpoints
  - Added full subtask CRUD to backend
  - Code synced to /home/dirk/nixboard/

### Refactored
- CODE_WORDS unified in cards.js (39 words now)

### Security Notes
- No auth - still suitable for local/homelab use only
- Basic auth (COME) still on roadmap for external exposure

---

## [0.8.2.1] - 2026-03-06 - Agent Code Review

### Agent Walkthrough Results

#### Architecture (archbot)
- Frontend: Vue 3 via CDN, SortableJS, single 34KB HTML file
- Backend: Express + sql.js, file-based SQLite
- Multiple boards already has unused board_id column in schema
- No auth, hardcoded board_id=1

#### Code Quality (designbot)
- Creative theming system (9 themes)
- Smooth drag-drop
- Single file getting unwieldy - recommend proper Vue build

#### Refactoring (refactorbot) - Critical Findings
- CODE_WORDS duplicated (index.js 18 words, cards.js 39 words) - FIXED
- Missing subtask CRUD endpoints - FIXED
- No transactions, no indexes, no migrations
- No input validation

#### QA (qabot)
- No tests
- Edge cases not handled
- Error handling via alert() - poor UX
