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
  Form
} from "reactstrap";
import axios from "axios";
import moment from "moment";
import numeral from "numeral";

export default class LoanPage extends React.Component {
  constructor() {
    super();
    this.state = {
      loans: [],
      modal: false,
      modalType: "",
      startDate: null,
      endDate: null
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
          (!this.state.endDate ||
            moment(loan.date).isSameOrBefore(moment(this.state.endDate)))
        ) {
          amount += loan.amount;
        }
      }
    });
    return amount;
  }

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
                  {numeral(this.getAmount("donated")).format("$0,0.00")}
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
                {
                  // <tr>
                  //   <th scope="row">1</th>
                  //   <td>Mark</td>
                  //   <td>Otto</td>
                  //   <td>@mdo</td>
                  // </tr>
                }
              </tbody>
            </Table>
          </CardBody>
        </Card>
        <Button color={"success"} block={true} onClick={() => this.onClick("donated")}>
          Add new loan
        </Button>
        <div>
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
                  <Input type="number" />
                </FormGroup>
                <FormGroup>
                  <Label>{this.state.modalType === "donated" ? "Recipient" : "Lender"}</Label>
                  <Input type="text" />
                </FormGroup>
                <FormGroup>
                  <Label>Date</Label>
                  <Input type="date" />
                </FormGroup>
                <FormGroup>
                  <Label>Description</Label>
                  <Input type="String" />
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggle}>
                Add Loan
              </Button>{" "}
              <Button color="secondary" onClick={this.toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </Container>
    );
  }
}
