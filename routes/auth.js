const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../midleware/auth_midleware');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { email, fullName, password, age, sex } = req.body;
  try {
    // Vérifie si un utilisateur avec le même e-mail existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Un compte avec cet e-mail existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      fullName,
      password: hashedPassword,
      age,
      sex,
    });

    res.status(201).json({ message: 'Utilisateur créé', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Score
router.put('/score/:id', async (req, res) => {
  const { score } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { score }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Score updated', score: user.score });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get User Profile with Score (protected)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
