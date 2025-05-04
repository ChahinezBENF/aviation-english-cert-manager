require('dotenv').config();
const mongoose = require('./db/conn'); // Use your existing connection
const User = require('./models/user'); // Import User model
const Airport = require('./models/airport'); // Import Airport model

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Airport.deleteMany({});

    // Add airports
    const airportData = [
      {
        code: 'KJFK',
        name: 'John F. Kennedy International Airport',
        location: { city: 'New York', country: 'USA' },
        controllers: [],
        pilots: [],
      },
      {
        code: 'LHR',
        name: 'London Heathrow Airport',
        location: { city: 'London', country: 'UK' },
        controllers: [],
        pilots: [],
      },
    ];
    const airports = await Airport.insertMany(airportData);
    //To check
    console.log('Airports seeded:', airports);

    // Add users
    const userData = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'jhon_1234', 
        role: 'controller',
        certification: {
          level: 4,
          dateIssued: new Date('2024-01-01'), // Matches the successful testDate
          expiresOn: new Date('2026-01-01'),
          certificateUrl: 'https://example.com/certificate.pdf',
        },
        airportCode: 'KJFK',
        testHistory: [
          { testDate: new Date('2023-11-11'), resultLevel: 3 }, // Failed test
          { testDate: new Date('2024-01-01'), resultLevel: 4 }, // Passed test
        ],
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'jane_1234', 
        role: 'pilot',
        certification: {
          level: 5,
          dateIssued: new Date('2018-01-01'), // Matches the successful testDate
          expiresOn: new Date('2024-01-01'),
          certificateUrl: 'https://example.com/certificate2.pdf',
        },
        airportCode: 'LHR',
        testHistory: [
          { testDate: new Date('2018-01-01'), resultLevel: 5 }, // Passed test
          { testDate: new Date('2025-05-01'), resultLevel: 2 }, // Failed test
        ],
      },
    ];
    const users = await User.insertMany(userData);
    //To check
    console.log('Users seeded:', users);

     // Link users to their respective airports
     const airportUpdates = await Promise.all(
      users.map(async (user) => {
        const airport = airports.find((a) => a.code === user.airportCode);
        if (user.role === 'controller') {
          airport.controllers.push(user._id);
        } else if (user.role === 'pilot') {
          airport.pilots.push(user._id);
        }
        return airport.save();
      })
    );
    // To check
    console.log('Airports updated with user references:', airportUpdates);

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
