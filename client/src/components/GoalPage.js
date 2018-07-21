import React from "react";
import {
  Container,
  Row,
  Col,
  Jumbotron,
  Button,
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
  Progress,
  Card,
  CardBody,
  CardTitle,
  Tooltip,
  ListGroup,
  ListGroupItem
} from "reactstrap";
import axios from "axios";
import moment from "moment-timezone";
import numeral from "numeral";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;
const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);
const formattedNow = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default class GoalPage extends React.Component {
  constructor() {
    super();
    this.state = {
      goals: [],
      wallets: [],
      modal: false,
      modalGoal: null,
      modalType: "",
      modalName: "",
      modalNameError: false,
      modalAmount: 0,
      modalAmountError: false,
      modalDate: formattedNow,
      modalWallet: "",
      modalWalletError: false,
      tooltipOpen: false,
      ismounted: false
    };
  }

  async componentDidMount() {
    try {
      const walletResponse = await axios.get("/api/wallets");
      if (walletResponse.data.success) {
        const wallets = walletResponse.data.items[0];
        let remainingPercentage = 100;
        wallets.forEach(wallet => {
          remainingPercentage -= wallet.percentage;
        });
        this.setState({ wallets, remainingPercentage });
      } else {
        throw new Error(walletResponse.data.message);
      }
      const goalResponse = await axios.get("/api/goals");
      if (goalResponse.data.success) {
        this.setState({ goals: goalResponse.data.items[0] });
      } else {
        throw new Error(goalResponse.data.message);
      }
      this.setState({ ismounted: true });
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  toggleAddGoal = () => {
    this.setState({
      modal: !this.state.modal,
      modalType: "add"
    });
  };

  toggleTransfer = goal => {
    this.setState({
      modal: !this.state.modal,
      modalType: "transfer",
      modalGoal: goal
    });
  };

  toggleUpdate = goal => {
    this.setState({
      modal: !this.state.modal,
      modalType: "update",
      modalGoal: goal,
      modalAmount: goal.amount,
      modalDate: moment(goal.end_date).format("YYYY-MM-DD"),
      modalName: goal.name
    });
  };

  toggleAuto = goal => {
    this.setState({
      modal: !this.state.modal,
      modalType: "auto",
      modalGoal: goal
    });
  };

  toggleTooltip = () => {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen
    });
  };

  refreshState = () => {
    this.setState({
      modal: false,
      modalName: "",
      modalNameError: false,
      modalAmount: 0,
      modalAmountError: false,
      modalDate: formattedNow
    });
  };

  errorCheck = () => {
    let valid = true;
    if (
      (this.state.modalType === "add" || this.state.modalType === "update") &&
      this.state.modalName.length === 0
    ) {
      valid = false;
      this.setState({ modalNameError: true });
    } else {
      this.setState({ modalNameError: false });
    }
    if (this.state.modalType !== "auto" && this.state.modalAmount <= 0) {
      valid = false;
      this.setState({ modalAmountError: true });
    } else {
      this.setState({ modalAmountError: false });
    }
    if (
      (this.state.modalType === "transfer" || this.state.modalType === "auto") &&
      this.state.modalWallet === ""
    ) {
      valid = false;
      this.setState({ modalWalletError: true });
    } else {
      this.setState({ modalWalletError: false });
    }
    return valid;
  };

  onChange = event => {
    const name = event.target.name;
    const value = event.target.value;

    if (name === "name") {
      this.setState({ modalName: value.substring(0, 26) });
    }
    if (name === "amount") {
      if (this.state.modalGoal) {
        let currAmount = 0;
        this.state.modalGoal.transfers.forEach(transfer => {
          currAmount += transfer.amount;
        });
        let diff = this.state.modalGoal.amount - currAmount;
        let amount = parseFloat(value.substring(0, 10));
        amount = diff < amount ? diff : amount;
        this.setState({ modalAmount: amount });
      } else {
        this.setState({ modalAmount: parseFloat(value.substring(0, 10)) });
      }
    }
    if (name === "date") {
      this.setState({
        modalDate: moment(value)
          .tz(TIMEZONE)
          .format("YYYY-MM-DD")
      });
    }
    if (name === "wallet") {
      this.setState({
        modalWallet: value
      });
    }
  };

  onAddSubmit = async () => {
    try {
      if (this.errorCheck()) {
        const body = {
          name: this.state.modalName,
          amount: this.state.modalAmount.toFixed(2),
          start_date: formattedNow,
          end_date: this.state.modalDate
        };
        const res = await axios.post("/api/goals", body);
        if (res.data.success) {
          this.refreshState();
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  onUpdateSubmit = async () => {
    try {
      if (this.errorCheck()) {
        const body = {
          name: this.state.modalName,
          amount: this.state.modalAmount.toFixed(2),
          end_date: this.state.modalDate
        };
        const res = await axios.put(`/api/goals/${this.state.modalGoal._id}`, body);
        if (res.data.success) {
          this.refreshState();
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  onTransferSubmit = async () => {
    try {
      if (this.errorCheck()) {
        const body = {
          $push: {
            transfers: {
              amount: this.state.modalAmount,
              wallet_id: ObjectId(this.state.modalWallet),
              date: formattedNow
            }
          }
        };
        let amount = 0;
        this.state.modalGoal.transfers.forEach(transfer => {
          amount += transfer.amount;
        });
        amount += this.state.modalAmount;
        console.log(this.state.modalGoal.amount === amount);
        console.log(amount);
        console.log(this.state.modalGoal.amount);
        body.status = this.state.modalGoal.amount === amount ? "met" : "not_met";
        console.log(body);
        const res = await axios.put(`/api/goals/${this.state.modalGoal._id}`, body);
        if (res.data.success) {
          this.refreshState();
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  onAutoSubmit = async () => {
    try {
      if (this.errorCheck()) {
        const body = {
          auto_payment: "on",
          wallet_id: this.state.modalWallet
        };
        const res = await axios.put(`/api/goals/${this.state.modalGoal._id}`, body);
        if (res.data.success) {
          this.refreshState();
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  onDelete = async goal => {
    try {
      const name = prompt("Please enter the name of the goal you want to delete");
      if (name && name.toLowerCase() === goal.name.toLowerCase()) {
        const res = await axios.delete(`/api/goals/${goal._id}`);
        if (res.data.success) {
          window.location.reload();
        } else {
          alert(res.data.message);
        }
      } else if (name) {
        alert("You entered an incorrect name");
      }
    } catch (e) {
      alert(e.message);
    }
  };

  disableAuto = async goal => {
    const answer = window.confirm("Are you sure you want to turn off your automatic payment?");
    if (answer) {
      try {
        const body = {
          auto_payment: "off",
          wallet_id: null
        };
        const res = await axios.put(`/api/goals/${goal._id}`, body);
        if (res.data.success) {
          this.refreshState();
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  addGoalModal = () => {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>
          {this.state.modalType === "add" ? "Add your new goal" : "Update your goal"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                value={this.state.modalName}
                invalid={this.state.modalNameError}
                onChange={this.onChange}
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
                  value={this.state.modalAmount || ""}
                  invalid={this.state.modalAmountError}
                  onChange={this.onChange}
                />
              </InputGroup>
              <FormFeedback>Please provide a positive amount</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>Date of completion:</Label>
              <Input
                type="date"
                name="date"
                value={this.state.modalDate}
                onChange={this.onChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          {this.state.modalType === "add" ? (
            <Button color="primary" onClick={this.onAddSubmit}>
              Add Goal
            </Button>
          ) : (
            <Button color="primary" onClick={() => this.onUpdateSubmit(this.state.modalGoal)}>
              Update Goal
            </Button>
          )}{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  transferModal = () => {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>Transfer money to your goal</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Amount</Label>
              <InputGroup>
                <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                <Input
                  type="number"
                  name="amount"
                  value={this.state.modalAmount || ""}
                  invalid={this.state.modalAmountError}
                  onChange={this.onChange}
                />
              </InputGroup>
              <FormFeedback>Please provide a positive amount</FormFeedback>
              <FormFeedback />
            </FormGroup>
            <FormGroup>
              <Label>Wallet</Label>
              <Input
                type="select"
                invalid={this.state.modalWalletError}
                name="wallet"
                value={this.state.modalWallet}
                onChange={this.onChange}
              >
                <option value="none">Select a wallet</option>
                {this.state.wallets.map(wallet => {
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
          <Button color="primary" onClick={this.onTransferSubmit}>
            Transfer Money
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  autoModal = () => {
    const goal = this.state.modalGoal;
    let currAmount = 0;
    goal.transfers.forEach(transfer => {
      currAmount += transfer.amount;
    });
    const daysLeft = moment(goal.end_date).diff(now, "days") + 1;
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>Set up automatic payment</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Choose a wallet</Label>
              <Input
                type="select"
                invalid={this.state.modalWalletError}
                name="wallet"
                value={this.state.modalWallet}
                onChange={this.onChange}
              >
                <option value="none">Select a wallet</option>
                {this.state.wallets.map(wallet => {
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
            {numeral((goal.amount - currAmount) / daysLeft).format("$0,0.00")}) will be deducted
            from the wallet you've chosen every day until your target goal has been reached.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onAutoSubmit}>
            Turn on automatic payment
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  render() {
    return (
      <Container>
        <br />
        {this.state.goals.length ? (
          <Row>
            <Col lg={{ size: 6, offset: 3 }}>
              <div>
                <Row>
                  <div className="col-auto mr-auto">
                    <h1 className="white-text">Goals</h1>
                  </div>
                  <div className="col-auto">
                    <a href="#" id="tooltip">
                      <i className="material-icons" id="tooltip" style={{ color: "#007bff" }}>
                        info_outline
                      </i>
                    </a>
                    <Tooltip
                      placement="left"
                      isOpen={this.state.tooltipOpen}
                      target="tooltip"
                      toggle={this.toggleTooltip}
                    >
                      Feel free to message owner for help
                    </Tooltip>
                  </div>
                </Row>
                <br />
                <div>
                  {this.state.goals
                    .filter(goal => {
                      return goal.status === "not_met";
                    })
                    .map(goal => {
                      let currAmount = 0;
                      goal.transfers.forEach(transfer => {
                        currAmount += transfer.amount;
                      });
                      const daysLeft = moment(goal.end_date).diff(now, "days") + 1;
                      return (
                        <div>
                          <Card>
                            <CardBody>
                              <CardTitle className="text-left">
                                <Row>
                                  <div className="col-auto mr-auto">
                                    <h2>{goal.name}</h2>
                                  </div>
                                  <div className="col-auto">
                                    {goal.auto_payment === "off" ? (
                                      <Button
                                        color="link"
                                        style={{ padding: "0", fontSize: "1.2rem" }}
                                        onClick={() => this.toggleAuto(goal)}
                                      >
                                        Set up automatic payment
                                      </Button>
                                    ) : (
                                      <Button
                                        color="link"
                                        style={{ padding: "0", fontSize: "1.2rem" }}
                                        onClick={() => this.disableAuto(goal)}
                                      >
                                        Turn off automatic payment
                                      </Button>
                                    )}
                                  </div>
                                </Row>
                              </CardTitle>
                              <Row>
                                <div className="col-auto mr-auto">
                                  {daysLeft} day{daysLeft === 1 ? "" : "s"} left
                                </div>
                                <div className="col-auto">
                                  {moment(goal.end_date).year() === now.year()
                                    ? moment(goal.end_date).format("MMM D")
                                    : moment(goal.end_date).format("MMM D, YYYY")}
                                </div>
                              </Row>
                              <Progress value={(currAmount / goal.amount) * 100} color="success" />
                              <br />
                              <Row className="text-center">
                                <Col>
                                  <h3>{numeral(currAmount).format("$0,0.00")}</h3>
                                  <p className="text-muted">Saved</p>
                                </Col>
                                <Col>
                                  <h3>
                                    {numeral((goal.amount - currAmount) / daysLeft).format(
                                      "$0,0.00"
                                    )}
                                  </h3>
                                  <p className="text-muted">Per day</p>
                                </Col>
                                <Col>
                                  <h3>{numeral(goal.amount).format("$0,0.00")}</h3>
                                  <p className="text-muted">Target</p>
                                </Col>
                              </Row>
                              <br />
                              <Row className="text-center">
                                <Col>
                                  <Button
                                    color="link"
                                    style={{ padding: "0", fontSize: "1.6rem" }}
                                    onClick={() => this.toggleTransfer(goal)}
                                  >
                                    Transfer
                                  </Button>
                                </Col>
                                <Col>
                                  <Button
                                    color="link"
                                    style={{ padding: "0", fontSize: "1.6rem" }}
                                    onClick={() => this.toggleUpdate(goal)}
                                  >
                                    Update
                                  </Button>
                                </Col>
                                <Col>
                                  <Button
                                    color="link"
                                    style={{ padding: "0", fontSize: "1.6rem" }}
                                    onClick={() => this.onDelete(goal)}
                                  >
                                    Cancel
                                  </Button>
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                          <br />
                        </div>
                      );
                    })}
                  <Button block color="success" onClick={this.toggleAddGoal}>
                    Add New Goal
                  </Button>
                </div>
                <br />
              </div>
              <br />
              <h1 className="white-text">Met Goals</h1>
              <br />
              <ListGroup>
                {this.state.goals
                  .filter(goal => {
                    return goal.status === "met";
                  })
                  .map(goal => {
                    return (
                      <ListGroupItem>
                        <Row>
                          <div className="col-auto mr-auto">
                            <h2>{goal.name}</h2>
                          </div>
                          <div className="col-auto">{goal.amount}</div>
                        </Row>
                      </ListGroupItem>
                    );
                  })}
              </ListGroup>
            </Col>
          </Row>
        ) : this.state.ismounted ? (
          <Row>
            <Col md={{ size: "8", offset: "2" }}>
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
            </Col>
          </Row>
        ) : (
          ""
        )}
        {this.state.modalType === "add" || this.state.modalType === "update"
          ? this.addGoalModal()
          : this.state.modalType === "transfer"
            ? this.transferModal()
            : this.state.modalType === "auto"
              ? this.autoModal()
              : ""}
      </Container>
    );
  }
}
