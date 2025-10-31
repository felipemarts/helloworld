const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Hello World endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello World! v-2' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(port, () => {
  console.log(`Hello World API listening on port ${port}`);
});
