const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

// Serve static files from the "public" directory
app.use(express.static('public', { extensions: ['wav', 'mp3'] }));
app.use('/audio', express.static('public', { extensions: ['wav', 'mp3'], setHeaders: (res, filePath) => {
  res.setHeader('Content-Type', 'audio/*');
}));

// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Headers', 'Accept');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Length');
  res.setHeader('Access-Control-Allow-Headers', 'Accept-Encoding');
  res.setHeader('Access-Control-Allow-Headers', 'X-Accel-Buffering');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'identity');
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Handle audio requests
app.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  console.log(`Playing audio file: ${filename}`);
  res.sendFile(path.join(__dirname, 'public', filename));
});