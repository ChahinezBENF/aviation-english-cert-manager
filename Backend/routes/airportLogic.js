const Airport = require('../models/airport');
const User = require('../models/user');

// Controller logic
exports.getAllAirports = async (req, res) => {
  try {
    const airports = await Airport.find();
    res.status(200).json(airports);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching airports' });
  }
};

exports.createAirport = async (req, res) => {
  try {
    const newAirport = new Airport(req.body);
    const savedAirport = await newAirport.save();
    res.status(201).json(savedAirport);
  } catch (err) {
    res.status(500).json({ error: 'Error creating airport' });
  }
};

exports.getAirportById = async (req, res) => {
  try {
    const airport = await Airport.findById(req.params.id);
    if (!airport) return res.status(404).json({ error: 'Airport not found' });
    res.status(200).json(airport);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching airport' });
  }
};

exports.updateAirport = async (req, res) => {
  try {
    const { id } = req.params; // ID of the airport being updated
    const { code: newCode, ...otherFields } = req.body; // Extract code and other fields

    // Find the existing airport
    const existingAirport = await Airport.findById(id);
    if (!existingAirport) {
      return res.status(404).json({ error: 'Airport not found' });
    }

    const oldCode = existingAirport.code;

    // Update the airport
    const updatedAirport = await Airport.findByIdAndUpdate(
      id,
      { $set: { code: newCode, ...otherFields } },
      { new: true }
    );

    if (!updatedAirport) {
      return res.status(404).json({ error: 'Airport not found after update' });
    }

    // If the airport code was changed, update the users' airportCode
    if (oldCode && newCode && oldCode !== newCode) {
      const usersUpdated = await User.updateMany(
        { airportCode: oldCode },
        { $set: { airportCode: newCode } }
      );

    } else {
      res.status(200).json({ message: 'Airport updated'});
    }
  } catch (err) {
    res.status(500).json({ error: 'Error updating airport'});
  }
};

exports.deleteAirport = async (req, res) => {
  try {
    const deletedAirport = await Airport.findByIdAndDelete(req.params.id);
    if (!deletedAirport) return res.status(404).json({ error: 'Airport not found' });
    res.status(200).json({ message: 'Airport deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting airport' });
  }
};
