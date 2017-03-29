import React, { PropTypes } from 'react';
import { Button, Form, FormGroup, FormControl, HelpBlock } from 'react-bootstrap';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { requestJoinChat, setRoomPass } from '../actions/chatActionCreators';

class JoinChatForm extends React.Component {
  static propTypes = {
    info: PropTypes.instanceOf(Immutable.Map).isRequired,
    pass: PropTypes.string.isRequired,
    joinFailureMessage: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  handleChangeRoomPass = (e) => {
    const { dispatch } = this.props;
    dispatch(setRoomPass(e.target.value));
  };

  handleJoinChat = (e) => {
    const { dispatch, pass } = this.props;
    e.preventDefault();
    dispatch(requestJoinChat(pass));
  };

  render() {
    const { info, pass, joinFailureMessage } = this.props;
    return (
      <Form inline onSubmit={this.handleJoinChat} className="chatroom-join-form">
        <FormGroup validationState={joinFailureMessage ? 'error' : null}>
          {info.get('pass') &&
            <FormControl
              type="text"
              value={pass}
              placeholder="合言葉"
              onChange={this.handleChangeRoomPass}
              />
          }
          <Button type="submit" bsStyle="primary">参加</Button>
          {joinFailureMessage && <HelpBlock>{joinFailureMessage}</HelpBlock>}
        </FormGroup>
      </Form>
    );
  }
}

function select(state) {
  const $$chatStore = state.$$chatStore;

  return {
    info: $$chatStore.get('info'),
    pass: $$chatStore.get('pass'),
    joinFailureMessage: $$chatStore.get('joinFailureMessage'),
  };
}

export default connect(select)(JoinChatForm);
