const mongoose = require('mongoose');
const { Schema } = mongoose;

const walletSchema = new Schema({
  category: String,
  percentage: Number,
  user_id:{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  color: String
});

module.exports = mongoose.model('Wallet', walletSchema);