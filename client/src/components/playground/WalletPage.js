import React from 'react';
import { 
  Container,
  Form, 
  FormGroup, 
  FormFeedback,
  Label, 
  Input, 
  Card, 
  CardBody, 
  CardTitle, 
  CardText, 
  Button, 
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col
} from 'reactstrap';

import numeral from 'numeral';

import axios from 'axios';

export default class WalletPage extends React.Component {

  constructor() {
    super();
    this.state={
      wallets: [],
      transactions: [],
      remainingPercentage: 100,
      modal: false,
      modalWallet: {},
      modalName: '',
      modalPercentage: 0,
      modalStatus: ''
    }
    this.toggle = this.toggle.bind(this);
    this.addToggle = this.addToggle.bind(this);
    this.editToggle = this.editToggle.bind(this);
    this.errorCheck = this.errorCheck.bind(this);
    this.onChange = this.onChange.bind(this);
    this.addToWallet = this.addToWallet.bind(this);
    this.editWallet = this.editWallet.bind(this);
    this.confirmDelete = this.confirmDelete.bind(this);
    this.getWalletBalance = this.getWalletBalance.bind(this);
  }

  async componentDidMount(){
    try {
      const errorMessage = '';
      const walletResponse = await axios.get("/api/wallets");
      if (walletResponse.data.success) {
        let remainingPercentage = 100;
        const wallets = walletResponse.data.items[0].map(wallet => {
          remainingPercentage -= wallet.percentage;
          return {
            category: wallet.category,
            percentage: wallet.percentage,
            money: 0,
            id: wallet._id
          }
        });
        this.setState({ wallets, remainingPercentage });
      } else {
        errorMessage.concat(walletResponse.data.message + " ");
      }
      const transactionResponse = await axios.get("/api/transactions");
      if (transactionResponse.data.success) {
        const transactions = transactionResponse.data.items[0];
        let income = 0;
        let expenses = 0;
        transactions.forEach(transaction => {
          if (transaction.type === "add") {
            income += transaction.amount;
          } else if (transaction.type === "remove"){
            expenses += transaction.amount;
          }
        });
        this.setState({ transactions, income, expenses });
      } else {
        errorMessage.concat(transactionResponse.data.message);
      }
      if (errorMessage) {
        alert(errorMessage);
      } 
    } catch (e) {
      alert(e.message);
    }
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  addToggle() {
    this.setState({
      modal: !this.state.modal,
      modalName: '',
      modalStatus: 'add',
      modalPercentage: this.state.remainingPercentage
    });
  }

  editToggle(wallet) {
    this.setState({
      modal: !this.state.modal,
      modalWallet: wallet,
      modalName: wallet.category,
      modalNameError: false,
      modalPercentage: wallet.percentage,
      modalPercentageError: false,
      modalStatus: 'edit'
    });
  }

  errorCheck() {
    let valid = true;
    if (this.state.modalName === '') {
      valid = false;
      this.setState({ modalNameError: true });
    } else {
      this.setState({ modalNameError: false });
    }
    if (this.state.modalPercentage === 0){
      valid = false;
      this.setState({ modalPercentageError: true });
    } else {
      this.setState({ modalPercentageError: false });
    }
    return valid;
  }

  getWalletBalance(wallet) {
    let moneySpent = 0;
    this.state.transactions.forEach(transaction => {
      if (transaction.wallet_id && transaction.wallet_id._id === wallet._id) {
        moneySpent += transaction.amount;
      }
    });
    return ((this.state.income * (wallet.percentage/100)) - moneySpent).toFixed(2);
  }

  async addToWallet() {

    if (this.errorCheck()) {
      const body = {
        category: this.state.modalName,
        percentage: this.state.modalPercentage
      };
      try {
        const res = await axios.post("/api/wallets", body);
        if (!res.data.success) {
          alert(res.data.message);
        } else {
          await this.componentDidMount();
        }
      } catch(e) {
        alert(e.message);
      }
      this.toggle();
    }
  }

  async editWallet() {
    if (this.errorCheck()) {
      const body = {
        wallet_id: this.state.modalWallet.id,
        update: {
          category: this.state.modalName,
          percentage: this.state.modalPercentage
        }
      };
      try {
        const res = await axios.put("/api/wallets", body);
        if (!res.data.success) {
          alert(res.data.message);
        } else {
          await this.componentDidMount();
        }
      } catch(e) {
        alert(e.message);
      } 
      this.toggle();
    }
  }

  onChange(e) {
    if (e.target.name === "wallet-name") {
      this.setState({ modalName: e.target.value.substring(0,26) });
    }
    else if (e.target.name === "slider") {
      this.setState({ modalPercentage: parseInt(e.target.value) });
    }
  }

  async confirmDelete(wallet){
    try {
      const name = prompt("Please enter the name of the wallet you want to delete");
      if (name.toLowerCase() === wallet.category.toLowerCase()) {
        const res = await axios.delete(`/api/wallets?id=${wallet.id}`);
        if (res.data.success) {
          this.componentDidMount();
        } else {
          alert(res.data.message);
        }
        this.toggle();
      } else {
        alert("You entered an incorrect name");
        this.toggle();
      }
    } catch(e) {
      alert(e.message);
    }
  }

  render() {
    return (
      <Container>
        <Row>
          <Col md="3" />
          <Col md="6" >
            <br />
              {
                this.state.wallets ?
                this.state.wallets.map(wallet => {
                  return (
                      <div key={wallet.id}>
                        <Card onClick={() => this.editToggle(wallet)}>
                          <CardBody>
                            <CardTitle className="card__title">
                            { wallet.category }
                            {
                            //   <div className="row">
                            //   <div className="col-auto mr-auto">{ wallet.category }</div>
                            //   <div className="col-auto"><Button className="button--link" color="link" onClick={() => this.editToggle(wallet)}>Edit</Button></div>
                            // </div>
                          }
                            </CardTitle>
                            <CardText>
                              Percentage: {wallet.percentage}<br />
                              Remaining Balance: {numeral(this.getWalletBalance(wallet)).format('$0,0.00')}
                            </CardText>
                          </CardBody>
                        </Card>
                        <br />
                      </div>
                  );
                }) 
                :
                <div>
                  <h1 className="text-center">Start adding your personalized wallets</h1>
                  <p className="text-mute text-center">Specify the name of the wallet and the percentage of your total income</p>
                  <Row><div className="col justify-content-center"><Button>Add Now</Button></div></Row>
                </div>
              }
              <Button color="success" block={true} onClick={this.addToggle}>Add Wallet</Button>
              <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
                <ModalHeader toggle={this.toggle}>
                  {this.state.modalStatus === "add" ? "Add a new wallet" : "Edit existing wallet"}
                </ModalHeader>
                <ModalBody>
                  <Form>
                  <FormGroup>
                    <Label>Name</Label>
                    <Input invalid={this.state.modalNameError} type="text" name="wallet-name" value={this.state.modalName} onChange={this.onChange}/>
                    <FormFeedback>Please provide a name</FormFeedback>
                  </FormGroup>
                    <FormGroup>
                      <Label>Percentage: {this.state.modalPercentage}</Label>
                      <Input invalid={this.state.modalPercentageError}type="range" min="0" 
                      max={this.state.modalStatus === "add" ? this.state.remainingPercentage : 
                          this.state.modalWallet.percentage + this.state.remainingPercentage }
                      value={this.state.modalPercentage} name="slider" onChange={this.onChange}/>
                      <FormFeedback>Cannot add a wallet with percent zero</FormFeedback>
                    </FormGroup>
                  </Form>
                </ModalBody>
                <ModalFooter>
                    {
                      this.state.modalStatus === "add" ? 
                      <div>
                        <Button color="secondary" onClick={this.toggle}>Cancel</Button>{' '}
                        <Button color="primary" onClick={this.addToWallet}>Add Wallet</Button>
                      </div> : 
                      <div>
                        <Button color="link" onClick={() => this.confirmDelete(this.state.modalWallet)}>Delete Wallet</Button>{' '}
                        <Button color="primary" onClick={this.editWallet}>Edit Wallet </Button>
                      </div>
                    }
                </ModalFooter>
              </Modal>
              {
              // <Button color="danger" style={{
              //   position: "fixed",
              //   bottom: "25px",
              //   right: "25px",
              //   borderRadius: "50%",
              //   width: "50px",
              //   height: "50px",
              //   fontSize:"24px"
              // }} onClick={this.addToggle}><strong>+</strong></Button>{' '}
            }
          </Col>
          <Col md="3"/>
        </Row>
      </Container>
    );
  }
}