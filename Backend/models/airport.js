const mongoose = require('mongoose');
const User = require('./user'); // Import the User model

const AirportSchema = new mongoose.Schema({
  code: {type: String, required: true,  unique: true, maxlength: 4, },// ICAO airport codes are typically 4 characters
  name: {type: String, required: true, },
  location: {
    city: {type: String, required: true,},
    country: {type: String, required: true,}, },
  controllers: [ 
                {type: mongoose.Schema.Types.ObjectId,
                 ref: 'User',// Reference to the User collection 
                },],
  pilots: [
          {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User collection
          },],
}, 
{
  toJSON: {
    transform: (doc, ret) => {
      // Remove internal fields
      delete ret.__v;

      // Reorder fields
      return {
        _id: ret._id,
        code: ret.code,
        name: ret.name,
        location: ret.location,
        controllers: ret.controllers,
        pilots: ret.pilots,
        createdAt: ret.createdAt,
        updatedAt: ret.updatedAt,
      };
    },
  },
});




module.exports = mongoose.model('Airport', AirportSchema);
