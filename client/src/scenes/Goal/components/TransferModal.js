import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Button
} from "reactstrap";

export default ({ state, toggle, onChange, onTransferSubmit }) => {
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>Transfer money to your goal</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Amount</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">$</InputGroupAddon>
              <Input
                type="number"
                name="amount"
                value={state.modalAmount || ""}
                invalid={state.modalAmountError}
                onChange={onChange}
              />
            </InputGroup>
            <FormFeedback>Please provide a positive amount</FormFeedback>
            <FormFeedback />
          </FormGroup>
          <FormGroup>
            <Label>Wallet</Label>
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
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onTransferSubmit}>
          Transfer Money
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
