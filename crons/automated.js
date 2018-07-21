const CronJob = require("cron").CronJob;
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Goal = mongoose.model("Goal");

const TIMEZONE = "America/New_York";
const CRON_TAB = "0 7 * * *";

const AutomatedFn = async () => {
  const now = moment().tz(TIMEZONE);
  try {
    console.log(`Checking goals to charge at ${now.toISOString()}`);
    const goals = await Goal.find({ auto_payment: "on" });
    goals.forEach(async goal => {
      try {
        let currAmount = 0;
        goal.transfers.forEach(transfer => {
          currAmount += transfer.amount;
        });
        const daysLeft = moment(goal.end_date).diff(now, "days") + 1;
        const amount = ((goal.amount - currAmount) / daysLeft).toFixed(2);
        if (Math.round(amount)){
          params = {
            $push: {
              transfers: {
                amount: amount,
                wallet_id: goal.wallet_id,
                date: now
              }
            }
          }
          await Goal.findByIdAndUpdate(goal._id, params);
        }
      } catch (e) {
        console.log(e);
      }
    });
  } catch (e) {
    console.log(e);
  }
};

new CronJob(CRON_TAB, AutomatedFn, null, true, TIMEZONE);
