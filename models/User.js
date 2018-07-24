const mongoose = require('mongoose');
const { Schema } = mongoose;

const Wallet = require('./Wallet');

const userSchema = new Schema({
  googleId: String,
  facebookId: String,
  emails: Object
});

module.exports = mongoose.model('User', userSchema);