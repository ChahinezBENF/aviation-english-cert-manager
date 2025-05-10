require('dotenv').config();
const User = require('../models/user');
const Airport = require('../models/airport');
const bcrypt = require('bcrypt');

// Controller logic
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

exports.createUser = async (req, res) => {
  try {

    const newUser = new User(req.body);
    const savedUser = await newUser.save();
   
    // Update airport arrays for controller or pilot roles
    if (savedUser.airportCode) {
      const updateField = savedUser.role === 'controller' ? 'controllers' : 'pilots';
     
      await Airport.findOneAndUpdate(
        { code: savedUser.airportCode },
        { $addToSet: { [updateField]: savedUser._id } }
      );
    }

    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });


    const updateData = { ...req.body };

    // Handle nested fields for certification
    if (req.body.certificationLevel) {
      updateData['certification.level'] = req.body.certificationLevel;
      delete updateData.certificationLevel;
    }
    if (req.body.certificationDateIssued) {
      updateData['certification.dateIssued'] = req.body.certificationDateIssued;
      delete updateData.certificationDateIssued;
    }
    if (req.body.certificateUrl) {
      updateData['certification.certificateUrl'] = req.body.certificateUrl;
      delete updateData.certificateUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Update airport arrays for controllers or pilots
    if (updatedUser.airportCode) {
      const roleField = updatedUser.role === 'controller' ? 'controllers' : 'pilots';

      // Remove the user from the old airport array if airportCode changed
      if (user.airportCode && user.airportCode !== updatedUser.airportCode) {
        await Airport.findOneAndUpdate(
          { code: user.airportCode },
          { $pull: { [roleField]: user._id } }
        );
      }

      // Add the user to the new airport array
      await Airport.findOneAndUpdate(
        { code: updatedUser.airportCode },
        { $addToSet: { [roleField]: updatedUser._id } }
      );
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Error updating user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove the user from the airport's array (controllers or pilots)
    if (user.airportCode) {
      const roleField = user.role === 'controller' ? 'controllers' : 'pilots';
      await Airport.findOneAndUpdate(
        { code: user.airportCode },
        { $pull: { [roleField]: user._id } }
      );
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

