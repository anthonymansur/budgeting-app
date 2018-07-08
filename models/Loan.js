const mongoose = require('mongoose');
const { Schema } = mongoose;

const loanSchema = new Schema({
  amount: Number,
  loan_recipient: String,
  loan_donor: String,
  type: {
    type: String,
    enum: ['donated', 'received']
  },
  status: {
    type: String,
    enum: ["paid", "not_paid", "forgiven"]
  },
  date: Date,
  description: String,
  user_id:{
    type: mongoose.Schema.ObjectId,
    ref: "User"
  } 
});

module.exports = mongoose.model('Loan', loanSchema);