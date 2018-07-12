const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  access_token: String,
  item_id: String,
  metadata: Object,
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model('Item', itemSchema);