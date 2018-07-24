import React from "react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  Button
} from "reactstrap";
import moment from "moment";
import numeral from "numeral";

const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);

export default ({ state, toggle, onChange, onAutoSubmit }) => {
  const goal = state.modalGoal;
  let currAmount = 0;
  goal.transfers.forEach(transfer => {
    currAmount += transfer.amount;
  });
  const daysLeft = moment(goal.end_date).diff(now, "days") + 1;
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Set up automatic payment</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Choose a wallet</Label>
            <Input
              type="select"
              invalid={state.modalWalletError}
              name="wallet"
              value={state.modalWallet}
              onChange={onChange}
            >
              <option value="none">Select a wallet</option>
              {state.wallets.map(wallet => {
                return (
                  <option key={wallet._id} value={wallet._id}>
                    {wallet.category}
                  </option>
                );
              })}
            </Input>
            <FormFeedback>Please choose a wallet</FormFeedback>
          </FormGroup>
        </Form>
        <p className="small-text">
          Your daily amount (currently{" "}
          {numeral((goal.amount - currAmount) / daysLeft).format("$0,0.00")}) will be deducted from
          the wallet you've chosen every day until your target goal has been reached.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onAutoSubmit}>
          Turn on automatic payment
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
