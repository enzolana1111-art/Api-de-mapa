const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = './data/complaints.json';
const NEIGH_FILE = './data/neighborhoods.json';

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function loadNeighborhoods() {
  try {
    return JSON.parse(fs.readFileSync(NEIGH_FILE, 'utf8'));
  } catch (e) {
    return { type: 'FeatureCollection', features: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(express.static('frontend', { etag: false, maxAge: 0 }));
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/map', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const features = loadData();
  res.json({
    type: 'FeatureCollection',
    features
  });
});

app.get('/neighborhoods', (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json(loadNeighborhoods());
});

// Query: type, status, bbox=minLon,minLat,maxLon,maxLat, limit
app.get('/complaints', (req, res) => {
  const { type, status, bbox, limit } = req.query;
  let result = loadData();
  if (type) result = result.filter(f => f.properties.type === type);
  if (status) result = result.filter(f => f.properties.status === status);
  if (bbox) {
    const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
    result = result.filter(f => {
      const [lon, lat] = f.geometry.coordinates;
      return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
    });
  }
  if (limit) result = result.slice(0, Number(limit));
  res.json({
    type: 'FeatureCollection',
    features: result
  });
});

app.get('/complaints/:id', (req, res) => {
  const features = loadData();
  const f = features.find(x => x.properties.id === req.params.id);
  if (!f) return res.status(404).json({ error: 'Not found' });
  res.json(f);
});

app.post('/complaints', (req, res) => {
  const { geometry, properties } = req.body;
  if (!geometry || !properties) {
    return res.status(400).json({ error: 'geometry and properties required' });
  }
  const features = loadData();
  const id = uuidv4();
  const feature = {
    type: 'Feature',
    geometry,
    properties: {
      id,
      ...properties,
      created_at: new Date().toISOString()
    }
  };
  features.push(feature);
  try {
    saveData(features);
  } catch (e) {}
  res.status(201).json(feature);
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

module.exports = app;

