import PropTypes from 'prop-types';
import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { connect } from 'react-redux';

import { setLogMessage, sendLogMessage } from '../actions/chatActionCreators';

class SubmitLogForm extends React.Component {
  static propTypes = {
    logMessage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  handleChangeLogMessage = (e) => {
    const { dispatch } = this.props;
    dispatch(setLogMessage(e.target.value));
  };

  handleSendLogMessage = (e) => {
    const { dispatch, logMessage } = this.props;
    e.preventDefault();
    dispatch(sendLogMessage(logMessage));
  };

  render() {
    const { logMessage } = this.props;
    return (
      <Form inline onSubmit={this.handleSendLogMessage}>
        <input
          type="text"
          value={logMessage}
          placeholder="Enter text"
          onChange={this.handleChangeLogMessage}
          />
        <Button type="submit">送信</Button>
      </Form>
    );
  }
}

function select(state) {
  const $$chatStore = state.$$chatStore;

  return {
    logMessage: $$chatStore.get('logMessage'),
  };
}

export default connect(select)(SubmitLogForm);
