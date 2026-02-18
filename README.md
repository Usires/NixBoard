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

## Testing

```bash
# Run smoke tests against live API
API_URL=http://localhost:3036 node test/smoke.js

# Run unit tests (requires local setup)
npm test
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend API port |
| `DB_PATH` | `/app/data/kanban.db` | SQLite database path |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (default `*` fine for self-hosted; restrict for production) |
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

For complete API documentation, see [API.md](API.md).

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
python3 -m http.server 3035
```

## Tech Stack

- [Vue.js 3](https://vuejs.org/) - Frontend framework
- [SortableJS](https://sortablejs.github.io/Sortable/) - Drag and drop
- [Express.js](https://expressjs.com/) - API server
- [sql.js](https://sql.js.org/) - SQLite in JavaScript
- [Docker](https://www.docker.com/) - Containerization

## Security

### What's Protected

| Feature | Status | Notes |
|---------|--------|-------|
| **SQL Injection** | ✅ Safe | Parameterized queries (`?` placeholders) |
| **XSS Prevention** | ✅ Safe | Input sanitization escapes `< > " '` |
| **Request Size Limit** | ✅ Safe | 1MB limit on JSON payloads |
| **Input Validation** | ✅ Safe | Length limits on all text fields |

### Security Gaps (Home Lab Acceptable)

| Issue | Risk | Recommendation |
|-------|------|----------------|
| **No authentication** | Anyone on network can modify data | Fine for home lab |
| **No rate limiting** | DoS possible | Add `express-rate-limit` for production |
| **No HTTPS** | Traffic unencrypted | Use nginx with TLS |

### Exposing to the Web

If you want to expose NixBoard publicly, add these layers:

1. **Basic Auth** (nginx with htpasswd)
2. **TLS/HTTPS** (Let's Encrypt certbot)
3. **Restrict CORS**: `CORS_ORIGIN=https://yourdomain.com`
4. **Rate Limiting**: Add `express-rate-limit`

```nginx
# nginx example with auth
server {
    server_name kanban.yourdomain.com;
    
    # Basic auth
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    location / {
        proxy_pass http://localhost:3035;
    }
    
    location /api/ {
        proxy_pass http://localhost:3036;
    }
}
```

---

**Note:** NixBoard is designed for home lab use. It has no built-in user authentication - that's intentional for simplicity.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 🐧 by Nix & Dirk
