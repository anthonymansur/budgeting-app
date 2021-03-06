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
        const startDate = moment()
          .subtract(7, "days")
          .format("YYYY-MM-DD");
        const endDate = moment()
          .format("YYYY-MM-DD");
        const transactionsResponse = await client.getTransactions(
          access_token,
          startDate,
          endDate
        );
        const transactions = transactionsResponse.transactions;
        transactions &&
          transactions.forEach(async transaction => {
            const existingTransaction = await Transaction.findOne({
              transaction_id: transaction.transaction_id
            });
            const existingPendingTransaction = await Transaction.findOne({
              transaction_id: transaction.pending_transaction_id
            });
            if (!existingTransaction && !existingPendingTransaction) {
              let description = "";
              if (transaction.name.substring(0, 13) === "ORIG CO NAME:") {
                const indexOfDesc = transaction.name.indexOf("CO ENTRY DESCR:")
                const indexOfEnd = transaction.name.indexOf("SEC:");

                description = transaction.name.substring(13, indexOfDesc < 39 ? indexOfDesc : 39);
                if (indexOfDesc < 39) {
                  description = description + " - " + transaction.name.substring(indexOfDesc+15, indexOfEnd);
                }
              } else {
                description = transaction.name.substring(0, 26);
              }
              const trans = await new Transaction({
                user_id: item.user_id,
                wallet_id: null,
                amount: transaction.amount > 0 ? transaction.amount : -transaction.amount,
                type: transaction.amount > 0 ? "remove" : "add",
                description,
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
