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
import ToggleButton from "react-toggle-button";
import moment from "moment-timezone";

const TIMEZONE = "America/New_York";
const now = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default ({
  state,
  toggle,
  onToggle,
  onChange,
  onSubmit
}) => {
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {state.modalType === "add-money" ? "Add new income" : "List new expense"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="amount">Amount</Label>
            <InputGroup>
              <InputGroupAddon addonType="prepend">$</InputGroupAddon>
              <Input
                invalid={state.modalAmountError}
                type="number"
                name="amount"
                id="amount"
                value={state.modalAmount || ""}
                onChange={onChange}
              />
            </InputGroup>
            <FormFeedback>Please provide a positive amount</FormFeedback>
          </FormGroup>
          {state.modalType === "remove-money" ? (
            <FormGroup>
              <Label for="category">Category</Label>
              <Input
                type="select"
                invalid={state.modalCategoryError}
                name="category"
                id="category"
                value={state.modalCategory}
                onChange={onChange}
              >
                <option value="none">Select a category</option>
                {state.wallets.map(wallet => {
                  return (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.category}
                    </option>
                  );
                })}
              </Input>
              <FormFeedback>Please choose a category</FormFeedback>
            </FormGroup>
          ) : (
            <FormGroup>
              <Label for="category">
                Add to specific wallet{" "}
                <span className="text-muted" style={{ fontSize: "90%" }}>
                  (not recommended)
                </span>
              </Label>
              <Input
                type="select"
                name="category"
                id="category"
                value={state.modalCategory}
                onChange={onChange}
              >
                <option value="none">Select a Wallet</option>
                {state.wallets.map(wallet => {
                  return (
                    <option key={wallet._id} value={wallet._id}>
                      {wallet.category}
                    </option>
                  );
                })}
              </Input>
            </FormGroup>
          )}
          <FormGroup>
            <Label for="date">Date</Label>
            <Input type="date" name="date" defaultValue={now} id="date" onChange={this.onChange} />
          </FormGroup>
          {state.modalType === "add-money" ? (
            <FormGroup>
              <Label for="tax">Taxable</Label>
              <ToggleButton
                inactiveLabel={
                  <i className="material-icons" style={{ fontSize: "2rem" }}>
                    close
                  </i>
                }
                activeLabel={
                  <i className="material-icons" style={{ fontSize: "2rem" }}>
                    check
                  </i>
                }
                value={state.modalValue}
                onToggle={value => {
                  this.setState({
                    modalValue: !value
                  });
                }}
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <Label for="tax">Tax Deductible</Label>
              <ToggleButton
                inactiveLabel={
                  <i className="material-icons" style={{ fontSize: "2rem" }}>
                    close
                  </i>
                }
                activeLabel={
                  <i className="material-icons" style={{ fontSize: "2rem" }}>
                    check
                  </i>
                }
                value={state.modalValue}
                onToggle={onToggle}
              />
            </FormGroup>
          )}
          <FormGroup>
            <Label for="description">Description</Label>
            <Input
              type="text"
              name="description"
              id="description"
              value={state.modalDescription}
              placeholder="optional"
              onChange={onChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onSubmit}>
          {state.modalType === "add-money" ? "Add money" : "Remove Money"}
        </Button>{" "}
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
