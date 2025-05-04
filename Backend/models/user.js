const mongoose = require('mongoose');
const Airport = require('./airport'); // Import the Airport model

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  email: {type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: {type: String, required: true,},
  role: {type: String,
    enum: ['controller', 'pilot', 'hr'], // Role of the user
    default: 'controller',},
  certification: {
      level: { type: Number,   enum: [4, 5, 6], // ICAO certification levels
              required: function () {return this.role === 'controller' || this.role === 'pilot';},},
      dateIssued: { type: Date,},
      expiresOn: { type: Date },
      certificateUrl: { type: String,}, // URL for uploaded certificate
               },
  airportCode: {
    type: String, // Associated airport (ICAO code)
    required: function () { return this.role === 'controller' || this.role === 'pilot'; },
               },
  testHistory: [
    { testDate: {type: Date, },
      resultLevel: {type: Number,}, // Certification level achieved in the test   
    },],
},
{
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: {
    transform: (doc, ret) => {
      // Remove internal fields
      delete ret.__v;
      delete ret.password;

      // Reorder fields
      return {
        _id: ret._id,
        name: ret.name,
        email: ret.email,
        role: ret.role,
        certification: ret.certification,
        airportCode: ret.airportCode,
        testHistory: ret.testHistory,
        createdAt: ret.createdAt,
        updatedAt: ret.updatedAt,
      };
    },
  },

  
});

// Pre-save hook to calculate certification expiration date
//For creation
UserSchema.pre('save', function (next) {
  if (
    this.certification &&
    this.certification.dateIssued &&
    this.certification.level
  ) {
    const validityPeriods = { 4: 3, 5: 6, 6: 9 }; // Example: validity years by level
    const validityYears = validityPeriods[this.certification.level] || 0;
    this.certification.expiresOn = new Date(
      this.certification.dateIssued.getFullYear() + validityYears,
      this.certification.dateIssued.getMonth(),
      this.certification.dateIssued.getDate()
    );
  }
  next();
});

// Pre-save hook to calculate certification expiration date
//For update
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  if (update?.certification?.dateIssued) {
    // Extract dateIssued and level
    const dateIssued = new Date(update.certification.dateIssued);
    const level = update.certification.level || this.getFilter().certification?.level;

    if (dateIssued && level) {
      const validityPeriods = { 4: 3, 5: 6, 6: 9 }; // Years of validity by level
      const validityYears = validityPeriods[level] || 0;

      // Calculate expiresOn
      update.certification.expiresOn = new Date(
        dateIssued.getFullYear() + validityYears,
        dateIssued.getMonth(),
        dateIssued.getDate()
      );
    }
  }

  next();
});


// // Post-save hook to update the controllers array in Airport
// // For creation 
// UserSchema.post('save', async function (doc) {
//   if (doc.role === 'controller' && doc.airportCode) {
//     await Airport.findOneAndUpdate(
//       { code: doc.airportCode },
//       { $addToSet: { controllers: doc._id } } // Add the user ID to the controllers array
//     );
//   }
// });

// // Post-update hook to update the controllers array in Airport
// // For update
// UserSchema.post('findOneAndUpdate', async function (doc) {
//   if (doc && doc.role === 'controller' && doc.airportCode) {
//     await Airport.findOneAndUpdate(
//       { code: doc.airportCode },
//       { $addToSet: { controllers: doc._id } }
//     );
//   }
// });

module.exports = mongoose.model('User', UserSchema);
