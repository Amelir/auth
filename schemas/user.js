const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  hash: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const User = module.exports = mongoose.model('Users', UserSchema);