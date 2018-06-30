import React from "react";
import { Row, Card, CardBody, CardTitle, Table } from "reactstrap";
import numeral from "numeral";
import moment from "moment";

export default class Expenses extends React.Component {
  state = {
    transactions: [],
    startDate: null,
    endDate: null,
    total: 0
  };

  componentWillReceiveProps(props) {
    let total = 0;

    props.transactions.forEach(trans => {
      total += trans.amount;
    });

    this.setState({
      transactions: props.transactions,
      startDate: props.startDate || null,
      endDate: props.endDate || null,
      total
    });
  }

  render() {
    return (
      <Card>
        <CardBody>
          <CardTitle>
            <Row>
              <div className="col-auto mr-auto">
                <h1>Expenses:</h1>
              </div>
              <div className="col-auto">
                <strong>{numeral(this.state.total).format("$0,0.00")}</strong>
              </div>
            </Row>
          </CardTitle>
          <Table>
            <thead>
              <tr>
                <th>{window.innerWidth < 400 ? "$" : "Amount"}</th>
                <th>Date</th>
                {window.innerWidth < 400 ? <th>Cat.</th> : <th>Category</th>}
                <th>{window.innerWidth < 400 ? "Desc." : "Description"}</th>
              </tr>
            </thead>
            <tbody>
              {this.state.transactions
                .filter(transaction => {
                  return (
                    (!this.state.startDate ||
                      moment(transaction.date).isSameOrAfter(
                        moment(this.state.startDate)
                      )) &&
                    (!this.state.endDate ||
                      moment(transaction.date).isSameOrBefore(
                        moment(this.state.endDate)
                      ))
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
                    <tr key={transaction._id}>
                      <th scope="row">
                        {window.innerWidth < 400
                          ? numeral(transaction.amount).format("$0,0")
                          : numeral(transaction.amount).format("$0,0.00")}
                      </th>
                      <td>
                        {window.innerWidth < 400
                          ? moment(transaction.date)
                              .utc()
                              .format("MMM DD, YYYY")
                          : moment(transaction.date)
                              .utc()
                              .format("MMMM DD, YYYY")}
                      </td>
                      {transaction.wallet_id ? (
                        <td>
                          {window.innerWidth < 350
                            ? transaction.wallet_id.category.length > 5
                              ? `${transaction.wallet_id.category.substring(
                                  0,
                                  6
                                )}.`
                              : `${transaction.wallet_id.category.substring(
                                  0,
                                  6
                                )}`
                            : transaction.wallet_id.category}
                        </td>
                      ) : (
                        <td>deleted</td>
                      )}
                      <td>
                        {window.innerWidth < 400
                          ? window.innerWidth < 350
                            ? transaction.description
                              ? transaction.description.length > 6
                                ? `${transaction.description.substring(0, 7)}.`
                                : `${transaction.description.substring(0, 7)}`
                              : transaction.description ||"none"
                            : `${transaction.description.substring(0, 10)}`
                          : transaction.description || "None"}
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
}
