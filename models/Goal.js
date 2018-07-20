const mongoose = require("mongoose");
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
  status: {
    type: String,
    enum: ["not_met", "met", "redeemed"],
    default: "not_met"
  },
  transfers: [
    {
      amount: Number,
      wallet_id: {
        type: mongoose.Schema.ObjectId,
        ref: "Wallet"
      },
      date: Date
    }
  ],
  auto_payment: {
    type: String,
    enum: ["on", "off"],
    default: "off"
  },
  wallet_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Wallet"
  }
});

module.exports = mongoose.model("Goal", goalSchema);
