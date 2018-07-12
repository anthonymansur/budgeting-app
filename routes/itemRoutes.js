const mongoose = require("mongoose");
const Item = mongoose.model("Item");

module.exports = app => {
  app.get("/api/items", async (req, res) => {
    try {
      const items = await Item.find({ user_id: req.user.id });
      res.json({
        success: true,
        items: [items]
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
  });

};