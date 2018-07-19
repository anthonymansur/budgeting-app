import React from "react";
import { Container, Row, Col, Jumbotron, Button } from "reactstrap";
import axios from "axios";

export default class GoalPage extends React.Component {
  constructor() {
    super();
    this.state = {
      goals: []
    };
  }

  async componentDidMount() {
    try {
      const res = await axios.get("/api/goals");
      if (res.data.success) {
        this.setState({ goals: res.data.items[0] });
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  }

  addGoalToggle = () => {};

  render() {
    return (
      <Container>
        <Row>
          <Col md={{ size: 8, offset: 2 }}>
            <br />
            {this.state.goals ? (
              <div>
                <div className="col-auto mr-auto">
                  <h1 className="white-text">Goals</h1>
                </div>
                <div className="col-auto">
                  <i className="material-icons">info_outline</i>
                </div>
              </div>
            ) : (
              <Jumbotron>
                <h1 className="display-3 text-center">Add Your First Goal!</h1>
                <p className="lead text-center">
                  Choose the amount and timespan of the goal you wish to complete
                </p>
                <hr className="my-2" />
                <br />
                <p className="lead">
                  <div className="d-flex justify-content-center">
                    <Button block={true} color="success" onClick={this.addGoalToggle}>
                      Add Goal
                    </Button>
                  </div>
                </p>
              </Jumbotron>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}
