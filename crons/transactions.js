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
const client = new plaid.Client(
  plaidClientId,
  plaidSecret,
  plaidPublicKey,
  plaid.environments.development,
  { version: "2018-05-22" }
);

const TransactionsFn = async () => {
  const now = moment().tz(TIMEZONE);
  try {
    console.log(`Checking incoming transactions at ${now.toISOString()}`);
    const items = await Item.find({ active: true });
    items.forEach(async item => {
      try {
        const access_token = item.access_token;
        const startDate = now
          .subtract(5, "days")
          .format("YYYY-MM-DD");
        const endDate = now
          .format("YYYY-MM-DD");
        const transactionsResponse = await client.getTransactions(
          access_token,
          startDate,
          endDate,
          {
            count: 250,
            offset: 0
          }
        );
        const transactions = transactionsResponse.transactions;
        transactions &&
          transactions.forEach(async transaction => {
            const existingTransaction = await Transaction.findOne({
              transaction_id: transaction.transaction_id
            });
            if (!existingTransaction) {
              const trans = await new Transaction({
                user_id: item.user_id,
                wallet_id: null,
                amount: transaction.amount,
                type: transaction.amount > 0 ? "remove" : "add",
                description: transaction.name.substring(0, 26),
                date: transaction.date,
                transaction_id: transaction.transaction_id,
                status: "pending"
              });
              await trans.save();
            }
          });
      } catch (e) {
        console.log(e);
        if (e.error_code === "ITEM_LOGIN_REQUIRED") {
          try {
            const public_token = await client.createPublicToken(item.access_token);
            await Item.findByIdAndUpdate(item._id, { active: false, update_required: true, public_token });
          } catch (e) {
            console.log(e);
          }
        }
      }
    });
  } catch (e) {
    console.log(e);
  }
};

new CronJob(EVERY_MINUTE, TransactionsFn, null, true, TIMEZONE);
