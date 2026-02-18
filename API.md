# NixBoard API Reference

Complete REST API documentation for NixBoard.

## Base URL

```
http://localhost:3036/api
```

Or when using reverse proxy:
```
http://kanban.yourdomain.com/api
```

---

## Boards

### Get Board

```bash
GET /api/boards/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "My Project Board",
  "lanes": [
    {
      "id": "backlog",
      "title": "Backlog",
      "position": 0,
      "cards": [...]
    }
  ]
}
```

### Update Board Name

```bash
PATCH /api/boards/:id
Content-Type: application/json

{
  "name": "New Board Name"
}
```

---

## Cards

### Create Card

```bash
POST /api/cards
Content-Type: application/json

{
  "lane_id": "backlog",
  "title": "My task",
  "description": "Optional details",
  "color": "#3b82f6",
  "assigned_to": "Dirk",
  "tags": "frontend,bug"
}
```

### Update Card

```bash
PATCH /api/cards/:id
Content-Type: application/json

{
  "lane_id": "in-progress",
  "title": "Updated title",
  "description": "New description",
  "assigned_to": "Nix",
  "code": "BLAZE",
  "due_date": "2026-02-20"
}
```

### Move Card (Drag & Drop)

```bash
PATCH /api/cards/:id
Content-Type: application/json

{
  "lane_id": "done",
  "position": 1
}
```

### Delete Card

```bash
DELETE /api/cards/:id
```

**Response:**
```json
{
  "success": true
}
```

---

## Card Codes

### Generate Random Code

```bash
GET /api/generate-code
```

**Response:**
```json
{
  "code": "FROG"
}
```

---

## Subtasks

### Get Subtasks

```bash
GET /api/cards/:cardId/subtasks
```

**Response:**
```json
[
  {
    "id": 1,
    "card_id": 5,
    "title": "Step 1",
    "done": false,
    "position": 1
  }
]
```

### Create Subtask

```bash
POST /api/cards/:cardId/subtasks
Content-Type: application/json

{
  "title": "Step 1"
}
```

### Toggle Subtask

```bash
PATCH /api/subtasks/:id
Content-Type: application/json

{
  "done": true
}
```

### Delete Subtask

```bash
DELETE /api/subtasks/:id
```

---

## Error Responses

```json
{
  "error": "Error message here"
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `413` - Payload Too Large
- `500` - Server Error
