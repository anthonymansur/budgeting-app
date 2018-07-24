import React from "react";
import {
  Table,
  Button,
  Card,
  CardTitle,
  CardText,
  CardBody,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import moment from "moment-timezone";
import axios from "axios";
import numeral from "numeral";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import ToggleButton from "react-toggle-button";

const TIMEZONE = "America/New_York";
const now = moment()
  .tz(TIMEZONE)
  .format("YYYY-MM-DD");

export default class TransactionPage extends React.Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
      wallets: [],
      startDate: null,
      endDate: null,
      focusedInput: null,
      modalTransaction: {},
      modalType: null,
      modalAmount: null,
      modalCategory: "",
      modalDate: null,
      modalDescription: null,
      modalValue: null
    };
  }

  getAmount = (type) => {
    let amount = 0;
    this.state.transactions.forEach(transaction => {
      if (transaction.type === type) {
        if (
          (!this.state.startDate ||
            moment(transaction.date).isSameOrAfter(moment(this.state.startDate))) &&
          (!this.state.endDate ||
            moment(transaction.date).isSameOrBefore(moment(this.state.endDate)))
        ) {
          amount += transaction.amount;
        }
      }
    });
    return amount;
  }

  async componentDidMount() {
    try {
      const errorMessage = "";
      const transactionResponse = await axios.get("/api/transactions");
      if (transactionResponse.data.success) {
        this.setState({ transactions: transactionResponse.data.items[0] });
      } else {
        errorMessage.concat(transactionResponse.data.message + " ");
      }
      const walletResponse = await axios.get("/api/wallets");
      if (walletResponse.data.success) {
        this.setState({ wallets: walletResponse.data.items[0] });
      } else {
        errorMessage.concat(walletResponse);
      }
      if (errorMessage) {
        alert(errorMessage);
      }
    } catch (e) {
      alert(e.message);
    }
  }

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  }

  editToggle = (transaction) => {
    this.setState({
      modalTransaction: transaction,
      modal: !this.state.modal,
      modalType: transaction.type,
      modalAmount: transaction.amount,
      modalCategory: transaction.wallet_id ? transaction.wallet_id._id : null,
      modalDescription: transaction.description || null,
      modalDate: moment(transaction.date)
        .utc()
        .format("YYYY-MM-DD"),
      modalValue:
        transaction.type === "add"
          ? transaction.taxable !== undefined
            ? transaction.taxable
            : true
          : transaction.taxable !== undefined
            ? !transaction.taxable
            : false
    });
  }

  onChange = (event) => {
    if (event.target.name === "amount") {
      this.setState({ modalAmount: parseFloat(event.target.value.substring(0, 10)) });
    } else if (event.target.name === "category" && event.target.value !== "none") {
      this.setState({ modalCategory: event.target.value });
    } else if (event.target.name === "date") {
      this.setState({ modalDate: event.target.value });
    } else if (event.target.name === "description") {
      this.setState({ modalDescription: event.target.value.substring(0, 26) });
    }
  }

  refreshState = () => {
    this.setState({
      modalDescription: null,
      modalAmount: null,
      modalDate: null,
      modalCategory: null,
      modalValue: null,
      modal: !this.state.modal
    });
  };

  onEditTransaction = async () => {
    const body = {
      description: this.state.modalDescription,
      amount: this.state.modalAmount.toFixed(2),
      date: this.state.modalDate,
      wallet_id: this.state.modalCategory,
      transaction_id: this.state.modalTransaction._id,
      taxable: this.state.modalType === "add" ? this.state.modalValue : !this.state.modalValue
    };
    try {
      const res = await axios.put("/api/transactions", body);
      if (res.data.success) {
        this.refreshState();
        this.componentDidMount();
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.message);
    }
  }

  onDeleteTransaction = async () => {
    const transactionId = this.state.modalTransaction._id;
    try {
      const res = await axios.delete(`/api/transactions?id=${transactionId}`);
      if (res.data.success) {
        this.refreshState();
        this.componentDidMount();
      } else {
        alert(res.data.message);
      }
    } catch (e) {
      alert(e.message);
    }
  }

  renderTable = (type) => {
    return (
      <Card>
        <CardBody>
          <CardTitle>
            <Row>
              <div className="col-auto mr-auto">
                <h1>{type === "add" ? "Income:" : "Expenses:"}</h1>
              </div>
              <div className="col-auto">
                <strong>{numeral(this.getAmount(type)).format("$0,0.00")}</strong>
              </div>
            </Row>
          </CardTitle>
          <Table>
            <thead>
              <tr>
                <th>{window.innerWidth < 400 ? "$" : "Amount"}</th>
                <th>Date</th>
                {type === "remove" ? (
                  window.innerWidth < 400 ? (
                    <th>Cat.</th>
                  ) : (
                    <th>Category</th>
                  )
                ) : (
                  ""
                )}
                <th>{window.innerWidth < 400 ? "Desc." : "Description"}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.transactions
                .filter(transaction => {
                  return (
                    transaction.type === type &&
                    (!this.state.startDate ||
                      moment(transaction.date).dayOfYear()>=(moment(this.state.startDate).dayOfYear())) &&
                    (!this.state.endDate ||
                      moment(transaction.date).dayOfYear()<=(moment(this.state.endDate).dayOfYear()))
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
                .map(transaction => {
                  return (
                    <tr key={transaction._id} onClick={() => this.editToggle(transaction)}>
                      <th scope="row">
                        {window.innerWidth < 400
                          ? numeral(transaction.amount).format("$0,0")
                          : numeral(transaction.amount).format("$0,0.00")}
                      </th>
                      <td>
                        {window.innerWidth < 400
                          ? moment(transaction.date)
                              .utc()
                              .format("MM/DD/YY")
                          : moment(transaction.date)
                              .utc()
                              .format("MMMM DD, YYYY")}
                      </td>
                      {type === "remove" ? (
                        transaction.wallet_id ? (
                          <td>
                            {window.innerWidth < 350
                              ? transaction.wallet_id.category.length > 5
                                ? `${transaction.wallet_id.category.substring(0, 6)}.`
                                : `${transaction.wallet_id.category.substring(0, 6)}`
                              : transaction.wallet_id.category}
                          </td>
                        ) : (
                          <td>deleted</td>
                        )
                      ) : (
                        ""
                      )}
                      <td>
                        {transaction.description
                          ? window.innerWidth < 400
                            ? window.innerWidth < 350
                              ? transaction.description.length > 6
                                ? `${transaction.description.substring(0, 7)}.`
                                : `${transaction.description.substring(0, 7)}`
                              : transaction.description.substring(0, 10)
                            : transaction.description
                          : "None"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    );
  }

  renderModal = () => {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>Edit Transaction</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>Amount</Label>
              <Input
                type="number"
                name="amount"
                value={this.state.modalAmount}
                onChange={this.onChange}
              />
            </FormGroup>
            {this.state.modalType === "remove" ? (
              <FormGroup>
                <Label>Category</Label>
                <Input
                  type="select"
                  name="category"
                  value={this.state.modalCategory}
                  onChange={this.onChange}
                >
                  {this.state.wallets.map(wallet => {
                    return (
                      <option key={wallet._id} value={wallet._id}>
                        {wallet.category}
                      </option>
                    );
                  })}
                </Input>
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>Wallet</Label>
                <Input
                  type="select"
                  name="category"
                  value={this.state.modalCategory}
                  onChange={this.onChange}
                >
                  <option value="none">Select a category</option>
                  {this.state.wallets.map(wallet => {
                    return (
                      <option key={wallet._id} value={wallet._id}>
                        {wallet.category}
                      </option>
                    );
                  })}
                </Input>
              </FormGroup>
            )}
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                name="date"
                defaultValue={now}
                onChange={this.onChange}
              />
            </FormGroup>
            {this.state.modalType === "add" ? (
              <FormGroup>
                <Label>Taxable</Label>
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
            ) : (
              <FormGroup>
                <Label>Tax Deductable</Label>
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
            )}
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="text"
                name="description"
                value={this.state.modalDescription}
                onChange={this.onChange}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="link" onClick={this.onDeleteTransaction}>
            Delete Transaction
          </Button>{" "}
          <Button color="primary" onClick={this.onEditTransaction}>
            Edit Transaction
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  render() {
    return (
      <div className="container">
        <br />
        <Row>
          <div className="col-auto mr-auto">
            <h1 className="white-text">Transactions</h1>
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
        {this.renderTable("add")}
        <br />
        {this.renderTable("remove")}
        {this.renderModal()}
      </div>
    );
  }
}
