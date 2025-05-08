require('dotenv').config();
const mongoose = require('./db/conn'); 
const User = require('./models/user'); // Import User model
const Airport = require('./models/airport'); // Import Airport model
const bcrypt = require('bcrypt');

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Airport.deleteMany({});

    // Add airports
    const airportData = [
      {
        code: 'JFK',
        name: 'John F. Kennedy International Airport',
        location: { city: 'New York', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'KLAX',
        name: 'Los Angeles International Airport',
        location: { city: 'Los Angeles', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'ORD',
        name: 'O’Hare International Airport',
        location: { city: 'Chicago', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'ATL',
        name: 'Hartsfield-Jackson Atlanta International Airport',
        location: { city: 'Atlanta', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'DFW',
        name: 'Dallas/Fort Worth International Airport',
        location: { city: 'Dallas/Fort Worth', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'DEN',
        name: 'Denver International Airport',
        location: { city: 'Denver', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'SFO',
        name: 'San Francisco International Airport',
        location: { city: 'San Francisco', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'SEA',
        name: 'Seattle-Tacoma International Airport',
        location: { city: 'Seattle', country: 'USA' },
        controllers: [],
        pilots: [],
      },
    ];
    const airports = await Airport.insertMany(airportData);

    // Add users with hashed passwords
    const userData = await Promise.all([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('jhon_1234', 10), // Hashing password
        role: 'controller',
        certification: {
          level: 4,
          dateIssued: new Date('2024-01-01'), // Matches the successful testDate
          expiresOn: new Date('2026-01-01'),
          certificateUrl: 'https://example.com/certificate.pdf',
        },
        airportCode: 'JFK',
        testHistory: [
          { testDate: new Date('2023-11-11'), resultLevel: 3 }, // Failed test
          { testDate: new Date('2024-01-01'), resultLevel: 4 }, // Passed test
        ],
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('jane_1234', 10), // Hashing password
        role: 'pilot',
        certification: {
          level: 5,
          dateIssued: new Date('2018-01-01'), // Matches the successful testDate
          expiresOn: new Date('2024-01-01'),
          certificateUrl: 'https://example.com/certificate2.pdf',
        },
        airportCode: 'KLAX',
        testHistory: [
          { testDate: new Date('2018-01-01'), resultLevel: 5 }, // Passed test
          { testDate: new Date('2025-05-01'), resultLevel: 2 }, // Failed test
        ],
      },
      {
        name: 'HR Admin',
        email: 'hr.admin@example.com',
        password: await bcrypt.hash('hr_password', 10), // Hashed password
        role: 'hr', // Assign HR role
        certification: null, // Not needed for HR
        airportCode: null, // Not tied to a specific airport
        testHistory: [], // No test history for HR
      },
    ]);

    const users = await User.insertMany(userData);

     // Link users to their respective airports
     const airportUpdates = await Promise.all(
      users.map(async (user) => {
        const airport = airports.find((a) => a.code === user.airportCode);
        if (airport) {
          if (user.role === 'controller') {
            airport.controllers.push(user._id);
          } else if (user.role === 'pilot') {
            airport.pilots.push(user._id);
          }
          return airport.save();
        }
        if (user.role !== 'hr'){
        throw new Error(`No matching airport found for code: ${user.airportCode}`);
      }
      })
    );

    // Close the connection
    mongoose.connection.close();
    console.log('Seeding completed and connection closed.');
  } catch (error) {
    console.error('Error during seeding:', error);
    mongoose.connection.close();
  }
};

// Run the seeding function
seedData();
