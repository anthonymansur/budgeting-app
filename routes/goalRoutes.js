const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const Goal = mongoose.model("Goal");

module.exports = app => {
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await Goal.find({ user_id: req.user.id });
      res.json({
        success: true,
        items: [goals]
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const goal = await new Goal({ ...req.body, user_id: req.user._id });
      await goal.save();
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

  app.put("/api/goals/:id", async (req, res) => {
    const id = ObjectId(req.params.id);
    try {
      const goal = await Goal.findByIdAndUpdate(id, { ...req.body });
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

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = ObjectId(req.params.id);
      await Goal.findByIdAndDelete(id);
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
