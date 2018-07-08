import React, { Component } from "react";
import {
  Button,
  Container,
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
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Jumbotron
} from "reactstrap";
import axios from "axios";
import moment from "moment-timezone";
import numeral from "numeral";
import ToggleButton from "react-toggle-button";

const TIMEZONE = "America/New_York";
const now = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      modalType: "",
      modalAmount: 0,
      modalAmountError: false,
      modalDate: now,
      modalDescription: "",
      modalCategory: "",
      modalCategoryError: false,
      modalWallet: {},
      modalName: "",
      modalNameError: false,
      modalPercentage: 0,
      modalPercentageError: false,
      modalValue: false,
      income: 0,
      generalIncome: 0,
      expenses: 0,
      transactions: [],
      wallets: [],
      remainingPercentage: 100
    };
    this.toggle = this.toggle.bind(this);
    this.addMoneyToggle = this.addMoneyToggle.bind(this);
    this.removeMoneyToggle = this.removeMoneyToggle.bind(this);
    this.addWalletToggle = this.addWalletToggle.bind(this);
    this.editWalletToggle = this.editWalletToggle.bind(this);
    this.addToWallet = this.addToWallet.bind(this);
    this.errorCheck = this.errorCheck.bind(this);
    this.editWallet = this.editWallet.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getWalletBalance = this.getWalletBalance.bind(this);
    this.refreshState = this.refreshState.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this._ismounted = false;
  }

  async componentDidMount() {
    this._ismounted = true;
    try {
      const errorMessage = "";
      const walletResponse = await axios.get("/api/wallets");
      if (walletResponse.data.success) {
        const wallets = walletResponse.data.items[0];
        let remainingPercentage = 100;
        wallets.forEach(wallet => {
          remainingPercentage -= wallet.percentage;
        });
        this.setState({ wallets, remainingPercentage });
      } else {
        errorMessage.concat(walletResponse.data.message);
      }
      const transactionResponse = await axios.get("/api/transactions");
      if (transactionResponse.data.success) {
        this.setState({ transactions: transactionResponse.data.items[0] });
      } else {
        errorMessage.concat(transactionResponse.data.message);
      }
      if (errorMessage) {
        alert(errorMessage);
      } else {
        let income = 0;
        let generalIncome = 0;
        let expenses = 0;
        this.state.transactions.forEach(transaction => {
          if (transaction.type === "add") {
            transaction.wallet_id
              ? (income += transaction.amount)
              : (generalIncome += transaction.amount);
          } else if (transaction.type === "remove") {
            expenses += transaction.amount;
          }
        });
        this.setState({ income, generalIncome, expenses });
      }
    } catch (e) {
      alert(e.message);
    }
  }

  onChange = event => {
    if (event.target.name === "wallet-name") {
      this.setState({ modalName: event.target.value.substring(0, 16) });
    } else if (event.target.name === "slider") {
      this.setState({ modalPercentage: parseInt(event.target.value) });
    } else if (event.target.name === "category" && event.target.value !== "none") {
      this.setState({ modalCategory: event.target.value });
    } else if (event.target.name === "amount") {
      this.setState({
        modalAmount: parseFloat(event.target.value.substring(0, 10))
      });
    } else if (event.target.name === "description") {
      this.setState({ modalDescription: event.target.value.substring(0, 26) });
    } else if (event.target.name === "date") {
      this.setState({
        modalDate: moment(event.target.value)
          .tz(TIMEZONE)
          .format("YYYY-MM-DD")
      });
    }
  };

  refreshState = () => {
    const newState = {
      modalType: "",
      modal: false,
      modalAmount: 0,
      modalDate: now,
      modalDescription: "",
      modalCategory: "",
      modalWallet: {},
      modalName: "",
      modalPercentage: 0,
      modalValue: false
    };
    this.setState(newState);
  };

  errorCheck = () => {
    let valid = true;
    if (this.state.modalType.slice(-5) !== "money") {
      if (this.state.modalName === "") {
        valid = false;
        this.setState({ modalNameError: true });
      } else {
        this.setState({ modalNameError: false });
      }
      if (this.state.modalPercentage === 0) {
        valid = false;
        this.setState({ modalPercentageError: true });
      } else {
        this.setState({ modalPercentageError: false });
      }
    } else {
      if (this.state.modalAmount <= 0) {
        valid = false;
        this.setState({ modalAmountError: true });
      } else {
        this.setState({ modalAmountError: false });
      }
      if (this.state.modalCategory === "") {
        valid = false;
        this.setState({ modalCategoryError: true });
      } else {
        this.setState({ modalCategoryError: false });
      }
    }
    console.log(valid);
    return valid;
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
    this.refreshState();
  };

  addMoneyToggle = () => {
    this.setState({
      modal: !this.state.modal,
      modalType: "add-money",
      modalCategory: null,
      modalDate: now,
      modalValue: true
    });
  };

  removeMoneyToggle = () => {
    this.setState({
      modal: !this.state.modal,
      modalType: "remove-money",
      modalValue: false
    });
  };

  onSubmit = async () => {
    if (this.errorCheck()) {
      const body = {
        type: this.state.modalType === "add-money" ? "add" : "remove",
        amount: this.state.modalAmount,
        description: this.state.modalDescription,
        wallet_id: this.state.modalCategory,
        date: this.state.modalDate,
        taxable: this.state.modalType === "add-money" ? this.state.modalValue : !this.state.modalValue
      };
      try {
        const res = await axios.post("/api/transactions", body);
        if (res.data.success) {
          this.refreshState();
          await this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      } catch (e) {
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  };

  addWalletToggle = () => {
    this.setState({
      modal: !this.state.modal,
      modalName: "",
      modalType: "add-wallet",
      modalPercentage: this.state.remainingPercentage
    });
  };

  editWalletToggle(wallet) {
    this.setState({
      modal: !this.state.modal,
      modalWallet: wallet,
      modalName: wallet.category,
      modalNameError: false,
      modalPercentage: wallet.percentage,
      modalPercentageError: false,
      modalType: "edit-wallet"
    });
  }

  async addToWallet() {
    if (this.errorCheck()) {
      const body = {
        category: this.state.modalName,
        percentage: this.state.modalPercentage
      };
      try {
        const res = await axios.post("/api/wallets", body);
        if (!res.data.success) {
          alert(res.data.message);
        } else {
          this.refreshState();
          await this.componentDidMount();
        }
      } catch (e) {
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  }

  async editWallet() {
    if (this.errorCheck()) {
      const body = {
        wallet_id: this.state.modalWallet._id,
        update: {
          category: this.state.modalName,
          percentage: this.state.modalPercentage
        }
      };
      try {
        const res = await axios.put("/api/wallets", body);
        if (!res.data.success) {
          alert(res.data.message);
        } else {
          this.refreshState();
          await this.componentDidMount();
        }
      } catch (e) {
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  }

  async confirmDelete(wallet) {
    try {
      const name = prompt("Please enter the name of the wallet you want to delete");
      if (name.toLowerCase() === wallet.category.toLowerCase()) {
        const res = await axios.delete(`/api/wallets?id=${wallet._id}`);
        if (res.data.success) {
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
        this.setState({ modal: false });
      } else {
        alert("You entered an incorrect name");
        this.setState({ modal: false });
      }
    } catch (e) {
      alert(e.message);
    }
  }

  getWalletBalance(wallet) {
    let delta = 0;
    this.state.transactions.forEach(transaction => {
      if (transaction.wallet_id && transaction.wallet_id._id === wallet._id) {
          transaction.type === "add"
            ? (delta += transaction.amount)
            : (delta -= transaction.amount);
      }
    });
    return (this.state.generalIncome * (wallet.percentage / 100) + delta).toFixed(2);
  }

  walletModal() {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>
          {this.state.modalType === "add-wallet" ? "Add a new wallet" : "Edit existing wallet"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Name</Label>
              <Input
                invalid={this.state.modalNameError}
                type="text"
                name="wallet-name"
                value={this.state.modalName}
                onChange={this.onChange}
              />
              <FormFeedback>Please provide a name</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>Percentage: {this.state.modalPercentage}</Label>
              <Input
                invalid={this.state.modalPercentageError}
                type="range"
                min="0"
                max={
                  this.state.modalType === "add-wallet"
                    ? this.state.remainingPercentage
                    : this.state.modalWallet.percentage + this.state.remainingPercentage
                }
                value={this.state.modalPercentage}
                name="slider"
                onChange={this.onChange}
              />
              <FormFeedback>Cannot add a wallet with percent zero</FormFeedback>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          {this.state.modalType === "add-wallet" ? (
            <div>
              <Button color="secondary" onClick={this.toggle}>
                Cancel
              </Button>{" "}
              <Button color="primary" onClick={this.addToWallet}>
                Add Wallet
              </Button>
            </div>
          ) : (
            <div>
              <Button color="link" onClick={() => this.confirmDelete(this.state.modalWallet)}>
                Delete Wallet
              </Button>{" "}
              <Button color="primary" onClick={this.editWallet}>
                Edit Wallet
              </Button>
            </div>
          )}
        </ModalFooter>
      </Modal>
    );
  }

  moneyModal() {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>
          {this.state.modalType === "add-money" ? "Add new income" : "List new expense"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="amount">Amount</Label>
              <InputGroup>
                <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                <Input
                  invalid={this.state.modalAmountError}
                  type="number"
                  name="amount"
                  id="amount"
                  value={this.state.modalAmount || ""}
                  onChange={this.onChange}
                />
              </InputGroup>
              <FormFeedback>Please provide a positive amount</FormFeedback>
            </FormGroup>
            {this.state.modalType === "remove-money" ? (
              <FormGroup>
                <Label for="category">Category</Label>
                <Input
                  type="select"
                  invalid={this.state.modalCategoryError}
                  name="category"
                  id="category"
                  value={this.state.modalCategory}
                  onChange={this.onChange}
                >
                  <option value="none">Select a category</option>
                  {this.state.wallets.map(wallet => {
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
                  value={this.state.modalCategory}
                  onChange={this.onChange}
                >
                  <option value="none">Select a Wallet</option>
                  {this.state.wallets.map(wallet => {
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
              <Input
                type="date"
                name="date"
                id="date"
                value={this.state.modalDate}
                onChange={this.onChange}
              />
            </FormGroup>
            {this.state.modalType === "add-money" ? (
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
                  value={this.state.modalValue}
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
                  value={this.state.modalValue}
                  onToggle={value => {
                    this.setState({
                      modalValue: !value
                    });
                  }}
                />
              </FormGroup>
            )}
            <FormGroup>
              <Label for="description">Description</Label>
              <Input
                type="text"
                name="description"
                id="description"
                value={this.state.modalDescription}
                placeholder="optional"
                onChange={this.onChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onSubmit}>
            {this.state.modalType === "add-money" ? "Add money" : "Remove Money"}
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  render() {
    return (
      <Container>
        <Row>
          <Col md="3" />
          <Col md="6">
            {this.state.wallets.length > 0 ? (
              <div>
                <br />
                <Row className="white-text">
                  <div className="col-auto mr-auto">
                    <strong>Total Balance:</strong>
                  </div>
                  <div className="col-auto">
                    <strong>
                      {numeral(this.state.income + this.state.generalIncome - this.state.expenses).format("$0,0.00")}
                    </strong>
                  </div>
                </Row>
                <div className="balance-space" />
                {this.state.wallets.map(wallet => {
                  return (
                    <div key={wallet._id}>
                      <Card onClick={() => this.editWalletToggle(wallet)}>
                        <CardBody className="text-center">
                          <CardTitle className="card__title">{wallet.category}</CardTitle>
                          {this.getWalletBalance(wallet) >= 0 ? (
                            <p className="card__money">
                              {numeral(this.getWalletBalance(wallet)).format("$0,0.00")}
                            </p>
                          ) : (
                            <p className="card__money--red">
                              {numeral(this.getWalletBalance(wallet)).format("$0,0.00")}
                            </p>
                          )}
                        </CardBody>
                      </Card>
                      <br />
                    </div>
                  );
                })}
                <Button
                  className="text-right"
                  style={{ float: "right", marginTop: "-20px" }}
                  color="link"
                  onClick={this.addWalletToggle}
                >
                  Add New Wallet
                </Button>
                <br />
                <Row>
                  <Col xs="6">
                    <Button
                      color="success"
                      className="button--money"
                      size="lg"
                      onClick={this.addMoneyToggle}
                      block
                    >
                      Add
                    </Button>
                  </Col>
                  <Col xs="6">
                    <Button
                      color="danger"
                      className="button--money"
                      size="lg"
                      onClick={this.removeMoneyToggle}
                      block
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </div>
            ) : this._ismounted ? (
              <div>
                <div style={{ marginBottom: window.innerHeight * 0.1 }} />
                <div style={{ width: window.innerwidth * 0.8 }}>
                  <Jumbotron>
                    <h1 className="display-3 text-center">Add Your First Wallet!</h1>
                    <p className="lead text-center">
                      Choose a name and the percentage of your income that you want to allocate.
                    </p>
                    <hr className="my-2" />
                    <br />
                    <p className="lead">
                      <div className="d-flex justify-content-center">
                        <Button block={true} color="success" onClick={this.addWalletToggle}>
                          Add Wallet
                        </Button>
                      </div>
                    </p>
                  </Jumbotron>
                </div>
              </div>
            ) : (
              ""
            )}
          </Col>
          <Col md="3" />
        </Row>
        {this.state.modalType.slice(-5) === "money" ? this.moneyModal() : this.walletModal()}
      </Container>
    );
  }
}

export default DashboardPage;
