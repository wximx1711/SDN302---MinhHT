const express = require('express');
const { errorHandler } = require('./middleware/errors');
const app = express();
app.use(express.json({ limit: '100kb' }));
app.get('/', (req, res) => res.json({
  message: 'Library Management API is running',
  endpoints: [
    'GET /api/books', 'GET /api/book/:id', 'GET /api/books/:id',
    'POST /api/books', 'PUT /api/books/:id', 'DELETE /api/books/:id',
    'GET /api/members', 'GET /api/members/:id', 'POST /api/members',
    'PUT /api/members/:id', 'DELETE /api/members/:id',
    'GET /api/loans', 'GET /api/loans/members/:memberID', 'POST /api/loans',
    'PUT /api/loans/:id/return'
  ]
}));
app.use('/api', require('./routes'));
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);
module.exports = app;
