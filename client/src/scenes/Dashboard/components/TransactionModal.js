import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ListGroup,
  ListGroupItem,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  FormFeedback,
  Row,
  Col
} from "reactstrap";
import ToggleButton from "react-toggle-button";
import axios from "axios";
import moment from "moment";

export default ({ state, toggle, expandTransaction, onChange, onToggle, onEdit }) => {
  return (
    <Modal isOpen={state.modal} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <h1>Transfer new transactions</h1>
      </ModalHeader>
      <ModalBody>
        {state.newTransactions.filter(trans => {
          return trans.type === "add";
        }).length > 0 ? (
          <h2>Income</h2>
        ) : (
          ""
        )}
        <ListGroup>
          {state.newTransactions && state.newTransactions
            .filter(trans => {
              return trans.type === "add";
            })
            .map(transaction => {
              return (
                <ListGroupItem
                  key={transaction._id}
                  onClick={() => expandTransaction(transaction)}
                >
                    <Row>
                        <Col xs="9">
                        <p>
                            Amount:
                            {" $" + transaction.amount}
                        </p>
                        </Col>
                    </Row>
                  
                  <p>
                    Date:
                    {" " + moment(transaction.date).format("MMMM DD, YYYY")}
                  </p>
                  {state.expandTransaction._id === transaction._id ? (
                    <Form>
                      <FormGroup>
                        <Label for="category">Category</Label>
                        <Input
                          type="select"
                          valid={!state.modalCategoryError}
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
                        <FormFeedback valid>Please choose a category</FormFeedback>
                        <FormFeedback>Please choose a category</FormFeedback>
                      </FormGroup>
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
                          onToggle={onToggle}
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Description:</Label>
                        <Input
                          type="text"
                          name="description"
                          value={state.modalDescription}
                          onChange={onChange}
                        />
                      </FormGroup>
                      <FormGroup style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button color="danger" onClick={() => onEdit("denied")}>
                          Discard
                        </Button>
                        <Button color="success" onClick={() =>onEdit("accepted")}>
                          Accept Transaction
                        </Button>
                      </FormGroup>
                    </Form>
                  ) : (
                    <p>
                      Description:
                      {" " + transaction.description}
                    </p>
                  )}
                </ListGroupItem>
              );
            })}
        </ListGroup>

        {state.newTransactions.filter(trans => {
          return trans.type === "add";
        }).length > 0 ? (
          <br />
        ) : (
          ""
        )}

        {state.newTransactions.filter(trans => {
          return trans.type === "remove";
        }).length > 0 ? (
          <h2>Expenses</h2>
        ) : (
          ""
        )}
        <ListGroup>
          {state.newTransactions
            .filter(trans => {
              return trans.type === "remove";
            })
            .map(transaction => {
              return (
                <ListGroupItem
                  key={transaction._id}
                  onClick={() => expandTransaction(transaction)}
                >
                  <p>
                    Amount:
                    {" $" + transaction.amount}
                  </p>
                  <p>
                    Date:
                    {" " + moment(transaction.date).format("MMMM DD, YYYY")}
                  </p>
                  {state.expandTransaction._id === transaction._id ? (
                    <Form>
                      <FormGroup>
                        <Label for="category">Category</Label>
                        <Input
                          type="select"
                          valid={!state.modalCategoryError}
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
                        <FormFeedback valid>Please choose a category</FormFeedback>
                        <FormFeedback>Please choose a category</FormFeedback>
                      </FormGroup>
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
                      <FormGroup>
                        <Label>Description:</Label>
                        <Input
                          type="text"
                          name="description"
                          value={state.modalDescription}
                          onChange={onChange}
                        />
                      </FormGroup>
                      <FormGroup style={{ display: "flex", justifyContent: "space-between" }}>
                        <Button color="danger" onClick={() => onEdit("denied")}>
                          Discard
                        </Button>
                        <Button color="success" onClick={() => onEdit("accepted")}>
                          Accept Transaction
                        </Button>
                      </FormGroup>
                    </Form>
                  ) : (
                    <p>
                      Description:
                      {" " + transaction.description}
                    </p>
                  )}
                </ListGroupItem>
              );
            })}
        </ListGroup>
      </ModalBody>
    </Modal>
  );
};
