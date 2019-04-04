import React, { Component } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import axios from "axios";
import moment from "moment-timezone";
import numeral from "numeral";
import Joyride from "react-joyride";

import './styles.css'

import PlaidLink from "./components/PlaidLink";
import WalletCard from "./components/WalletCard";
import MoneyModal from "./components/MoneyModal";
import TransactionModal from "./components/TransactionModal";
import WalletModal from "./components/WalletModal";
import Jumbotron from "./components/Jumbotron";

const TIMEZONE = "America/New_York";
const now = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default class DashboardPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      newTransactions: [],
      expandTransaction: null,
      expandType: "",
      wallets: [],
      items: [],
      goals: [],
      income: 0,
      generalIncome: 0,
      expenses: 0,
      remainingPercentage: 100,
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
      modalValue: false,
      ismounted: false,
      modalWalletDate: "",
      modalSetWalletDate: false
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
      const transactionResponse = await axios.get("/api/transactions?show_all=true");
      if (transactionResponse.data.success) {
        const transactions = transactionResponse.data.items[0].filter(transaction => {
          return !transaction.status || transaction.status === "accepted";
        });
        const newTransactions = transactionResponse.data.items[0].filter(transaction => {
          return transaction.status && transaction.status === "pending";
        });
        this.setState({
          transactions,
          newTransactions
        });
        if (newTransactions && newTransactions.length > 0) {
          const newIncomeTransactions = newTransactions.filter(trans => {
            return trans.type === "add";
          });
          const newExpenseTransactions = newTransactions.filter(trans => {
            return trans.type === "remove";
          });
          if (this.state.expandType === "income" || this.state.expandType === "") {
            if (newIncomeTransactions.length === 0) {
              this.setState({ modalType: "new", modal: true, expandType: "expense" });
              this.expandTransaction(newExpenseTransactions[0]);
            } else {
              this.setState({ modalType: "new", modal: true, expandType: "income" });
              this.expandTransaction(newIncomeTransactions[0]);
            }
          } else {
            if (newExpenseTransactions.length === 0) {
              this.setState({ modalType: "new", modal: true, expandType: "expense" });
              this.gnsaction(newIncomeTransactions[0]);
            } else {
              this.setState({ modalType: "new", modal: true, expandType: "income" });
              this.expandTransaction(newExpenseTransactions[0]);
            }
          }
        } else {
          this.setState({ modalType: "", modal: false, expandType: "" });
        }
      } else {
        throw new Error(transactionResponse.data.message);
      }

      const goalResponse = await axios.get("/api/goals");
      if (goalResponse.data.success) {
        this.setState({ goals: goalResponse.data.items[0] });
      } else {
        throw new Error(goalResponse);
      }

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
      this.state.goals.forEach(goal => {
        goal.transfers.forEach(transfer => {
          expenses += transfer.amount;
        });
      });
      this.setState({
        income,
        generalIncome,
        expenses
      });

      const itemResponse = await axios.get("/api/items");
      if (itemResponse.data.success) {
        this.setState({ items: itemResponse.data.items[0] });
      } else {
        throw new Error(itemResponse.data.message);
      }

      this.setState({ ismounted: true });
    } catch (e) {
      console.log(e);
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
    } else if (event.target.name === "walletDate") {
      this.setState({
        modalWalletDate: moment(event.target.value)
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
      modalValue: false,
      modalSetWalletDate: false,
      modalWalletDate: ""
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
    return valid;
  };

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
    this.refreshState();
  };

  toggleWalletDate = () => {
    this.setState({
      modalSetWalletDate: !this.state.modalSetWalletDate
    });
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
        amount: this.state.modalAmount.toFixed(2),
        description: this.state.modalDescription,
        wallet_id: this.state.modalCategory,
        date: this.state.modalDate,
        taxable:
          this.state.modalType === "add-money" ? this.state.modalValue : !this.state.modalValue
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
        console.log(e);
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  };

  submitWalletDate = async () => {
    // Note to future self: check if user tries adding date < today's date
    try {
      const body = {
        wallet_id: this.state.modalWallet._id,
        update: {
          date: moment(this.state.modalWalletDate).toDate()
        }
      };
      const res = await axios.put("/api/wallets", body);
        if (res.data.success) {
          this.refreshState();
          await this.componentDidMount();
        } else {
          alert(res.data.message);
        }
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  }

  removeWalletDate = async () => {
    // Note to future self: check if user tries adding date < today's date
    try {
      const body = {
        wallet_id: this.state.modalWallet._id,
        update: {
          date: null
        }
      };
      const res = await axios.put("/api/wallets", body);
        if (res.data.success) {
          this.refreshState();
          await this.componentDidMount();
        } else {
          alert(res.data.message);
        }
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  }

  addWalletToggle = () => {
    this.setState({
      modal: !this.state.modal,
      modalName: "",
      modalType: "add-wallet",
      modalPercentage: this.state.remainingPercentage
    });
  };

  editWalletToggle = wallet => {
    this.setState({
      modal: !this.state.modal,
      modalWallet: wallet,
      modalName: wallet.category,
      modalNameError: false,
      modalPercentage: wallet.percentage,
      modalType: "edit-wallet",
      modalWalletDate: wallet.date
    });
  };

  addToWallet = async () => {
    if (this.errorCheck()) {
      const body = {
        category: this.state.modalName,
        percentage: this.state.modalPercentage
      };
      if (this.state.modalWalletDate) {
        body.date = this.state.modalWalletDate;
      }
      try {
        const res = await axios.post("/api/wallets", body);
        if (!res.data.success) {
          alert(res.data.message);
        } else {
          this.refreshState();
          await this.componentDidMount();
        }
      } catch (e) {
        console.log(e);
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  };

  editWallet = async () => {
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
        console.log(e);
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  };

  confirmDelete = async wallet => {
    try {
      const name = prompt("Please enter the name of the wallet you want to delete");
      if (name && name.toLowerCase() === wallet.category.toLowerCase()) {
        const res = await axios.delete(`/api/wallets?id=${wallet._id}`);
        if (res.data.success) {
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
        this.setState({ modal: false });
      } else if (name) {
        alert("You entered an incorrect name");
        this.setState({ modal: false });
      }
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  };

  getWalletBalance = wallet => {
    let delta = 0;
    this.state.transactions.forEach(transaction => {
      if (transaction.wallet_id && transaction.wallet_id._id === wallet._id) {
        transaction.type === "add" ? (delta += transaction.amount) : (delta -= transaction.amount);
      }
    });
    this.state.goals.forEach(goal => {
      goal.transfers.forEach(transfer => {
        if (transfer.wallet_id === wallet._id) {
          delta -= transfer.amount;
        }
      });
    });
    return (this.state.generalIncome * (wallet.percentage / 100) + delta).toFixed(2);
  };

  expandTransaction = transaction => {
    this.setState({
      expandTransaction: transaction,
      modalDescription: this.state.modalDescription ? this.state.modalDescription : transaction.description
    });
  };

  onEdit = async status => {
    let valid = true;
    if (this.state.modalCategory === "" && status !== "denied") {
      valid = false;
      this.setState({ modalCategoryError: true });
    } else {
      this.setState({ modalCategoryError: false });
    }
    if (valid) {
      let body = {};
      status === "accepted"
        ? (body = {
            transaction_id: this.state.expandTransaction._id,
            status,
            description: this.state.modalDescription,
            wallet_id: this.state.modalCategory,
            taxable:
              this.state.expandTransaction.type === "add"
                ? this.state.modalValue
                : !this.state.modalValue
          })
        : (body = { transaction_id: this.state.expandTransaction._id, status });
      try {
        const res = await axios.put("/api/transactions", body);
        if (res.data.success) {
          this.setState({ modal: true, modalCategory: "" });
          await this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      } catch (e) {
        console.log(e);
        alert(e.message);
      }
    }
  };

  onToggle = value => {
    this.setState({
      modalValue: !value
    });
  };

  callback = (data) => {
    const { action, index, type } = data;
  };

  render() {
    return (
      <Container>
        <Row>
          <Col md="3" />
          <Col md="6">
            {this.state.items.filter(item => {
              return item.update_required;
            }).length > 0
              ? this.state.items
                  .filter(item => {
                    return item.update_required;
                  })
                  .map(item => {
                    return (
                      <PlaidLink
                        token={item.public_token.public_token}
                        id={item._id}
                        title={`Update ${item.metadata.institution.name} required`}
                      />
                    );
                  })
              : ""}
            {this.state.wallets.length > 0 ? (
              <div>
                <br />
                <Row className="white-text">
                  <div className="col-auto mr-auto">
                    <strong>Total Balance:</strong>
                  </div>
                  <div className="col-auto">
                    <strong>
                      {numeral(
                        this.state.income + this.state.generalIncome - this.state.expenses
                      ).format("$0,0.00")}
                    </strong>
                  </div>
                </Row>
                {this.state.wallets.map(wallet => {
                  return (
                    <div key={wallet._id}>
                      <WalletCard
                        getWalletBalance={this.getWalletBalance}
                        editWalletToggle={this.editWalletToggle}
                        wallet={wallet}
                        transactions={this.state.transactions.filter(trans => {
                          if (trans.wallet_id) {
                            return trans.wallet_id._id === wallet._id
                          } else {
                            return false;
                          }
                        })}
                      />
                      <br />
                    </div>
                  );
                })}
                <Row style={{ marginTop: "-20px" }}>
                  <div className="col-auto mr-auto">
                    <PlaidLink items={this.state.items} />
                  </div>
                  <div className="col-auto">
                    <Button
                      className="text-right"
                      color="link"
                      onClick={this.addWalletToggle}
                      style={{ padding: "0" }}
                    >
                      Add New Wallet
                    </Button>
                  </div>
                </Row>
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
            ) : this.state.ismounted ? (
              <Jumbotron addWalletToggle={this.addWalletToggle} />
            ) : (
              ""
            )}
          </Col>
          <Col md="3" />
        </Row>
        {this.state.modalType.slice(-5) === "money" ? (
          <MoneyModal
            state={this.state}
            toggle={this.toggle}
            onToggle={this.onToggle}
            onChange={this.onChange}
            onSubmit={this.onSubmit}
          />
        ) : this.state.modalType.slice(-6) === "wallet" ? (
          <WalletModal
            state={this.state}
            toggle={this.toggle}
            onChange={this.onChange}
            addToWallet={this.addToWallet}
            editWallet={this.editWallet}
            confirmDelete={this.confirmDelete}
            toggleWalletDate={this.toggleWalletDate}
            submitWalletDate={this.submitWalletDate}
            removeWalletDate={this.removeWalletDate}
          />
        ) : this.state.modalType === "new" && this.state.expandTransaction ? (
          <TransactionModal
            state={this.state}
            toggle={this.toggle}
            expandTransaction={this.expandTransaction}
            onToggle={this.onToggle}
            onChange={this.onChange}
            onEdit={this.onEdit}
          />
        ) : ""}
        <br />
      </Container>
    );
  }
}
