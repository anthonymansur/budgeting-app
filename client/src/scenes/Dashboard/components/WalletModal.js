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
  Button
} from "reactstrap";

export default ({ state, toggle, onChange, addToWallet, editWallet, confirmDelete }) => {
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
