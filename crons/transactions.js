const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment-timezone");

const Item = mongoose.model("Item");
const Transaction = mongoose.model("Transaction");
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

const TransactionsFn = async () => {
  try {
    console.log(`Checking incoming transactions at ${now.toISOString()}`)
    const items = await Item.find();
    items.forEach(async item => {
      const access_token = item.access_token;
      const startDate = moment().tz(TIMEZONE)
        .subtract(1, "days")
        .format("YYYY-MM-DD");
      const endDate = moment().tz(TIMEZONE).format("YYYY-MM-DD");
      const transactionsResponse = await client.getTransactions(access_token, startDate, endDate, {
        count: 250,
        offset: 0
      });
      const transactions = transactionsResponse.transactions;
      // console.log(transactionsResponse.transactions);
      transactions.forEach(async transaction => {
        const existingTransaction = await Transaction.findOne({ transaction_id: transaction.transaction_id });
        if (!existingTransaction) {
          const trans = await new Transaction({
            user_id: item.user_id,
            wallet_id: null,
            amount: transaction.amount,
            type: transaction.amount > 0 ? "remove" : "add",
            description: transaction.name.substring(0, 26),
            date: transaction.date,
            transaction_id: transaction.transaction_id,
            status: "pending",
          });
          await trans.save();
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
};

new CronJob(EVERY_MINUTE, TransactionsFn, null, true, TIMEZONE);
