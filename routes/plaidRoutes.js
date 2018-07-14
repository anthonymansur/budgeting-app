const Item = require("../models/Item");
const plaid = require('plaid');
const { plaidClientId, plaidSecret, plaidPublicKey } = require('../config/keys');

const client = new plaid.Client(
  plaidClientId,
  plaidSecret,
  plaidPublicKey,
  plaid.environments.development,
  {version: '2018-05-22'}
);

// Accept the public_token sent from Link
module.exports = app => {

  app.post("/api/plaid/get_access_token", async (req, res) => {
    try {
      const public_token = req.body.public_token;
      const metadata = req.body.metadata;
      const user_id = req.user.id;
      const tokenResponse = await client.exchangePublicToken(public_token);


      const userItems = await Item.find({ user_id });

      let isItemUnique = true;

      userItems.forEach(item => {
        if (item.metadata.institution.institution_id === metadata.institution.institution_id) {
          isItemUnique = false;
        }
      });

      if (isItemUnique && userItems.length < 3) {
        const access_token = tokenResponse.access_token;
        const item_id = tokenResponse.item_id;
        const item = await new Item({ access_token, item_id, metadata, user_id });
        await item.save();
        res.json({
          success: true
        })
      }
      else {
        console.log(`Failed: item_id: ${tokenResponse.item_id} access_token: ${tokenResponse.access_token}`);
        console.log(`isItemUnique: ${isItemUnique}`);
        console.log(`userItems: ${userItems}`);
        res.json({
          success: false
        })
      }
    } catch(e) {
      console.log(e);
      res.json({
        success: false,
        message: e.message
      })
    }
  });
};

