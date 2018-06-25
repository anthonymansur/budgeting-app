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
  type: {
    type: String,
    enum: ['add', 'remove']
  },
  amount: Number,
  description: String,
  date: Date,
  user_id:{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);