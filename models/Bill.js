const mongoose = require("mongoose");
const { Schema } = mongoose;

const billSchema = new Schema({
  amount: Number,
  date: Date,
  name: String,
  is_reoccuring: Boolean,
  reoccuring_type: {
    type: String,
    enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "semi-annually", "annually"]
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  wallet_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Wallet"
  }
});

module.exports = mongoose.model("Bill", billSchema);
