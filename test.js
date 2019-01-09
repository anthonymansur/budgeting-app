const moment = require("moment-timezone");
const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE); //.add(10, "hours");

console.log(
  moment("2018-11-03T00:00:00.000Z")
    .utc()
    .dayOfYear() === now.dayOfYear() &&
    moment("2018-11-03T00:00:00.000Z")
      .utc()
      .year() === now.year()
);

// console.log(moment("2018-11-03T00:00:00.000Z").utc().isSame(now, "day"));
