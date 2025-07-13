const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  sex: String,
  score: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);
