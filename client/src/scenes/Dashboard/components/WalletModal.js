import React from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Button
} from "reactstrap";
import moment from "moment-timezone";

const TIMEZONE = "America/New_York";
const now = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default ({
  state,
  toggle,
  toggleWalletDate,
  onChange,
  addToWallet,
  editWallet,
  confirmDelete,
  submitWalletDate,
  removeWalletDate
}) => {
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {state.modalType === "add-wallet" ? "Add a new wallet" : "Edit existing wallet"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Name</Label>
            <Input
              invalid={state.modalNameError}
              type="text"
              name="wallet-name"
              value={state.modalName}
              onChange={onChange}
            />
            <FormFeedback>Please provide a name</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label>Percentage: {state.modalPercentage}</Label>
            <Input
              type="range"
              min="0"
              max={
                state.modalType === "add-wallet"
                  ? state.remainingPercentage
                  : state.modalWallet.percentage + state.remainingPercentage
              }
              value={state.modalPercentage}
              name="slider"
              onChange={onChange}
            />
          </FormGroup>
          {state.modalSetWalletDate === true ? (
            <FormGroup>
              <Label>How long do you intend to have this money for?</Label>
              <InputGroup>
                <Input
                  type="date"
                  name="walletDate"
                  defaultValue={
                    state.modalWalletDate
                      ? moment(state.modalWalletDate)
                          .tz(TIMEZONE)
                          .format("YYYY-MM-DD")
                      : now
                  }
                  onChange={onChange}
                />
                <InputGroupAddon addonType="append">
                  <Button color="secondary" name="submitWalletDate" onClick={submitWalletDate}>
                    Submit
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <Button color="link" onClick={removeWalletDate} style={{ padding: 0 }}>
                Cancel
              </Button>
            </FormGroup>
          ) : state.modalType !== "add-wallet" ? (
            <Button color="link" onClick={toggleWalletDate} style={{ padding: 0 }}>
              Set days remaining
            </Button>
          ) : ""}
        </Form>
      </ModalBody>
      <ModalFooter>
        {state.modalType === "add-wallet" ? (
          <div>
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>{" "}
            <Button color="primary" onClick={addToWallet}>
              Add Wallet
            </Button>
          </div>
        ) : (
          <div>
            <Button color="link" onClick={() => confirmDelete(state.modalWallet)}>
              Delete Wallet
            </Button>{" "}
            <Button color="primary" onClick={editWallet}>
              Edit Wallet
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
};
