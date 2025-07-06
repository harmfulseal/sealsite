const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const countFile = path.join(__dirname, 'viewcount.txt');

// Initialize view count file if not exists
if (!fs.existsSync(countFile)) {
  fs.writeFileSync(countFile, '5248', 'utf8');
}

// Helper to read view count
function getViewCount() {
  const count = fs.readFileSync(countFile, 'utf8');
  return parseInt(count, 10);
}

// Helper to write view count
function setViewCount(count) {
  fs.writeFileSync(countFile, count.toString(), 'utf8');
}

// Endpoint to get current view count
app.get('/api/viewcount', (req, res) => {
  const count = getViewCount();
  res.json({ count });
});

const rateLimitMap = new Map();

// Endpoint to increment view count
app.post('/api/viewcount/increment', (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  const lastTime = rateLimitMap.get(ip) || 0;
  const RATE_LIMIT_MS = 60 * 1000; // 1 minute

  if (now - lastTime < RATE_LIMIT_MS) {
    // Within rate limit window, do not increment
    const count = getViewCount();
    return res.json({ count, message: 'Rate limit exceeded' });
  }

  // Outside rate limit window, increment count
  let count = getViewCount();
  count++;
  setViewCount(count);
  rateLimitMap.set(ip, now);
  res.json({ count });
});

app.use((req, res, next) => {
  console.log(`Request for: ${req.url}`);
  next();
});

// Serve main HTML file at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'sealsite.html'));
});

app.use('/html', express.static(path.join(__dirname, 'html')));
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
