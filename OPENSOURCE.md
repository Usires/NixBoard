# Open Source Release - NixBoard v0.6.0

## Current Status: Released on GitHub! 🚀

**Repository:** https://github.com/Usires/NixBoard

## What Makes It Portable

### 1. Remove Hardcoded Values
- [x] Board name configurable via API
- [x] Default lanes → via API
- [ ] Remove "Nix & Dirk" branding from UI (optional)

### 2. Environment-Based Config
```yaml
# docker-compose.yml
environment:
  - BOARD_NAME=My Project Board
  - DEFAULT_LANES=Backlog,In Progress,Done
  - API_BASE_URL=http://localhost:3036
```

### 3. Current Repository Structure
```
kanban/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
├── makingof_kanban.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── index.html          # Frontend (Vue.js)
├── index.js            # Backend (Express + SQLite)
└── backend/
    ├── package.json
    └── src/
        └── index.js
```

## Release Checklist

- [x] Remove hardcoded "Nix & Dirk" references
- [x] Add `.env.example` with configurable options
- [x] Add CONTRIBUTING.md
- [x] Add `.gitignore`
- [x] Test clean `git clone && docker-compose up`
- [x] Create GitHub repo
- [x] Push and announce!

## Version History

### v0.6.0 - Darth Mode Release (Current)
- Darth Mode theme (dark with red accents)
- Due dates with color coding
- Quick delete with confirmation
- 8 themes total
