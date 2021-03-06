import React from 'react';
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';

import './styles.css';

export default class Header extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      auth: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  componentDidMount() {
    this.setState({ auth: this.props.auth });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ auth: nextProps.auth });
  }

  render() {
    return (
      <div>
        <Navbar className="header" dark expand="md">
          <Container>
          <NavbarBrand href="/" className="header__brand">Budgeting App</NavbarBrand>
          <NavbarToggler onClick={this.toggle} className="header__toggler"/>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar style={{color: 'white'}}>
              <NavItem>
                <NavLink href="/transactions" className="header__text">Transactions</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/goals" className="header__text">Goals</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/loans" className="header__text">Loans</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/summary" className="header__text">Summary</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
          </Container>
        </Navbar>
      </div>
    );
  }
}