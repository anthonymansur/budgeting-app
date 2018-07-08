const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const Loan = mongoose.model("Loan");
const moment = require("moment-timezone");

const TIMEZONE = "America/New_York";

module.exports = app => {
  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await Loans.find({ user_id: req.user.id });
      res.json({
        success: true,
        items: [loans]
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.post("/api/loans", async (req, res) => {
    const params = {
      type: req.body.type,
      description: req.body.description,
      amount: req.body.amount,
      user_id: req.user.id,
      date: moment(req.body.date).toDate(),
    };
    const loan = new Loan(params);
    try {
      await loan.save();
      res.json({
        success: true
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.put("/api/loans", async (req, res) => {
    const params = {
      description: req.body.description,
      amount: req.body.amount,
      date: req.body.date,
    };
    try {
      await Loans.findByIdAndUpdate(req.body.loan_id, params);
      res.json({
        success: true
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.delete("/api/loans", async (req, res) => {
    console.log(req.query.id);
    const loanId = ObjectId(req.query.id);
    try {
      await Loan.findByIdAndDelete(loanId);
      res.json({
        success: true
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });
}