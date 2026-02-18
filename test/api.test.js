/**
 * NixBoard API Tests
 * Run with: npm test
 */
const request = require('supertest');
const path = require('path');

// Load the Express app
const app = require('./index.js');

describe('Kanban API', () => {
  let testCardId;

  // Test GET /api/boards/:id
  describe('GET /api/boards/:id', () => {
    it('should return board with lanes', async () => {
      const res = await request(app).get('/api/boards/1');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('lanes');
    });
  });

  // Test POST /api/cards
  describe('POST /api/cards', () => {
    it('should create a new card', async () => {
      const res = await request(app)
        .post('/api/cards')
        .send({ lane_id: 'backlog', title: 'Test Card' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      testCardId = res.body.id;
    });
  });

  // Test DELETE /api/cards/:id
  describe('DELETE /api/cards/:id', () => {
    it('should delete a card', async () => {
      // First create a card
      const createRes = await request(app)
        .post('/api/cards')
        .send({ lane_id: 'backlog', title: 'To Delete' });
      const cardId = createRes.body.id;

      // Then delete it
      const res = await request(app).delete(`/api/cards/${cardId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  // Test card update
  describe('PATCH /api/cards/:id', () => {
    it('should update a card', async () => {
      const createRes = await request(app)
        .post('/api/cards')
        .send({ lane_id: 'backlog', title: 'Original' });
      const cardId = createRes.body.id;

      const res = await request(app)
        .patch(`/api/cards/${cardId}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  // Cleanup
  afterAll(async () => {
    if (testCardId) {
      await request(app).delete(`/api/cards/${testCardId}`);
    }
  });
});
