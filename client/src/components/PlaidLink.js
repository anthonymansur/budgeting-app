import React, { Component } from 'react';
import PlaidLink from 'react-plaid-link';
import axios from 'axios';

export default class extends Component {

  constructor(props) {
    super(props);
    this.state = {
      items: props.items || null,
      token: props.token || null,
      title: props.title || null,
      id: props.id || null
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ items: nextProps.items || null, token: nextProps.token || null, title: nextProps.title || null, id: nextProps.id || null });
  }

  handleOnSuccess = async (public_token, metadata) => {
    try {
      if (this.state.token){
        const body = {
          active: true,
          update_required: false,
          public_token: null
        }
        const res = await axios.put("/api/item", body);
        if (!res.data.success) {
          alert(res.data.message);
        }
      } else {
        const res = await axios.post("/api/plaid/get_access_token", { public_token, metadata });
        if (res.data.success) {
          console.log("success");
        } else {
          throw new Error(res.data.message);
        }
      }
    } catch(e) {
      console.log(e);
      alert(e.error_message || e.message);
    }
  }
  handleOnExit = () => {

  }
  handleOnEvent = async (eventName, metadata) => {
    if (eventName === "SELECT_INSTITUTION") {
        let isUnique = true;
        this.state.items && this.state.items.forEach(item => {
          if (item.metadata.institution.institution_id === metadata.institution_id) {
            isUnique = false;
          }
        });
        if (!isUnique) {
          window.linkHandler.exit({force: true});
          alert(`You already have an account synced with ${metadata.institution_name}`);
        }
    }
  }

  render() {
    return (
      <PlaidLink
        clientName="Budgeting App"
        env="development"
        product={["transactions"]}
        publicKey="6b29161947afcd04a40ebc0f9092a7"
        token = {this.state.token}
        onExit={this.handleOnExit}
        onEvent={this.handleOnEvent}
        onSuccess={this.handleOnSuccess}
        className="btn btn-link"
        style={{ padding: "0", background:"none", border: "none" }}
        >
        { this.state.title || "Link your accounts" }
      </PlaidLink>
    )
  }
}