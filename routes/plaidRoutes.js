const  moment = require('moment-timezone');
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

const TIMEZONE = "America/New_York";

// Accept the public_token sent from Link
module.exports = app => {

  app.get('/api/plaid/get_transactions', async (req, res) =>{
    try {
      const access_token = req.query.access_token;
      const startDate = moment().tz(TIMEZONE)
          //.subtract(5, 'days')
          .format('YYYY-MM-DD');
      const endDate = moment().tz(TIMEZONE).format('YYYY-MM-DD');
      const transactionsResponse = await client.getTransactions(access_token, startDate, endDate, {
        count: 250,
        offset: 0
      });
      res.json({
        success: true,
        items: [transactionsResponse]
      });
    } catch (e) {
      res.json({
        success: false,
        message: e.message
      });
    }
    
  });

  app.post("/api/plaid/get_access_token", async (req, res) => {
    try {
      const public_token = req.body.public_token;
      const metadata = req.body.metadata;
      const user_id = req.user.id;

      const userItems = await Item.find({ user_id });

      let isItemUnique = true;

      userItems.forEach(item => {
        if (item.metadata.institution.institution_id === metadata.institution.institution_id) {
          isItemUnique = false;
        }
      });

      if (isItemUnique && userItems < 3) {
        const tokenResponse = await client.exchangePublicToken(public_token);
        const access_token = tokenResponse.access_token;
        const item_id = tokenResponse.item_id;
        const item = await new Item({ access_token, item_id, metadata, user_id });
        await item.save();
      }

      res.json({
        success: true
      })
    } catch(e) {
      console.log(e);
      res.json({
        success: false,
        message: e.message
      })
    }
  });
};

