# Open Source Release Concept

## Repository Name

**NixBoard** - Agent-friendly Kanban for home labs

## What Makes It Portable

### 1. Remove Hardcoded Values
- [ ] Board name ("Nix & Dirk Todos") → configurable via env var
- [ ] Default lanes → configurable via JSON/env
- [ ] Remove "Nix & Dirk" branding from UI

### 2. Environment-Based Config
```yaml
# docker-compose.yml
environment:
  - BOARD_NAME=My Project Board
  - DEFAULT_LANES=Backlog,In Progress,Done
  - API_BASE_URL=http://localhost:3036
```

### 3. Multi-Board Support (Future)
- `/api/boards` - List all boards
- Create/delete boards via API
- Switch between boards in UI

### 4. Clean Repository Structure
```
kanban/
├── README.md
├── LICENSE
├── docker-compose.yml
├── .env.example
├── frontend/
│   └── index.html
└── backend/
    ├── package.json
    └── src/
        └── index.js
```

## Release Checklist

- [ ] Remove hardcoded "Nix & Dirk" references
- [ ] Add `.env.example` with configurable options
- [ ] Add CONTRIBUTING.md
- [ ] Add `.gitignore`
- [ ] Test clean `git clone && docker-compose up`
- [ ] Create GitHub repo
- [ ] Push and announce!

## Naming Decision

I'd vote for **`home-kanban`** - it's:
- Memorable
- Describes the target use case (home labs)
- Available on GitHub

## First Release (v1.0.0)

Features included:
- Drag-and-drop
- Subtasks
- User assignment
- Color coding
- REST API
- Docker Compose deployment

---
Want me to proceed with making it truly portable (removing hardcoded values)?
