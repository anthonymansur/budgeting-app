const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletSchema = new Schema({
  category: String,
  percentage: Number,
  color: String,
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model('Wallet', walletSchema);