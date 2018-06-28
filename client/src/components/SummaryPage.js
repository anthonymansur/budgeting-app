import React from "react";
import { Container, Row, Button } from "reactstrap";
import axios from 'axios';
import numeral from 'numeral';
import moment from 'moment';
import DoughnutChart from './DoughnutChart';

export default class SummaryPage extends React.Component {

  constructor() {
    super();
    this.state = {
      transactions: [],
      wallets: []
    }
  }

  async componentDidMount() {
    try {
      const res = await axios.get("/api/transactions");
      if (res.data.success) {
        this.setState({ transactions: res.data.items[0] });
      } else {
        throw new Error(res.data.message);
      }
      const wRes = await axios.get("/api/wallets");
      if (wRes.data.success) {
        console.log(wRes.data);
        this.setState({ wallets: wRes.data.items[0] });
      } else {
        throw new Error(wRes.data.message);
      }
    } catch(e) {
      alert(e.message);
    }
  }

  render() {
    return (
      <Container>
        <br />
        <DoughnutChart transactions={this.state.transactions} wallets={this.state.wallets}/>
        <br />
        <Row>
          <Button color="info" disabled style={{ marginRight: "10px" }}>
            Daily
          </Button>{" "}
          <Button color="info" disabled style={{ marginRight: "10px" }}>
            Weekly
          </Button>{" "}
          <Button color="info" disabled style={{ marginRight: "10px" }}>
            Monthly
          </Button>{" "}
          <Button color="info" style={{ marginRight: "10px" }}>
            Yearly
          </Button>{" "}
        </Row>
        <br />
        {
        // <Card>
        //   <CardBody>
        //     <CardTitle>
        //       <Row>
        //         <div className="col-auto mr-auto">
        //           <h1>Expenses:</h1>
        //         </div>
        //         <div className="col-auto">
        //           <strong>
        //             {numeral(this.getAmount(type)).format("$0,0.00")}
        //           </strong>
        //         </div>
        //       </Row>
        //     </CardTitle>
        //     <Table>
        //       <thead>
        //         <tr>
        //           <th>{ window.innerWidth < 400 ? "$" : "Amount"}</th>
        //           <th>Date</th>
        //           {window.innerWidth < 400 ? <th>Cat.</th> : <th>Category</th>}
        //           <th>{ window.innerWidth < 400 ? "Desc." : "Description"}</th>
        //         </tr>
        //       </thead>
        //       <tbody>
        //         {this.state.transactions
        //           .filter(transaction => {
        //             return (
        //               transaction.type === type &&
        //               (!this.state.startDate ||
        //                 moment(transaction.date).isSameOrAfter(
        //                   moment(this.state.startDate)
        //                 )) &&
        //               (!this.state.endDate ||
        //                 moment(transaction.date).isSameOrBefore(
        //                   moment(this.state.endDate)
        //                 ))
        //             );
        //           })
        //           .sort((a, b) => {
        //             if (moment(a.date).utc().years() > moment(b.date).utc().years()) {
        //               return -1;
        //             } else if (moment(a.date).utc().years() < moment(b.date).utc().years()) {
        //               return 1;
        //             } else if (moment(a.date).utc().dayOfYear() > moment(b.date).utc().dayOfYear()) {
        //               return -1;
        //             } else if (moment(a.date).utc().dayOfYear() < moment(b.date).utc().dayOfYear()) {
        //               return 1;
        //             } else if (a.amount > b.amount){
        //               return -1;
        //             } else if (a.amount < b.amount) {
        //               return 1;
        //             } else {
        //               return 0;
        //             }
        //           })
        //           .map(transaction => {
        //             return (
        //               <tr key={transaction._id} onClick={() => this.editToggle(transaction)}>
        //                 <th scope="row">
        //                 {window.innerWidth < 400 ? 
        //                   numeral(transaction.amount).format('$0,0') : 
        //                   numeral(transaction.amount).format('$0,0.00')}
        //                 </th>
        //                 <td>
        //                   {window.innerWidth < 400 ? 
        //                     moment(transaction.date).utc().format("MMM DD, YYYY") : 
        //                     moment(transaction.date).utc().format("MMMM DD, YYYY")}
        //                 </td>
        //                 {type === "remove" ? (
        //                   transaction.wallet_id ? (
        //                     <td>
        //                     {window.innerWidth < 350 ? 
        //                       transaction.wallet_id.category.length > 5 ? `${transaction.wallet_id.category.substring(0,6)}.` : 
        //                       `${transaction.wallet_id.category.substring(0,6)}`:
        //                       transaction.wallet_id.category
        //                     }
        //                     </td>
        //                   ) : (
        //                     <td>deleted</td>
        //                   )
        //                 ) : (
        //                   ''
        //                 )}
        //                 <td>{ window.innerWidth < 400 ? 
        //                     window.innerWidth < 350 ? 
        //                   transaction.description ? 
        //                   transaction.description.length > 6 ? (`${transaction.description.substring(0,7)}.`) : 
        //                   (`${transaction.description.substring(0,7)}`) : "None" :
        //                   ((`${transaction.description.substring(0,10)}`) || "None") 
        //                   : (transaction.description || "None")}</td>
        //               </tr>
        //             );
        //           })}
        //       </tbody>
        //     </Table>
        //   </CardBody>
        // </Card>
      }
      </Container>
    );
  }
}

