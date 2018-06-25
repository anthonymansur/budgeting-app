const mongoose = require('mongoose');
const { Schema } = mongoose;

const Wallet = require('./Wallet');

const userSchema = new Schema({
  googleId: String
});

module.exports = mongoose.model('User', userSchema);