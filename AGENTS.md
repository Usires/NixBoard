# AI Agent Integration Guide

This guide explains how AI assistants can interact with NixBoard via its REST API.

## Quick Reference

**Board URL:** `http://localhost:3035` (or your deployed URL)  
**API Base:** `http://localhost:3036/api/`  
**Default Board ID:** `1`

> **Note:** Adjust the host/port to match your deployment (e.g., `kanban.yourdomain.com` or `192.168.x.x:3036`)

## Available Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List all cards | GET | `/api/boards/1` |
| Create card | POST | `/api/cards` |
| Update card | PATCH | `/api/cards/{id}` |
| Move card | PATCH | `/api/cards/{id}` with `lane_id` |
| Delete card | DELETE | `/api/cards/{id}` |
| List lanes | GET | `/api/boards/1` (includes lanes) |
| Generate card code | GET | `/api/generate-code` |

## Lane IDs
- `backlog` - Backlog
- `in-progress` - In Progress  
- `done` - Done
- `blocked` - Blocked

## Card Object

```json
{
  "id": 1,
  "lane_id": "backlog",
  "title": "My Task",
  "description": "Task details...",
  "color": "#3b82f6",
  "position": 1,
  "assigned_to": "Nix",
  "tags": "feature, urgent",
  "code": "BLAZE",
  "due_date": "2026-02-20",
  "subtasks": [
    { "id": 1, "title": "Step 1", "done": true },
    { "id": 2, "title": "Step 2", "done": false }
  ]
}
```

## Usage in Conversations

### Card Codes
Each card has a unique 4-letter code (e.g., BLAZE, FROG, SPAR). Use these for easy reference:
- "Move SPAR to Done"
- "What's the status of XENO?"

### Before Making Changes
Always check current board state first:
```bash
curl http://localhost:3036/api/boards/1
```

### API Examples

```bash
# List all cards
curl http://localhost:3036/api/boards/1

# Create a new card
curl -X POST http://localhost:3036/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "lane_id": "backlog",
    "title": "New feature",
    "description": "Add something cool",
    "color": "#10b981"
  }'

# Move card to another lane
curl -X PATCH http://localhost:3036/api/cards/5 \
  -H "Content-Type: application/json" \
  -d '{"lane_id": "done", "position": 1}'

# Delete a card
curl -X DELETE http://localhost:3036/api/cards/5

# Update card details
curl -X PATCH http://localhost:3036/api/cards/5 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "assigned_to": "Dirk"}'
```

## Themes

NixBoard supports multiple themes. The current themes are:
- Purple 🌌, Ocean 🌊, Sunset 🌅, Forest 🌲, Fire 🔥
- Ashes 💨, Chrome ⚡, Darth 🦇, Galaxy 🪐

## For Agent Configuration

When configuring an AI agent (e.g., OpenClaw, LangChain, etc.):

1. Set the **API base URL** to your NixBoard backend (e.g., `http://192.168.1.100:3036`)
2. Use **card codes** in natural language for reference
3. The agent should fetch board state before making changes
4. Parse the JSON response to find card IDs by code

### Example Agent Pseudocode

```javascript
async function moveCard(code, targetLane) {
  // 1. Get board state
  const board = await fetch('/api/boards/1');
  
  // 2. Find card by code
  const card = board.lanes.flatMap(l => l.cards)
    .find(c => c.code === code);
  
  // 3. Move it
  await fetch(`/api/cards/${card.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ lane_id: targetLane })
  });
}
```

---

*Part of NixBoard - github.com/Usires*
