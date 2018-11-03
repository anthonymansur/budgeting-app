import React from "react";
import { Card, CardBody, CardTitle, Row, Col } from "reactstrap";
import numeral from "numeral";
import moment from "moment-timezone";

const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);

export default ({ wallet, getWalletBalance, editWalletToggle, transactions }) => {
  /*
  * Used to get the daily balance if wallet has set date
  */
  const amount = parseFloat(getWalletBalance(wallet));
  let todaysExpenses = 0;
  transactions.forEach(trans => {
    if (
      moment(trans.date)
        .utc()
        .dayOfYear() === now.dayOfYear() &&
      moment(trans.date)
        .utc()
        .year() === now.year() &&
      trans.type === "remove"
    ) {
      todaysExpenses += trans.amount;
    }
  });
  const daysRemaining =
    moment(wallet.date)
      .utc()
      .diff(now, "days") + 1;
  const average = (amount + todaysExpenses) / daysRemaining;

  console.log(average);
  console.log(todaysExpenses);

  return (
    <Card onClick={() => editWalletToggle(wallet)}>
      {!wallet.date ? (
        <CardBody className="text-center">
          <CardTitle className="card__title">{wallet.category}</CardTitle>
          {getWalletBalance(wallet) >= 0 ? (
            <p className="card__money">{numeral(getWalletBalance(wallet)).format("$0,0.00")}</p>
          ) : (
            <p className="card__money--red">
              {numeral(getWalletBalance(wallet)).format("$0,0.00")}
            </p>
          )}
        </CardBody>
      ) : (
        <CardBody className="text-center">
          <CardTitle className="card__title">{wallet.category}</CardTitle>
          <Row className="align-items-center">
            <Col>
              {getWalletBalance(wallet) >= 0 ? (
                <p className="card__money">{numeral(getWalletBalance(wallet)).format("$0,0.00")}</p>
              ) : (
                <p className="card__money--red">
                  {numeral(getWalletBalance(wallet)).format("$0,0.00")}
                </p>
              )}
            </Col>
            <Col className="text-right" style={{ marginRight: "25px" }}>
              <p style={{ margin: 0 }}>
                Day Budget:{" "}
                {average - todaysExpenses >= 0 ? (
                  <span className="medium-text green">
                    ${(average - todaysExpenses).toFixed(2)}
                  </span>
                ) : (
                  <span className="medium-text red">
                    -$
                    {(0 - (average - todaysExpenses)).toFixed(2)}
                  </span>
                )}
              </p>
              <p style={{ margin: 0 }}>
                Per Day: <span className="medium-text green">${average.toFixed(2)}</span>
              </p>
            </Col>
          </Row>
          <p className="text-right" style={{ marginBottom: "-10px" }}>
            {daysRemaining} days left
          </p>
        </CardBody>
      )}
    </Card>
  );
};
