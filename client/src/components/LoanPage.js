import React from "react";
import { Table, Button } from "reactstrap";

export default class LoanPage extends React.Component {
  render() {
    return (
      <div>
        <h1>Owed To You</h1>
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
        <Button block={true}>Add new loan</Button>
      </div>
    );
  }
}
