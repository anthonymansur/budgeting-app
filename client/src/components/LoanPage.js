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
  InputGroup,
  InputGroupAddon,
  Label,
  Form,
  FormFeedback
} from "reactstrap";
import axios from "axios";
import moment from "moment";
import numeral from "numeral";
import ToggleButton from "react-toggle-button";
import { DateRangePicker } from "react-dates";

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
      modalLoan: {},
      modalAmount: 0,
      modalAmountError: false,
      modalPerson: "",
      modalPersonError: false,
      modalDate: now,
      modalPerson: "",
      startDate: null,
      endDate: null,
      modalValue: null,
      renderEdit: false
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
      modal: !this.state.modal,
      renderEdit: false
    });
  };

  toggleEdit = (loan, type) => {
    this.setState({
      modal: !this.state.modal,
      modalLoan: loan,
      renderEdit: !this.state.renderEdit,
      modalType: type,
      modalAmount: loan.amount,
      modalDate: moment(loan.date)
        .utc()
        .format("YYYY-MM-DD"),
      modalPerson: type === "donated" ? loan.recipient : loan.lender,
      modalValue: loan.paid,
      modalDescription: loan.description
    });
  };

  onClick = type => {
    this.setState({
      modalType: type
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
          (!this.state.endDate || moment(loan.date).isSameOrBefore(moment(this.state.endDate))) &&
          !loan.paid
        ) {
          amount += loan.amount;
        }
      }
    });
    return amount;
  };

  onChange = e => {
    if (e.target.name === "amount") {
      this.setState({ modalAmount: parseFloat(e.target.value.substring(0, 10)) });
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
      modalPerson: "",
      renderEdit: false,
      modal: !this.state.modal
    });
  };

  onAddSubmit = async () => {
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
    }
  };

  onEditSubmit = async () => {
    if (this.errorCheck()) {
      const body = {
        amount: this.state.modalAmount,
        description: this.state.modalDescription,
        recipient: this.state.modalType === "donated" ? this.state.modalPerson : null,
        donor: this.state.modalType === "received" ? this.state.modalPerson : null,
        date: this.state.modalDate,
        paid: this.state.modalValue,
        loan_id: this.state.modalLoan._id
      };
      try {
        const res = await axios.put("/api/loans", body);
        if (res.data.success) {
          this.refreshState();
          await this.componentDidMount();
        } else {
          alert(res.data.message);
        }
      } catch (e) {
        alert(e.message);
      }
    }
  };

  onDeleteSubmit = async () => {
    const loanId = this.state.modalLoan._id;
    try {
      const res = await axios.delete(`/api/loans?id=${loanId}`);
      if (res.data.success) {
        this.refreshState();
        this.componentDidMount();
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  addLoanModal = () => {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>
          <h1>
            {this.state.modalType === "donated"
              ? "Record a loan you lent"
              : "Record a loan you received"}
          </h1>
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Amount</Label>
              <InputGroup>
                <InputGroupAddon addonType="prepend">$</InputGroupAddon>
                <Input
                  invalid={this.state.modalAmountError}
                  type="number"
                  name="amount"
                  value={this.state.modalAmount || ""}
                  onChange={this.onChange}
                />
              </InputGroup>
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
          <Button color="primary" onClick={this.onAddSubmit}>
            Add Loan
          </Button>{" "}
          <Button color="secondary" onClick={this.toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  editLoanModal = loan => {
    return (
      <Modal
        isOpen={this.state.modal}
        toggle={() => this.toggleEdit(loan, this.state.modalType)}
        className={this.props.className}
      >
        <ModalHeader toggle={() => this.toggleEdit(loan, this.state.modalType)}>
          <h1>Edit Loan</h1>
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Status</Label>
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
          <Button color="link" onClick={this.onDeleteSubmit}>
            Delete Loan
          </Button>{" "}
          <Button color="primary" onClick={this.onEditSubmit}>
            Edit Loan
          </Button>
        </ModalFooter>
      </Modal>
    );
  };

  render() {
    return (
      <Container>
        <br />
        <Row>
          <div className="col-auto mr-auto">
            <h1 className="white-text">Loans</h1>
          </div>
          <div className="col-auto">
            <DateRangePicker
              startDate={this.state.startDate} // momentPropTypes.momentObj or null,
              startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
              endDate={this.state.endDate} // momentPropTypes.momentObj or null,
              endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
              onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
              focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
              small={true}
              numberOfMonths={1}
              isOutsideRange={date => false}
            />
          </div>
        </Row>
        <br />
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
                  <th>{window.innerWidth < 400 ? "To" : "Loaned To"}</th>
                  <th>Date</th>
                  <th>{window.innerWidth < 400 ? "Desc." : "Description"}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.loans
                  .filter(loan => {
                    return (
                      loan.recipient &&
                      (!this.state.startDate ||
                        moment(loan.date).dayOfYear() >=
                          moment(this.state.startDate).dayOfYear()) &&
                      (!this.state.endDate ||
                        moment(loan.date).dayOfYear() <= moment(this.state.endDate).dayOfYear())
                    );
                  })
                  .sort((a, b) => {
                    if (
                      moment(a.date)
                        .utc()
                        .years() >
                      moment(b.date)
                        .utc()
                        .years()
                    ) {
                      return -1;
                    } else if (
                      moment(a.date)
                        .utc()
                        .years() <
                      moment(b.date)
                        .utc()
                        .years()
                    ) {
                      return 1;
                    } else if (
                      moment(a.date)
                        .utc()
                        .dayOfYear() >
                      moment(b.date)
                        .utc()
                        .dayOfYear()
                    ) {
                      return -1;
                    } else if (
                      moment(a.date)
                        .utc()
                        .dayOfYear() <
                      moment(b.date)
                        .utc()
                        .dayOfYear()
                    ) {
                      return 1;
                    } else if (a.amount > b.amount) {
                      return -1;
                    } else if (a.amount < b.amount) {
                      return 1;
                    } else {
                      return 0;
                    }
                  })
                  .map(loan => {
                    return (
                      <tr
                        className={loan.status ? "text-muted" : ""}
                        onClick={() => {
                          this.toggleEdit(loan, "donated");
                        }}
                        className={loan.paid ? "text-muted" : ""}
                      >
                        <th scope="row">
                          {window.innerWidth < 400
                            ? numeral(loan.amount).format("$0,0")
                            : numeral(loan.amount).format("$0,0.00")}
                        </th>
                        <td>
                          {loan.recipient
                            ? window.innerWidth < 400
                              ? window.innerWidth < 350
                                ? loan.recipient.length > 6
                                  ? `${loan.recipient.substring(0, 7)}.`
                                  : `${loan.recipient.substring(0, 7)}`
                                : loan.recipient.substring(0, 10)
                              : loan.recipient
                            : "None"}
                        </td>
                        <td>
                          {window.innerWidth < 400
                            ? moment(loan.date)
                                .utc()
                                .format("MM/DD/YY")
                            : moment(loan.date)
                                .utc()
                                .format("MMMM DD, YYYY")}
                        </td>
                        <td>
                          {loan.description
                            ? window.innerWidth < 400
                              ? window.innerWidth < 350
                                ? loan.description.length > 6
                                  ? `${loan.description.substring(0, 7)}.`
                                  : `${loan.description.substring(0, 7)}`
                                : loan.description.substring(0, 10)
                              : loan.description
                            : "None"}
                        </td>
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
        <br />
        <Card>
          <CardBody>
            <CardTitle>
              <Row>
                <div className="col-auto mr-auto">
                  <h1>Owed By You</h1>
                </div>
                <div className="col-auto">
                  <strong>{numeral(this.getAmount("received")).format("$0,0.00")}</strong>
                </div>
              </Row>
            </CardTitle>
            <Table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>{window.innerWidth < 400 ? "By" : "Loaned By"}</th>
                  <th>Date</th>
                  <th>{window.innerWidth < 400 ? "Desc." : "Description"}</th>
                </tr>
              </thead>
              <tbody>
                {this.state.loans.map(loan => {
                  return (
                    loan.donor && (
                      <tr
                        className={loan.status ? "text-muted" : ""}
                        onClick={() => {
                          this.toggleEdit(loan, "received");
                        }}
                      >
                        <th scope="row">
                          {window.innerWidth < 400
                            ? numeral(loan.amount).format("$0,0")
                            : numeral(loan.amount).format("$0,0.00")}
                        </th>
                        <td>
                          {loan.donor
                            ? window.innerWidth < 400
                              ? window.innerWidth < 350
                                ? loan.donor.length > 6
                                  ? `${loan.donor.substring(0, 7)}.`
                                  : `${loan.donor.substring(0, 7)}`
                                : loan.donor.substring(0, 10)
                              : loan.donor
                            : "None"}
                        </td>
                        <td>
                          {window.innerWidth < 400
                            ? moment(loan.date)
                                .utc()
                                .format("MM/DD/YY")
                            : moment(loan.date)
                                .utc()
                                .format("MMMM DD, YYYY")}
                        </td>
                        <td>
                          {loan.description
                            ? window.innerWidth < 400
                              ? window.innerWidth < 350
                                ? loan.description.length > 6
                                  ? `${loan.description.substring(0, 7)}.`
                                  : `${loan.description.substring(0, 7)}`
                                : loan.description.substring(0, 10)
                              : loan.description
                            : "None"}
                        </td>
                      </tr>
                    )
                  );
                })}
              </tbody>
            </Table>
          </CardBody>
        </Card>
        <Button color={"danger"} block={true} onClick={() => this.onClick("received")}>
          Add new loan
        </Button>
        <div>
          {this.state.renderEdit ? this.editLoanModal(this.state.modalLoan) : this.addLoanModal()}
        </div>
      </Container>
    );
  }
}
