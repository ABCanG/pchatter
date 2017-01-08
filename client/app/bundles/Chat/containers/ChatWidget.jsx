import React, { PropTypes } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { requestConnectChat, requestJoinChat, setLogMessage,
  sendLogMessage, setRoomInfo, setRoomPass } from '../actions/chatActionCreators';

class ChatWidget extends React.Component {
  static propTypes = {
    roomInfo: PropTypes.shape({
      id: PropTypes.number.isRequired,
      pass: PropTypes.bool.isRequired,
      hidden: PropTypes.bool.isRequired,
    }),
    join: PropTypes.bool.isRequired,
    logs: PropTypes.instanceOf(Immutable.Set).isRequired,
    users: PropTypes.instanceOf(Immutable.Map).isRequired,
    logMessage: PropTypes.string.isRequired,
    pass: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { dispatch, roomInfo } = this.props;
    dispatch(setRoomInfo(roomInfo));
    dispatch(requestConnectChat(roomInfo.id));
  }

  handleChangeLogMessage = (e) => {
    const { dispatch } = this.props;
    dispatch(setLogMessage(e.target.value));
  };

  handleChangeRoomPass = (e) => {
    const { dispatch } = this.props;
    dispatch(setRoomPass(e.target.value));
  };

  handleSendLogMessage = () => {
    const { dispatch, logMessage } = this.props;
    dispatch(sendLogMessage(logMessage));
  };

  handleJoinChat = () => {
    const { dispatch, pass } = this.props;
    dispatch(requestJoinChat(pass));
  };

  render() {
    const { logs, users, logMessage, join, roomInfo, pass } = this.props;

    return (
      <div>
        <ul>
          {logs.map((log) => <li key={log.get('id')}>{log.get('message')}</li>)}
        </ul>
        ユーザリスト
        <ul>
          {users.valueSeq().map((user) => <li key={user.get('id')}>@{user.get('screen_name')}</li>)}
        </ul>
        {(() => {
          if (!join) {
            return (
              <div>
                {roomInfo.pass &&
                  <FormControl
                    type="text"
                    value={pass}
                    placeholder="合言葉"
                    onChange={this.handleChangeRoomPass}
                    />
                }
                <Button onClick={this.handleJoinChat}>参加</Button>
              </div>
            );
          }

          return (
            <div>
              <FormControl
                type="text"
                value={logMessage}
                placeholder="Enter text"
                onChange={this.handleChangeLogMessage}
                />
              <Button onClick={this.handleSendLogMessage}>送信</Button>
            </div>
          );
        })()}
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$chatStore = state.$$chatStore;
  const { id, pass, hidden } = ownProps;
  const roomInfo = { id, pass, hidden };

  return {
    roomInfo,
    logs: $$chatStore.get('logs'),
    users: $$chatStore.get('users'),
    logMessage: $$chatStore.get('logMessage'),
    join: $$chatStore.get('join'),
    pass: $$chatStore.get('pass'),
  };
}

export default connect(select)(ChatWidget);
