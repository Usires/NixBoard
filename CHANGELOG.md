# Changelog - NixBoard

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
