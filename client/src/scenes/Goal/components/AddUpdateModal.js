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

export default ({ state, toggle, onChange, onAddSubmit, onUpdateSubmit, formattedNow }) => {
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {state.modalType === "add" ? "Add your new goal" : "Update your goal"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label>Name</Label>
            <Input
              type="text"
              name="name"
              value={state.modalName}
              invalid={state.modalNameError}
              onChange={onChange}
            />
            <FormFeedback />
          </FormGroup>
          <FormGroup>
            <Label for="amount">Amount</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">$</InputGroupAddon>
              <Input
                type="number"
                name="amount"
                id="amount"
                value={state.modalAmount || ""}
                invalid={state.modalAmountError}
                onChange={onChange}
              />
            </InputGroup>
            <FormFeedback>Please provide a positive amount</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label>Date of completion:</Label>
            <Input type="date" name="date" defaultValue={formattedNow} onChange={onChange} />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        {state.modalType === "add" ? (
          <Button color="primary" onClick={onAddSubmit}>
            Add Goal
          </Button>
        ) : (
          <Button color="primary" onClick={() => onUpdateSubmit(state.modalGoal)}>
            Update Goal
          </Button>
        )}{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
