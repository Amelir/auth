const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  issued: {
    type: Date,
    default: Date.now,
    required: true
  },
  expires: Date,
  lastAccessed: Date
}, {
  _id: false
});