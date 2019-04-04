const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const { mongoURI, cookieKey } = require('./config/keys');
require('./models');
require('./services/passport');

mongoose.connect(mongoURI);

const app = express();

// authentication
app.use(bodyParser.json());
app.use(
  cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000,
      keys: [cookieKey]
  })
);
app.use(passport.initialize());
app.use(passport.session());

// authorization
app.use("/api*", (req, res, next) => {
  if (req.user === undefined) {
    res.status(401);
    return res.send("unauthorized");
  } else {
    next();
  }
});

//routes
require('./routes/authRoutes')(app);
require('./routes/goalRoutes')(app);
require('./routes/itemRoutes')(app);
require('./routes/loanRoutes')(app);
require('./routes/plaidRoutes')(app);
require('./routes/transactionRoutes')(app);
require('./routes/walletRoutes')(app);
require('./routes/billRoutes')(app);

//crons
require(`${__dirname}/crons/transactions`);
require(`${__dirname}/crons/update`);
require(`${__dirname}/crons/automated`);

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static('client/build'));

  // Express will serve up the index.html file 
  // if it doesn't recognize the route
  const path = require("path");
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);