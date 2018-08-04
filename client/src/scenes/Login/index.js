import React from "react";
import { Card, CardBody, CardTitle, CardText, Button } from "reactstrap";

import "./styles.css";
import "./bootstrap-social.css";
import "font-awesome/css/font-awesome.min.css"; 

export default () => {
  return (
    <div className="row h-100 align-items-center justify-content-center" id="login-page">
      <div className="col-md-4" />
      <div className="col-md-4 text-center">
        <Card>
          <CardBody>
            <CardTitle className="text-center card__title">Budgeting App</CardTitle>
            <CardText>Manage your expenses in an easy and intuitive way.</CardText>
            <a className="btn btn-block btn-social btn-google small-text" href="/auth/google">
              <i className="fa fa-google" /> <span className="login-text">Sign in with Google</span>
            </a>
            <br />
            <a className="btn btn-block btn-social btn-facebook" href="/auth/facebook">
            <i className="fa fa-facebook-f" /><span className="login-text">Sign in with Facebook</span>
            </a>
          </CardBody>
        </Card>
      </div>
      <div className="col-md-4" />
    </div>
  );
};
