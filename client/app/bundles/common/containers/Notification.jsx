import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { Alert, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';

import {dismissNotification} from '../actions/notificationActionCreators';

const Notification = (props) => {
  const {dispatch, $$notificationStore} = props;
  return (
    <div>
      {$$notificationStore.map((notification, i) => {
        const style = notification.style || 'success';
        return (
          <Alert bsStyle={style} key={i} onDismiss={() => dispatch(dismissNotification(i))}>
            <span className="h4">{notification.message}</span>
            {notification.url &&
              <LinkContainer to={notification.url}>
                <Button bsStyle={style} bsSize="small">開く</Button>
              </LinkContainer>}
          </Alert>
        );
      })}
    </div>
  );
};

Notification.propTypes = {
  $$notificationStore: PropTypes.instanceOf(Immutable.List).isRequired,
  dispatch: PropTypes.func.isRequired,
};

function select(state) {
  return {
    $$notificationStore: state.$$notificationStore,
  };
}

export default connect(select)(Notification);
