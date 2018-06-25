const mongoose = require('mongoose');
const { mongoURI } = require('./../config/keys');

// if (!process.env.MONGO_URI) {
//     throw new Error("Missing MONGO_URI in environment variables.");
// }

mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on('error', function (error) {
    console.error(error);
});

module.exports = {
    User: require(`./User`),
    Transaction: require('./Transaction'),
    Wallet: require('./Wallet')
};
