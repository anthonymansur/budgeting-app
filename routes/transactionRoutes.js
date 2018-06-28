const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const Transaction = mongoose.model('Transaction');
const moment = require("moment-timezone");

const TIMEZONE = "America/New_York";

module.exports = (app) => {

  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await Transaction.find({user_id: req.user.id}).populate("wallet_id");
      res.json({
        success: true,
        items: [transactions]
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    const params = {
      type : req.body.type,
      description: req.body.description,
      amount: req.body.amount,
      user_id: req.user.id,
      wallet_id: req.body.wallet_id || null,
      date: moment(req.body.date).toDate()
    }
    const transaction = new Transaction(params);
    try {
      await transaction.save();
      res.json({
        success: true
      })
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      })
    }
  });

  app.put("/api/transactions", async (req, res) => {
    const params = {
      description: req.body.description,
      amount: req.body.amount,
      date: req.body.date, 
      wallet_id: req.body.wallet_id || null,
    }
    try {
      await Transaction.findByIdAndUpdate(req.body.transaction_id, params);
      res.json({
        success: true
      })
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      })
    }
  });

  app.delete("/api/transactions", async (req, res) => {
    console.log(req.query.id);
    const transactionId = ObjectId(req.query.id);
    try {
      await Transaction.findByIdAndDelete(transactionId);
      res.json({
        success: true
      })
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      })
    }
  })

};