const request = require('supertest');
const app = require('../index');

describe('BH Ouvidoria API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('GET /map returns FeatureCollection', async () => {
    const res = await request(app).get('/map');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('type', 'FeatureCollection');
    expect(Array.isArray(res.body.features)).toBe(true);
  });
});
