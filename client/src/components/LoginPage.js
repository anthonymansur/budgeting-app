import React from 'react';
import { Card, CardBody, CardTitle, CardText, Button } from 'reactstrap';

export default () => {
  return (
    <div className="row h-100 align-items-center justify-content-center" id="login-page">
      <div className="col-md-4" />
      <div className="col-md-4 text-center">
        <Card>
          <CardBody>
            <CardTitle className="text-center card__title">
              Budgeting App
            </CardTitle>
            <CardText>
              Manage your expenses in an easy and intuitive way.
            </CardText>
            <Button className="button" color="primary" href="/auth/google">Login With Google</Button>
          </CardBody>
        </Card>
      </div> 
      <div className="col-md-4" />  
    </div>
  );
};