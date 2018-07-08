import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import axios from "axios";

import Header from "./Header";
import Footer from "./Footer";
import LoginPage from "./LoginPage";
import DashboardPage from "./DashboardPage";
import TransactionPage from "./TransactionPage";
import SummaryPage from "./SummaryPage";

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      auth: false
    };
    this._ismounted = false;
  }

  async componentDidMount() {
    this._ismounted = true;
    this.user = await axios.get("/api/current_user");
    await this.setState({ auth: this.user.data ? true : false });
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
                ) : this._ismounted ? (
                  <LoginPage />
                ) : (
                  ""
                )
              }
            />
            <Route exact path="/transactions" component={TransactionPage} />
            <Route exact path="/summary" component={SummaryPage} />
            {this.state.auth ? <Footer /> : ""}
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
