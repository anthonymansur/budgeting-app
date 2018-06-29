import React from "react";
import { Container, Row, Button } from "reactstrap";
import axios from "axios";
import numeral from "numeral";
import moment from "moment-timezone";
import DoughnutChart from "./DoughnutChart";
import Expenses from "./Expenses";

const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);

export default class SummaryPage extends React.Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
      wallets: [],
      year: null,
      month: null,
      week: null,
      day: null,
      showTransactions: [],
      renderType: "all"
    };
  }

  async componentDidMount() {
    try {
      const res = await axios.get("/api/transactions");
      if (res.data.success) {
        this.setState({
          transactions: res.data.items[0],
          showTransactions: res.data.items[0]
        });
      } else {
        throw new Error(res.data.message);
      }
      const wRes = await axios.get("/api/wallets");
      if (wRes.data.success) {
        console.log(wRes.data);
        this.setState({ wallets: wRes.data.items[0] });
      } else {
        throw new Error(wRes.data.message);
      }
    } catch (e) {
      alert(e.message);
    }
  }

  onClick = renderType => {
    if (renderType === "all") {
      const showTransactions = this.state.transactions;
      this.setState({
        showTransactions,
        renderType,
        year: null,
        month: null,
        week: null,
        day: null
      });
    } else if (renderType === "year") {
      const showTransactions = this.state.transactions.filter(trans => {
        return moment(trans.date).year() === now.year();
      });
      this.setState({
        showTransactions,
        renderType,
        year: now.year(),
        month: null,
        week: null,
        day: null
      });
    } else if (renderType === "month") {
      const showTransactions = this.state.transactions.filter(trans => {
        return (
          moment(trans.date).year() === now.year() &&
          moment(trans.date).month() === now.month()
        );
      });
      this.setState({
        showTransactions,
        renderType,
        year: now.year(),
        month: now.month(),
        week: null,
        day: null
      });
    } else if (renderType === "week") {
      const showTransactions = this.state.transactions.filter(trans => {
        return (
          moment(trans.date).year() === now.year() &&
          moment(trans.date).week() === now.week()
        );
      });
      this.setState({
        showTransactions,
        renderType,
        year: now.year(),
        month: null,
        week: now.week(),
        day: null
      });
    } else {
      const showTransactions = this.state.transactions.filter(trans => {
        return (
          moment(trans.date).year() === now.year() &&
          moment(trans.date).dayOfYear() === now.dayOfYear()
        );
      });
      this.setState({
        showTransactions,
        renderType,
        year: now.year(),
        month: null,
        week: null,
        day: now.dayOfYear()
      });
    }
  };

  render() {
    return (
      <Container>
        <br />
        <h1 className="white-text">June</h1>
        <br />
        <DoughnutChart
          transactions={this.state.showTransactions}
          wallets={this.state.wallets}
        />
        <br />
        <Row>
          <Button
            color="info"
            disabled={this.state.renderType === "day"}
            onClick={() => this.onClick("day")}
            style={{ marginLeft: "10px", marginRight: "10px" }}
          >
            Daily
          </Button>{" "}
          <Button
            color="info"
            disabled={this.state.renderType === "week"}
            onClick={() => this.onClick("week")}
            style={{ marginRight: "10px" }}
          >
            Weekly
          </Button>{" "}
          <Button
            color="info"
            disabled={this.state.renderType === "month"}
            onClick={() => this.onClick("month")}
            style={{ marginRight: "10px" }}
          >
            Monthly
          </Button>{" "}
          <Button
            color="info"
            disabled={this.state.renderType === "year"}
            onClick={() => this.onClick("year")}
            style={{ marginRight: "10px" }}
          >
            Yearly
          </Button>{" "}
          <Button
            color="info"
            disabled={this.state.renderType === "all"}
            onClick={() => this.onClick("all")}
            style={{ marginRight: "10px" }}
          >
            All-time
          </Button>{" "}
        </Row>
        <br />
        <Expenses transactions={this.state.showTransactions}/>
      </Container>
    );
  }
}
