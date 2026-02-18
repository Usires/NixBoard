/**
 * NixBoard Smoke Tests
 * Tests the live API endpoint
 * Run with: node test/smoke.js
 */

const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:3036';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data || '{}') });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 NixBoard Smoke Tests');
  console.log('========================\n');
  console.log(`Testing API: ${API_URL}\n`);

  let passed = 0;
  let failed = 0;

  // Test 1: Board loads
  try {
    const res = await request('GET', '/api/boards/1');
    if (res.status === 200 && res.body.name) {
      console.log('✅ GET /api/boards/1 - OK');
      passed++;
    } else {
      console.log('❌ GET /api/boards/1 - FAIL', res.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ GET /api/boards/1 - ERROR', e.message);
    failed++;
  }

  // Test 2: Create card
  let cardId;
  try {
    const res = await request('POST', '/api/cards', {
      lane_id: 'backlog',
      title: 'Smoke Test Card'
    });
    if (res.status === 200 && res.body.id) {
      cardId = res.body.id;
      console.log('✅ POST /api/cards - OK (id:', cardId + ')');
      passed++;
    } else {
      console.log('❌ POST /api/cards - FAIL', res.status);
      failed++;
    }
  } catch (e) {
    console.log('❌ POST /api/cards - ERROR', e.message);
    failed++;
  }

  // Test 3: Update card
  if (cardId) {
    try {
      const res = await request('PATCH', `/api/cards/${cardId}`, {
        title: 'Updated Test Card'
      });
      if (res.status === 200) {
        console.log('✅ PATCH /api/cards/:id - OK');
        passed++;
      } else {
        console.log('❌ PATCH /api/cards/:id - FAIL', res.status);
        failed++;
      }
    } catch (e) {
      console.log('❌ PATCH /api/cards/:id - ERROR', e.message);
      failed++;
    }
  }

  // Test 4: Delete card
  if (cardId) {
    try {
      const res = await request('DELETE', `/api/cards/${cardId}`);
      if (res.status === 200) {
        console.log('✅ DELETE /api/cards/:id - OK');
        passed++;
      } else {
        console.log('❌ DELETE /api/cards/:id - FAIL', res.status);
        failed++;
      }
    } catch (e) {
      console.log('❌ DELETE /api/cards/:id - ERROR', e.message);
      failed++;
    }
  }

  console.log('\n========================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
