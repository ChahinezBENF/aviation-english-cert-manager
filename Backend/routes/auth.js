const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });

     if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    //////////////////////////
    res.json({
      id: user._id,  // Make sure `_id` is sent in response
      email: user.email,
      role: user.role,
      token: token
    });

  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
