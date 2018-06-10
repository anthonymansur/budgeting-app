const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send({app: 'budgeting-app'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);