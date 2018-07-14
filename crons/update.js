const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment-timezone");

const Item = mongoose.model("Item");
const plaid = require("plaid");
const { plaidClientId, plaidSecret, plaidPublicKey } = require("../config/keys");

const EVERY_MINUTE = "* * * * *";
const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);
const client = new plaid.Client(
  plaidClientId,
  plaidSecret,
  plaidPublicKey,
  plaid.environments.development,
  { version: "2018-05-22" }
);

const UpdateFn = async () => {
  try {
    console.log(`Checking items to update at ${now.toISOString()}`);
    const items = await Item.find({ update_required: true });
    items.forEach(async item => {
      try {
        if (now.isAfter(moment(item.public_token.expiration))) {
          const access_token = item.access_token;
          const public_token = await client.createPublicToken(access_token);
          await Item.findByIdAndUpdate(item._id, { public_token });
        }
      } catch (e) {
        console.log(e);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

new CronJob(EVERY_MINUTE, UpdateFn, null, true, TIMEZONE);
