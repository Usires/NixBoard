# NixBoard

A lightweight, self-hosted Kanban board built with Vue.js, Express, and SQLite. Designed for home lab use with n8n automation support. Agent-friendly for AI assistants like OpenClaw.

![Kanban Board](https://img.shields.io/badge/status-active-green) ![Vue.js 3](https://img.shields.io/badge/Vue.js-3.x-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 📋 **Drag-and-drop** cards between lanes
- 🏷️ **Card Codes** - 4-letter memorable handles (e.g., BLAZE, FROG) for easy task references in conversations
- ✅ **Subtasks** - Break down tasks into smaller steps
- 📅 **Due dates** - Set deadlines with color-coded warnings
- 👤 **User assignment** - Assign tasks to team members
- 🎨 **Color coding** - Visual organization with card colors
- 🎭 **8 Themes** - Purple, Ocean, Sunset, Forest, Fire, Ashes, Chrome, Darth
- 😈 **Darth Mode** - Dark theme with red accents and glow effects
- 🚗 **Chrome Theme** - Back to the Future DeLorean animation Easter egg!
- 🔌 **REST API** - Automate with n8n, curl, or any HTTP client
- 🐳 **Docker Compose** - One-command deployment

## Quick Start

```bash
# Clone or download this repo
git clone https://github.com/yourusername/nixboard.git
cd nixboard

# Start the services
docker-compose up -d

# Access the board
open http://localhost:3035
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend API port |
| `DB_PATH` | `/app/data/kanban.db` | SQLite database path |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `BOARD_NAME` | `My Project Board` | Default board name |

### Reverse Proxy (nginx)

Example nginx config for subdomain:

```nginx
server {
    server_name kanban.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3035;
    }
    
    location /api/ {
        proxy_pass http://localhost:3036;
    }
}
```

## API Reference

### Boards

```bash
# Get board with lanes and cards
GET /api/boards/1

# Response includes lanes, cards, subtasks, assignees, and card codes
```

### Cards

```bash
# Create card
POST /api/cards
{
  "lane_id": "backlog",
  "title": "My task",
  "description": "Details here",
  "color": "#3b82f6",
  "assigned_to": "Dirk",
  "tags": "frontend,bug"
}

# Update card
PATCH /api/cards/:id
{
  "lane_id": "in-progress",
  "description": "Updated description",
  "assigned_to": "Nix",
  "code": "BLAZE"
}

# Move card (drag-and-drop)
PATCH /api/cards/:id
{
  "lane_id": "done",
  "position": 1
}

# Delete card
DELETE /api/cards/:id
```

### Card Codes

```bash
# Generate a new random card code (4 letters)
GET /api/generate-code

# Response: {"code": "FROG"}
```

### Subtasks

```bash
# Get subtasks for card
GET /api/cards/:cardId/subtasks

# Add subtask
POST /api/cards/:cardId/subtasks
{
  "title": "Step 1"
}

# Toggle subtask
PATCH /api/subtasks/:id
{
  "done": true
}

# Delete subtask
DELETE /api/subtasks/:id
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Browser    │ ←→  │  nginx      │ ←→  │  Express    │
│  (Vue.js)   │     │  (proxy)    │     │  + SQLite   │
└─────────────┘     └─────────────┘     └─────────────┘
```

- **Frontend**: Vue.js 3 (single HTML file, CDN-loaded)
- **Backend**: Express.js + sql.js (pure JS SQLite)
- **Database**: SQLite file (persisted via Docker volume)

## n8n Integration

Example webhook payload for creating a card:

```json
{
  "lane_id": "backlog",
  "title": "{{ $json.title }}",
  "description": "{{ $json.description }}",
  "color": "#10b981"
}
```

## Development

```bash
# Local development (without Docker)
cd backend
npm install
PORT=3000 node src/index.js

# Frontend - serve with any static server
cd frontend
python3 -m http.server 3035
```

## Tech Stack

- [Vue.js 3](https://vuejs.org/) - Frontend framework
- [SortableJS](https://sortablejs.github.io/Sortable/) - Drag and drop
- [Express.js](https://expressjs.com/) - API server
- [sql.js](https://sql.js.org/) - SQLite in JavaScript
- [Docker](https://www.docker.com/) - Containerization

## Security Features

- Input sanitization (XSS prevention)
- Parameterized SQL queries
- Configurable CORS
- Request size limits

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 🐧 by Nix & Dirk
