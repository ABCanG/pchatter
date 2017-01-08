import React, { PropTypes } from 'react';

import Notification from '../containers/Notification';

const Layout = (props) => {
  return (
    <section>
      {props.header}
      <div className="container">
        <Notification />
        {props.children}
      </div>
    </section>
  );
};
Layout.propTypes = {
  header: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

export default Layout;
