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
      console.log(e);
      res.json({
        success: false,
        message: e.message
      });
    }
  });

  app.put("/api/items", async (req, res) => {
    try {
      const id = req.body.id;
      const params = {};
      req.body.active !== undefined && (params.active = req.body.active);
      req.body.update_required !== undefined && (params.update_required = req.body.update_required);
      req.body.public_token !== undefined && (params.public_token = req.body.public_token);

      const items = await Item.findByIdAndUpdate(id, params);
      res.json({
        success: true,
        items: [items]
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