require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// API routes (same in local and production)
app.use('/api/properties', require('./routes/properties'));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Production only: serve the built React app from client/dist
if (isProd) {
  const dist = path.join(__dirname, '../client/dist');
  app.use(express.static(dist));
  // send every non-API route to React so /property/:id works on refresh
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nrg_realty')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT} (${isProd ? 'production' : 'development'})`)
    );
  })
  .catch((e) => {
    console.error('MongoDB connection failed:', e.message);
    process.exit(1);
  });
