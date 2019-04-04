import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import axios from "axios";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./scenes/Login";
import DashboardPage from "./scenes/Dashboard";
import TransactionPage from "./scenes/Transaction";
import SummaryPage from "./scenes/Summary";
import LoanPage from "./scenes/Loan";
import GoalPage from "./scenes/Goal";
import BillPage from "./scenes/Bill";

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      auth: false,
      ismounted: false
    };
  }

  async componentDidMount() {
    this.user = await axios.get("/current_user");
    await this.setState({ auth: this.user.data ? true : false, ismounted: true });
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div className="h-100">
            {this.state.auth ? <Header /> : ""}
            <Route
              exact
              path="/"
              render={() =>
                this.state.auth ? (
                  <DashboardPage user={this.user.data} />
                ) : this.state.ismounted ? (
                  <LoginPage />
                ) : (
                  ""
                )
              }
            />
            <Route exact path="/transactions" component={TransactionPage} />
            <Route exact path="/summary"      component={SummaryPage} />
            <Route exact path="/loans"        component={LoanPage} />
            <Route exact path="/goals"        component={GoalPage} />
            <Route exact path="/bills"        component={BillPage} />
            {this.state.auth ? <Footer /> : ""}
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
