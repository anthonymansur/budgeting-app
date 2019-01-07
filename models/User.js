const mongoose = require("mongoose");
const { Schema } = mongoose;

const Wallet = require("./Wallet");

const userSchema = new Schema({
  googleId: String,
  facebookId: String,
  emails: Object,
  display_name: String,
  display_tutorial: {
    type: Boolean,
    default: true
  },
  date_joined: Date
});

module.exports = mongoose.model("User", userSchema);
