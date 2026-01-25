const express = require('../universal-web-app/node_modules/express');
const path = require('path');

const app = express();
const publicPath = path.resolve(__dirname, '../universal-web-app/public');

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files from public directory
app.use(express.static(publicPath));

// Serve index.html for all routes (SPA)
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const port = 3000;
app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
  console.log('Serving from', publicPath);
});