import React from "react";
import { Jumbotron, Button } from "reactstrap";

export default ({ addWalletToggle }) => {
  return (
    <div
      style={{
        marginBottom: window.innerHeight * 0.1,
        marginTop: window.innerHeight * 0.1,
        width: window.innerwidth * 0.8
      }}
    >
      <Jumbotron>
        <h1 className="display-3 text-center">Add Your First Wallet!</h1>
        <p className="lead text-center">
          Choose a name and the percentage of your income that you want to allocate.
        </p>
        <hr className="my-2" />
        <br />
        <p className="lead">
          <div className="d-flex justify-content-center">
            <Button block={true} color="success" onClick={addWalletToggle} className="step-1">
              Add Wallet
            </Button>
          </div>
        </p>
      </Jumbotron>
    </div>
  );
};
