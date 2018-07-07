import React from "react";
import { Container, Row, Button, ButtonGroup } from "reactstrap";
import axios from "axios";
import numeral from "numeral";
import moment from "moment-timezone";
import DoughnutChart from "./DoughnutChart";
import Expenses from "./Expenses";

const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);

//TODO: fix change date for week

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
        const expenses = res.data.items[0].filter(trans => { return trans.type === "remove" });
        this.setState({
          transactions: expenses,
          showTransactions: expenses
        });
      } else {
        throw new Error(res.data.message);
      }
      const wRes = await axios.get("/api/wallets");
      if (wRes.data.success) {
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
        return moment(trans.date).utc().year() === now.year();
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
          moment(trans.date).utc().year() === now.year() &&
          moment(trans.date).utc().month() === now.month()
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
          moment(trans.date).utc().year() === now.year() &&
          moment(trans.date).utc().week() === now.week()
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
          moment(trans.date).utc().year() === now.year() &&
          moment(trans.date).utc().dayOfYear() === now.dayOfYear()
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

  changeDate = action => {
    if (this.state.renderType === "year") {
      const year = action === "less" ? this.state.year - 1 : this.state.year + 1;
      const showTransactions = this.state.transactions.filter(trans => {
        return moment(trans.date).utc().year() === year;
      })
      this.setState({ showTransactions, year });
    } else if (this.state.renderType === "month") {
      let year = 0;
      let month = 0;
      if (action === "less") {
        if (this.state.month > 0){
          month = this.state.month - 1;
          year = this.state.year;
        }
        else {
          month = 11;
          year = this.state.year - 1;
        }  
      } else {
        if (this.state.month < 11) {
          month = this.state.month + 1;
          year = this.state.year;
        } else {
          month = 0;
          year = this.state.year + 1;
        }
      } 
      const showTransactions = this.state.transactions.filter(trans => {
        return moment(trans.date).utc().year() === year && moment(trans.date).utc().month() === month;
      });
      this.setState({ showTransactions, year, month });
    } else if (this.state.renderType === "week") {
      let week;
      let year;
      if (action === "less") {
        if (this.state.week > 1) {
          week = this.state.week - 1;
          year = this.state.year
        } else {
          week = 53;
          year = this.state.year - 1;
        }
      } else {
        if (this.state.week < 53) {
          week = this.state.week + 1;
          year = this.state.year;
        } else {
          week = 1;
          year = this.state.year + 1;
        }
      }
      const showTransactions = this.state.transactions.filter(trans => {
        return moment(trans.date).utc().year() === year && moment(trans.date).utc().week() === week;
      });
      this.setState({ showTransactions, year, week });
    } else {
      let day;
      let year;
      if (action === "less") {
        if (this.state.day > 1) {
          day = this.state.day - 1;
          year = this.state.year
        } else {
          day = 366;
          year = this.state.year - 1;
        }
      } else {
        if (this.state.day < 366) {
          day = this.state.day + 1;
          year = this.state.year;
        } else {
          day = 1;
          year = this.state.year + 1;
        }
      }
      const showTransactions = this.state.transactions.filter(trans => {
        return moment(trans.date).utc().year() === year && moment(trans.date).utc().dayOfYear() === day;
      });
      this.setState({ showTransactions, year, day });
    }
  }

  render() {
    let title = "";
    if (this.state.renderType === "all") {
      title = "Showing All Transactions";
    } else if (this.state.renderType === "year") {
      title = this.state.year;
    } else if (this.state.renderType === "month") {
      title = moment(`${this.state.month + 1}-${this.state.year}`, 'MM-YYYY').format('MMMM, YYYY');
    } else if (this.state.renderType === "week") {
      title =`${moment(`${this.state.year}-${this.state.week}`, 'YYYY-ww').format('MMMM DD')} to 
      ${moment(`${this.state.year}-${this.state.week}`, 'YYYY-ww').add(7, "days").format('MMMM DD of YYYY')}`;
    } else {
      title = moment(`${this.state.year}-${this.state.day}`, 'YYYY-DDDD').format('MMMM DD, YYYY');
    }
    return (
      <Container>
        <br />
        <h1 className="white-text">{ title }</h1>
        {this.state.renderType !== "all" ? 
          <ButtonGroup style={{height:"35px"}}>
            <Button color="info" onClick={() => this.changeDate("less")}><i className="medium material-icons">arrow_back</i></Button>
            <Button color="info" onClick={() => this.changeDate("more")}><i className="medium material-icons">arrow_forward</i></Button>
          </ButtonGroup> : 
          ""
        }
        <br />
        <br />
        <DoughnutChart
          transactions={this.state.showTransactions}
          wallets={this.state.wallets}
        />
        <br />
        <Row className="d-flex justify-content-between">
          <Button
            color="link"
            disabled={this.state.renderType === "day"}
            onClick={() => this.onClick("day")}
          >
            Daily
          </Button>{" "}
          <Button
            color="link"
            disabled={this.state.renderType === "week"}
            onClick={() => this.onClick("week")}
          >
            Weekly
          </Button>{" "}
          <Button
            color="link"
            disabled={this.state.renderType === "month"}
            onClick={() => this.onClick("month")}
          >
            Monthly
          </Button>{" "}
          <Button
            color="link"
            disabled={this.state.renderType === "year"}
            onClick={() => this.onClick("year")}
          >
            Yearly
          </Button>{" "}
          <Button
            color="link"
            disabled={this.state.renderType === "all"}
            onClick={() => this.onClick("all")}
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
