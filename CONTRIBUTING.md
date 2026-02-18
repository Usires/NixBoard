# Contributing to NixBoard

Welcome! This project aims to be a simple, self-hosted Kanban board for home labs.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/Usires/NixBoard.git
cd home-kanban

# Start with Docker
docker-compose up -d

# Or develop locally
cd backend && npm install && PORT=3000 node src/index.js
cd frontend && python3 -m http.server 3035
```

## Project Structure

- `index.html` - Single-page Vue.js app (frontend)
- `index.js` - Express API server (backend)
- `backend/src/migrate.js` - Database migrations

## Making Changes

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Make your changes
4. Test locally
5. Commit with clear messages
6. Push and open a PR

## Code Style

- Keep the frontend as a single HTML file (simplicity!)
- Use vanilla Vue.js 3 Composition API
- Backend: plain Express.js, no TypeScript needed
- Database: sql.js (SQLite in JavaScript)

## API First

This project is designed with an API-first approach. New features should have clear REST endpoints that n8n or other automation tools can use.

## Questions?

Open an issue for discussion before submitting PRs.
