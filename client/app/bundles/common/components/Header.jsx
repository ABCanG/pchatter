import React, { PropTypes } from 'react';
import { Nav, Navbar } from 'react-bootstrap';

const Header = (props) => {
  const {brand, children} = props;
  return (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <span>{brand}</span>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          {children}
        </Nav>
      </Navbar>
    </div>
  );
};

Header.propTypes = {
  brand: PropTypes.node.isRequired,
  children: PropTypes.node,
};

export default Header;
