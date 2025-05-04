require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.ATLAS_URI, { dbName: 'icao_management' })
  .then(() => console.log('Connected to MongoDB via Mongoose'))
  .catch((error) => console.error('MongoDB connection error:', error));

module.exports = mongoose;