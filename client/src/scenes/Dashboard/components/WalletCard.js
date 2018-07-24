import React from "react";
import { Card, CardBody, CardTitle } from "reactstrap";
import numeral from "numeral";

export default ({ wallet, getWalletBalance, editWalletToggle }) => {
  return (
    <Card onClick={() => editWalletToggle(wallet)}>
      <CardBody className="text-center">
        <CardTitle className="card__title">{wallet.category}</CardTitle>
        {getWalletBalance(wallet) >= 0 ? (
          <p className="card__money">{numeral(getWalletBalance(wallet)).format("$0,0.00")}</p>
        ) : (
          <p className="card__money--red">{numeral(getWalletBalance(wallet)).format("$0,0.00")}</p>
        )}
      </CardBody>
    </Card>
  );
};
