const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); //bcrypt hash the password


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

//hash passwords.

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.index({ airportCode: 1 }); // Index for airportCode

module.exports = mongoose.model('User', UserSchema);
