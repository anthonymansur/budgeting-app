const User = require("../models/User");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = app => {
  app.get("/api/wallets", async (req, res) => {
    try {
      const wallets = await Wallet.find({ user_id: req.user.id });
      res.json({
        success: true,
        items: [wallets]
      });
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
        message: e.message
      });
    }
  });
  app.post("/api/wallets", async (req, res) => {
    try {
      const category = req.body.category;
      const percentage = req.body.percentage;
      const wallet = new Wallet({ category, percentage, user_id: req.user.id });
      await wallet.save();
      res.json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
        message: e.message
      });
    }
  });
  app.put("/api/wallets", async (req, res) => {
    try {
      const wallet_id = ObjectId(req.body.wallet_id);
      const update = req.body.update;
      const wallet = await Wallet.findById(wallet_id);
      await wallet.update(update);
      res.json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.delete("/api/wallets", async (req, res) => {
    try {
      const walletId = ObjectId(req.query.id);
      await Wallet.findByIdAndDelete(walletId);
      res.json({
        success: true
      });
    } catch (e) {
      console.log(e);
      res.json({
        success: false,
        message: e.message
      });
    }
  });
};
