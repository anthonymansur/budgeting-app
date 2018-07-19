const mongoose = require('mongoose');
const { Schema } = mongoose;

const goalSchema = new Schema({
  amount: Number,
  start_date: Date,
  end_date: Date,
  name: String,
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  wallet_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Wallet"
  },
  status: {
    type: String,
    enum: ["not_met, met, redeemed"]
  },
  transfers: [{
    amount: Number,
    wallet_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Wallet"
    },
    date: Date
  }]
});

module.exports = mongoose.model('Goal', goalSchema);