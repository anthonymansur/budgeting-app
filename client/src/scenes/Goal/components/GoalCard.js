import React from "react";
import { Row, Col, Card, CardBody, CardTitle, Button, Progress } from "reactstrap";
import moment from "moment";
import numeral from "numeral";

const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);

export default ({
  goal,
  toggleAuto,
  disableAuto,
  toggleRedeem,
  toggleTransfer,
  toggleUpdate,
  onDelete
}) => {
  let currAmount = 0;
  goal.transfers.forEach(transfer => {
    currAmount += transfer.amount;
  });
  const daysLeft = moment(goal.end_date).diff(now, "days") + 1;
  return (
    <Card>
      <CardBody>
        <CardTitle className="text-left">
          <Row>
            <div className="col-auto mr-auto">
              <h2>{goal.name}</h2>
            </div>
            <div className="col-auto">
              {goal.auto_payment === "off" ? (
                <Button
                  color="link"
                  style={{ padding: "0", fontSize: "1.2rem" }}
                  onClick={() => toggleAuto(goal)}
                >
                  Set up automatic payment
                </Button>
              ) : (
                <Button
                  color="link"
                  style={{ padding: "0", fontSize: "1.2rem" }}
                  onClick={() => disableAuto(goal)}
                >
                  Turn off automatic payment
                </Button>
              )}
            </div>
          </Row>
        </CardTitle>
        <Row>
          <div className="col-auto mr-auto">
            {daysLeft} day{daysLeft === 1 ? "" : "s"} left
          </div>
          <div className="col-auto">
            {moment(goal.end_date).year() === now.year()
              ? moment(goal.end_date).format("MMM D")
              : moment(goal.end_date).format("MMM D, YYYY")}
          </div>
        </Row>
        <Progress value={(currAmount / goal.amount) * 100} color="success" />
        <br />
        <Row className="text-center">
          <Col>
            <h3>{numeral(currAmount).format("$0,0.00")}</h3>
            <p className="text-muted">Saved</p>
          </Col>
          <Col>
            <h3>{numeral((goal.amount - currAmount) / daysLeft).format("$0,0.00")}</h3>
            <p className="text-muted">Per day</p>
          </Col>
          <Col>
            <h3>{numeral(goal.amount).format("$0,0.00")}</h3>
            <p className="text-muted">Target</p>
          </Col>
        </Row>
        <br />
        <Row className="text-center">
          <Col>
            {goal.amount === currAmount ? (
              <Button
                color="danger"
                style={{ fontSize: "1.6rem" }}
                onClick={() => toggleRedeem(goal)}
              >
                Redeem
              </Button>
            ) : (
              <Button
                color="link"
                style={{ padding: "0", fontSize: "1.6rem" }}
                onClick={() => toggleTransfer(goal)}
              >
                Transfer
              </Button>
            )}
          </Col>
          <Col>
            <Button
              color="link"
              style={{ padding: "0", fontSize: "1.6rem" }}
              onClick={() => toggleUpdate(goal)}
            >
              Update
            </Button>
          </Col>
          <Col>
            <Button
              color="link"
              style={{ padding: "0", fontSize: "1.6rem" }}
              onClick={() => onDelete(goal)}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};
