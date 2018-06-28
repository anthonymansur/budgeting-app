import React from "react";
import "chart.js/dist/Chart.js";
import "chart.js/dist/Chart.min.js";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";

export default class DoughnutChart extends React.Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
      wallets: [],
      expenseTotal: 0,
      expenseData: [],
      dataList: [],
      colorList: []
    };
  }

  randomColorGenerator = () => {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  };

  componentWillReceiveProps(props) {
    console.log(props);
    this.setState({ transactions: props.transactions, wallets: props.wallets });
    let expenseTotal = 0;
    const expenseData = [];
    const dataList = [];
    const colorList = [];

    props.transactions.forEach(transaction => {
      if (transaction.type === "remove") {
        expenseTotal += transaction.amount;
      }
    });

    console.log(props.transactions);
    console.log(props.wallets);

    props.wallets.forEach(wallet => {
      const filteredTrans = props.transactions.filter(transaction => {
        return (
          transaction.wallet_id && transaction.wallet_id._id === wallet._id
        );
      });

      let walletExpense = 0;

      filteredTrans.forEach(transaction => {
        if (transaction.type === "remove") {
          walletExpense += transaction.amount;
        }
      });

      expenseData.push(((walletExpense / expenseTotal) * 100).toFixed(2));
      dataList.push(wallet.category);
      const color = wallet.color || this.randomColorGenerator();
      colorList.push(color);
    });

    this.setState({
      transactions: props.transactions,
      wallets: props.wallets,
      expenseTotal,
      expenseData,
      dataList,
      colorList
    });
  }

  render() {
    const data = canvas => {
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 100, 0);
      return {
        datasets: [
          {
            data: this.state.expenseData,
            backgroundColor: this.state.colorList
          }
        ],
        labels: this.state.dataList
      };
    };
    return (
        <Doughnut
          data={data}
          options={{
            legend: {
              position: "right"
            }
          }}
        />
    );
  }
}
