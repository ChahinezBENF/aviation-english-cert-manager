require('dotenv').config();
const express = require('express');
const mongoose = require('./db/conn');
const methodOverride = require('method-override');
// Import route modules
const airportRoutes = require('./routes/airport');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Home route

app.get('/', (req, res) => {
  res.send('Welcome to the Aviation English Certification Manager API!');
});

// Routes
app.use('/airports', airportRoutes);
app.use('/users', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));