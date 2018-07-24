import React from "react";
import { Row, Col, ListGroup, ListGroupItem } from "reactstrap";
import moment from "moment";
import numeral from "numeral";

export default ({ state }) => {
  return (
    <ListGroup>
      {state.goals
        .filter(goal => {
          return goal.status === "met";
        })
        .map(goal => {
          return (
            <ListGroupItem className="text-center">
              <Row>
                <div className="col-auto mr-auto">
                  <h2>{goal.name}:</h2>
                </div>
                <div className="col-auto">
                  <h2>{numeral(goal.amount).format("$0,0")}</h2>
                </div>
              </Row>
              <br />
              <Row>
                <Col>
                  <span>{moment(goal.start_date).format("MMM DD")}</span>
                  <p className="text-muted">Started</p>
                </Col>
                <Col>
                  <span>
                    {moment(goal.transfers[goal.transfers.length - 1].date).format("MMM DD")}
                  </span>
                  <p className="text-muted">Reached</p>
                </Col>
                <Col>
                  <span>{moment(goal.end_date).format("MMM DD")}</span>
                  <p className="text-muted">Ended</p>
                </Col>
              </Row>
            </ListGroupItem>
          );
        })}
    </ListGroup>
  );
};
