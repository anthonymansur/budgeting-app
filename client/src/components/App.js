import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import axios from 'axios';

import Header from './Header';
import Footer from './Footer';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import TransactionPage from './TransactionPage';

export default class App extends Component {

  constructor(){
    super();
    this.state = { 
      auth: false 
    };
  }

  async componentDidMount() {
    this.user = await axios.get("/api/current_user");
    await this.setState({ auth: this.user.data ? true : false });
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div className="h-100">
            { this.state.auth ? <Header/> : '' }
            <Route exact path="/" render={() => this.state.auth ? <DashboardPage user={this.user.data}/> : <LoginPage />} />
            <Route exact path="/transactions" component={TransactionPage} />
            { this.state.auth ? <Footer/> : '' }
          </div>
        </BrowserRouter>
      </div>
    );
  }
};