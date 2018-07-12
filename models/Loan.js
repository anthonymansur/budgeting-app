const mongoose = require('mongoose');
const { Schema } = mongoose;

const loanSchema = new Schema({
  amount: Number,
  recipient: String,
  donor: String,
  type: {
    type: String,
    enum: ['donated', 'received']
  },
  paid: {
    type: Boolean
  },
  date: Date,
  description: String,
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model('Loan', loanSchema);