const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const Bill = mongoose.model("Bill");

module.exports = app => {
  app.get("/api/bills", async (req, res) => {
    try {
      const bills = await Bill.find({ user_id: req.user.id });
      res.json({
        success: true,
        items: [bills]
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      console.log(req.body);
      const bill = await new Bill({ ...req.body, user_id: req.user._id });
      console.log(bill.name);
      await bill.save();
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

  app.put("/api/bills/:id", async (req, res) => {
    const id = ObjectId(req.params.id);
    try {
      const bill = await Bill.findByIdAndUpdate(id, { ...req.body });
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

  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const id = ObjectId(req.params.id);
      await Bill.findByIdAndDelete(id);
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
};
