import React from "react";
import { Container, Row, Col, Button, Tooltip } from "reactstrap";
import axios from "axios";
import moment from "moment-timezone";
import numeral from "numeral";

import AddUpdateModal from "./components/AddUpdateModal";
import TransferModal from "./components/TransferModal";
import AutoModal from "./components/AutoModal";
import RedeemModal from "./components/RedeemModal";
import GoalCard from "./components/GoalCard";
import MetGoals from "./components/MetGoals";
import Jumbotron from "./components/Jumbotron";

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
    console.log("add");
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

  toggleRedeem = goal => {
    this.setState({
      modal: !this.state.modal,
      modalType: "redeem",
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
              wallet_id: this.state.modalWallet,
              date: formattedNow
            }
          }
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

  onRedeemSubmit = async () => {
    try {
      const body = {
        status: "met"
      };
      const res = await axios.put(`/api/goals/${this.state.modalGoal._id}`, body);
      if (res.data.success) {
        this.refreshState();
        this.componentDidMount();
      } else {
        alert(res.data.message);
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
                      return (
                        <div>
                          <GoalCard
                            goal={goal}
                            toggleAuto={this.toggleAuto}
                            disableAuto={this.disableAuto}
                            toggleRedeem={this.toggleRedeem}
                            toggleTransfer={this.toggleTransfer}
                            toggleUpdate={this.toggleUpdate}
                            onDelete={this.onDelete}
                          />
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
              {this.state.goals.filter(goal => {
                return goal.status === "met";
              }).length !== 0 && (
                <div>
                  <h1 className="white-text">Met Goals</h1>
                  <br />
                </div>
              )}
              <MetGoals state={this.state} />
            </Col>
          </Row>
        ) : this.state.ismounted ? (
          <Row>
            <Col md={{ size: "8", offset: "2" }}>
              <Jumbotron toggleAddGoal={this.toggleAddGoal} />
            </Col>
          </Row>
        ) : (
          ""
        )}
        {this.state.modalType === "add" || this.state.modalType === "update" ? (
          <AddUpdateModal
            state={this.state}
            toggle={this.toggle}
            onChange={this.onChange}
            onAddSubmit={this.onAddSubmit}
            onUpdateSubmit={this.onUpdateSubmit}
            formattedNow={formattedNow}
          />
        ) : this.state.modalType === "transfer" ? (
          <TransferModal
            state={this.state}
            toggle={this.toggle}
            onChange={this.onChange}
            onTransferSubmit={this.onTransferSubmit}
          />
        ) : this.state.modalType === "auto" ? (
          <AutoModal
            state={this.state}
            toggle={this.toggle}
            onChange={this.onChange}
            onAutoSubmit={this.onAutoSubmit}
          />
        ) : this.state.modalType === "redeem" ? (
          <RedeemModal
            state={this.state}
            toggle={this.toggle}
            onRedeemSubmit={this.onRedeemSubmit}
          />
        ) : (
          ""
        )}
      </Container>
    );
  }
}
