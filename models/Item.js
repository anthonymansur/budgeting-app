const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  access_token: String,
  item_id: String,
  metadata: Object,
  user_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User"
  },
  active: {
    type: Boolean,
    default: true
  },
  update_required: {
    type: Boolean,
    default: false
  },
  public_token: {
    type: Object,
    default: null
  }
});

module.exports = mongoose.model('Item', itemSchema);