import React from "react";
import {
  Container,
  Row,
  Col,
  Jumbotron,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  FormFeedback,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Card,
  CardBody,
  CardTitle
} from "reactstrap";
import axios from "axios";
import moment from "moment-timezone";
import numeral from "numeral";
import ToggleButton from "react-toggle-button";

const TIMEZONE = "America/New_York";
const now = moment().tz(TIMEZONE);
const formatNow = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default class BillPage extends React.Component {
  constructor() {
    super();
    this.state = {
      bills: [],
      modal: false,
      modalType: "",
      modalName: "",
      modalNameError: "",
      modalAmount: 0,
      modalAmountError: "",
      modalValue: false,
      modalDate: formatNow,
      modalReoccuringType: "",
      modalReoccuringTypeError: false,
      ismounted: false
    };
  }

  async componentDidMount() {
    try {
      const res = await axios.get("/api/bills");
      if (res.data.success) {
        this.setState({ bills: res.data.items[0] });
      } else {
        throw new Error(res.data.message);
      }
      this.setState({ ismounted: true });
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  }

  refreshState = () => {
    this.setState({
      modal: false,
      modalType: "",
      modalName: "",
      modalNameError: false,
      modalAmount: 0,
      modalAmountError: false,
      modalDate: formatNow,
      modalReoccuringType: "",
      modalReoccuringTypeError: false
    });
  };

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };

  toggleAdd = () => {
    this.setState({ modal: !this.state.modal, modalType: "add" });
  };

  onChange = event => {
    const name = event.target.name;
    const value = event.target.value;
    if (name === "name") {
      this.setState({ modalName: value.substring(0, 16) });
    }
    if (name === "amount") {
      this.setState({ modalAmount: parseFloat(value.substring(0, 10)) });
    }
    if (name === "date") {
      this.setState({ modalDate: value });
    }
    if (name === "reoccuringType") {
      this.setState({ modalReoccuringType: value });
    }
  };

  errorCheck = () => {
    let valid = true;
    if (this.state.modalName === "") {
      valid = false;
      this.setState({ modalNameError: true });
    } else {
      this.setState({ modalNameError: false });
    }
    if (this.state.modalAmount <= 0) {
      valid = false;
      this.setState({ modalAmountError: true });
    } else {
      this.setState({ modalAmountError: false });
    }
    if (this.state.modalValue) {
      if (this.state.modalReoccuringType === "") {
        valid = false;
        this.setState({ modalReoccuringTypeError: true });
      } else {
        this.setState({ modalReoccuringTypeError: false });
      }
    } else {
      this.setState({ modalReoccuringTypeError: false });
    }
    return valid;
  };

  onAddSubmit = async () => {
    try {
      if (this.errorCheck()) {
        const body = {
          name: this.state.modalName,
          amount: this.state.modalAmount,
          date: this.state.modalDate,
          is_reoccuring: this.state.modalValue
        };
        this.state.modalValue && (body.reoccuring_type = this.state.modalReoccuringType);
        console.log(body);
        const res = await axios.post("/api/bills", body);
        if (res.data.success) {
          this.refreshState();
          this.componentDidMount();
        } else {
          throw new Error(res.data.message);
        }
      }
    } catch (e) {
      console.log(e);
      alert(e);
    }
  };

  addBillModal = () => {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>Add a new Bill</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                value={this.state.modalName}
                invalid={this.state.modalNameError}
                onChange={this.onChange}
              />
              <FormFeedback>Please provide a name</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>Amount</Label>
              <InputGroup>
                <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                <Input
                  type="number"
                  name="amount"
                  id="amount"
                  value={this.state.modalAmount || ""}
                  invalid={this.state.modalAmountError}
                  onChange={this.onChange}
                />
              </InputGroup>
              <FormFeedback>Please choose a positive amount</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>Date of first payment</Label>
              <Input
                type="date"
                name="date"
                value={this.state.modalDate}
                onChange={this.onChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Is reoccuring?</Label>
              <ToggleButton
                inactiveLabel={
                  <i className="material-icons" style={{ fontSize: "2rem" }}>
                    close
                  </i>
                }
                activeLabel={
                  <i className="material-icons" style={{ fontSize: "2rem" }}>
                    check
                  </i>
                }
                value={this.state.modalValue}
                onToggle={value => {
                  this.setState({
                    modalValue: !value
                  });
                }}
              />
            </FormGroup>
            {this.state.modalValue && (
              <FormGroup>
                <Label for="category">Reoccuring Type</Label>
                <Input
                  type="select"
                  invalid={this.state.modalReoccuringTypeError}
                  name="reoccuringType"
                  value={this.state.modalReoccuringType}
                  onChange={this.onChange}
                >
                  <option value="none">Select a type</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="semiannually">Semiannually</option>
                  <option value="annually">Annually</option>
                </Input>
                <FormFeedback>Please choose a type</FormFeedback>
              </FormGroup>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onAddSubmit}>
            Add Bill
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  getDate = bill => {
    return moment(bill.date).format("MMM DD");
  };

  render() {
    return (
      <Container>
        <br />
        {this.state.bills.length > 0 ? (
          <div>
            <h1 className="white-text">Bills</h1>
            {this.state.bills.map(bill => {
              return (
                <div>
                  <Card>
                    <CardBody>
                      <CardTitle>
                        <Row>
                          <div className="col-auto mr-auto">{bill.name}</div>
                          <div className="col-auto" />
                        </Row>
                        <br />
                      </CardTitle>
                      <Row className="text-center">
                        <Col>
                          <h3>{bill.is_reoccuring ? bill.reoccuring_type : "One-time"}</h3>
                          <p className="text-muted">Type</p>
                        </Col>
                        <Col>
                          <h3>{this.getDate(bill)}</h3>
                          <p className="text-muted">Due</p>
                        </Col>
                        <Col>
                          <h3>{numeral(bill.amount).format("$0,0.00")}</h3>
                          <p className="text-muted">Amount</p>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                  <br />
                </div>
              );
            })}
          </div>
        ) : this.state.ismounted ? (
          <Jumbotron>
            <h1 className="display-3 text-center">Add Your First Bill</h1>
            <p className="lead text-center">Plan ahead and keep track of all your upcoming bills</p>
            <hr className="my-2" />
            <br />
            <p className="lead">
              <div className="d-flex justify-content-center">
                <Button block={true} color="success" onClick={this.toggleAdd}>
                  Add Bill
                </Button>
              </div>
            </p>
          </Jumbotron>
        ) : (
          ""
        )}
        {this.state.modalType === "add" ? this.addBillModal() : ""}
      </Container>
    );
  }
}
