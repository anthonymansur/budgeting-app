import React from "react";
import {
  Container,
  Row,
  Card,
  CardTitle,
  CardBody,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Input,
  Label,
  Form,
  FormFeedback
} from "reactstrap";
import axios from "axios";
import moment from "moment";
import numeral from "numeral";
import ToggleButton from "react-toggle-button";

const TIMEZONE = "America/New_York";
const now = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default class LoanPage extends React.Component {
  constructor() {
    super();
    this.state = {
      loans: [],
      modal: false,
      modalType: "",
      modalAmount: 0,
      modalAmountError: false,
      modalPerson: "",
      modalPersonError: false,
      modalDate: now,
      modalPerson: "",
      startDate: null,
      endDate: null,
      modalValue: null
    };
  }

  async componentDidMount() {
    try {
      const res = await axios.get("/api/loans");
      if (res.data.success) {
        this.setState({ loans: res.data.items[0] });
      } else {
        throw new Error(res.data.message);
      }
    } catch (e) {
      console.log(e);
      alert(e.message);
    }
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  onClick = type => {
    this.setState({
      modalType: type,
    });
    this.toggle();
  };

  getAmount = type => {
    let amount = 0;
    this.state.loans.forEach(loan => {
      if (loan.type === type) {
        if (
          (!this.state.startDate ||
            moment(loan.date).isSameOrAfter(moment(this.state.startDate))) &&
          (!this.state.endDate || moment(loan.date).isSameOrBefore(moment(this.state.endDate)))
        ) {
          amount += loan.amount;
        }
      }
    });
    return amount;
  };

  onChange = e => {
    if (e.target.name === "amount") {
      this.setState({ modalAmount: e.target.value });
    } else if (e.target.name === "person") {
      this.setState({ modalPerson: e.target.value.substring(0, 21) });
    } else if (e.target.name === "date") {
      this.setState({ modalDate: e.target.value });
    } else if (e.target.name === "description") {
      this.setState({ modalDescription: e.target.value.substring(0, 26) });
    }
  };

  errorCheck = () => {
    let valid = true;
    if (this.state.modalAmount <= 0) {
      valid = false;
      this.setState({ modalAmountError: true });
    } else {
      this.setState({ modalAmountError: false });
    }
    if (this.state.modalPerson === "") {
      valid = false;
      this.setState({ modalPersonError: true });
    } else {
      this.setState({ modalPersonError: false });
    }
    return valid;
  };

  refreshState = () => {
    this.setState({
      modalType: "",
      modalAmount: 0,
      modalAmountError: false,
      modalPerson: "",
      modalPersonError: false,
      modalDate: now,
      modalPerson: ""
    });
  };

  onSubmit = async () => {
    if (this.errorCheck()) {
      const body = {
        type: this.state.modalType,
        amount: this.state.modalAmount,
        description: this.state.modalDescription,
        recipient: this.state.modalType === "donated" ? this.state.modalPerson : null,
        donor: this.state.modalType === "received" ? this.state.modalPerson : null,
        date: this.state.modalDate
      };
      try {
        const res = await axios.post("/api/loans", body);
        if (res.data.success) {
          this.refreshState();
          await this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      } catch (e) {
        alert(e.message);
      }
      this.setState({ modal: false });
    }
  };

  addLoanModal = () => {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>
          {this.state.modalType === "donated"
            ? "Record a loan you lent"
            : "Record a loan you received"}
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Amount</Label>
              <Input
                invalid={this.state.modalAmountError}
                type="number"
                name="amount"
                value={this.state.modalAmount}
                onChange={this.onChange}
              />
              <FormFeedback>Please provide a positive amount</FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>{this.state.modalType === "donated" ? "Recipient" : "Lender"}</Label>
              <Input
                invalid={this.state.modalPersonError}
                type="text"
                name="person"
                value={this.state.modalPerson}
                onChange={this.onChange}
              />
              <FormFeedback>
                Please provide a {this.state.modalType === "donated" ? "recipient" : "lender"}
              </FormFeedback>
            </FormGroup>
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                name="date"
                value={this.state.modalDate}
                onChange={this.onChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="String"
                name="description"
                value={this.state.modalDescription}
                onChange={this.onChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.onSubmit}>
            Add Loan
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  render() {
    return (
      <Container>
        <br />
        <h1 className="white-text">Loans</h1>
        <Card>
          <CardBody>
            <CardTitle>
              <Row>
                <div className="col-auto mr-auto">
                  <h1>Owed To You</h1>
                </div>
                <div className="col-auto">
                  <strong>{numeral(this.getAmount("donated")).format("$0,0.00")}</strong>
                </div>
              </Row>
            </CardTitle>
            <Table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Loaned To</th>
                  <th>Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {this.state.loans.map(loan => {
                  return (
                    <tr className={loan.status ? "text-muted" : ""}>
                      <th scope="row">{numeral(loan.amount).format("$0,0.00")}</th>
                      <td>{loan.recipient}</td>
                      <td>
                        {moment(loan.date)
                          .utc()
                          .format("MMMM DD, YYYY")}
                      </td>
                      <td>{loan.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
        <Button color={"success"} block={true} onClick={() => this.onClick("donated")}>
          Add new loan
        </Button>
        <div>{this.addLoanModal()}</div>
      </Container>
    );
  }
}
