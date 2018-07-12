const mongoose = require('mongoose');
const { Schema } = mongoose;

const Wallet = mongoose.model('Wallet');

function typeOfWallet (category)  {
  return Wallet.findOne({ category }) !== null;
};

const transactionSchema = new Schema({
  wallet_id: {
    type: mongoose.Schema.ObjectId,
    ref: "Wallet"
  },
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  type: {
    type: String,
    enum: ['add', 'remove']
  },
  amount: Number,
  description: String,
  date: Date,
  taxable: {
    type: Boolean,
    default: true
  },
  transaction_id: String,
  status: {
    type: String,
    enum: ["accepted", "declined", "pending"]
  }

});

module.exports = mongoose.model('Transaction', transactionSchema);