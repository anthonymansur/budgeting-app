import React from "react";
import { Jumbotron, Button } from "reactstrap";

export default ({ toggleAddGoal }) => {
  return (
    <Jumbotron>
      <h1 className="display-3 text-center">Add Your First Goal!</h1>
      <p className="lead text-center">
        Choose the amount and timespan of the goal you wish to complete
      </p>
      <hr className="my-2" />
      <br />
      <p className="lead">
        <div className="d-flex justify-content-center">
          <Button block={true} color="success" onClick={this.toggleAddGoal}>
            Add Goal
          </Button>
        </div>
      </p>
    </Jumbotron>
  );
};
