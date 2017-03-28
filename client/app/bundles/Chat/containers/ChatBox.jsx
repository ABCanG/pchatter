import React, { PropTypes } from 'react';
import { Button, Form, Popover, OverlayTrigger } from 'react-bootstrap';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { requestJoinChat, setLogMessage, sendLogMessage, setRoomPass } from '../actions/chatActionCreators';

class ChatBox extends React.Component {
  static propTypes = {
    info: PropTypes.instanceOf(Immutable.Map).isRequired,
    join: PropTypes.bool.isRequired,
    logs: PropTypes.instanceOf(Immutable.Set).isRequired,
    users: PropTypes.instanceOf(Immutable.Map).isRequired,
    logMessage: PropTypes.string.isRequired,
    pass: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  handleChangeLogMessage = (e) => {
    const { dispatch } = this.props;
    dispatch(setLogMessage(e.target.value));
  };

  handleChangeRoomPass = (e) => {
    const { dispatch } = this.props;
    dispatch(setRoomPass(e.target.value));
  };

  handleSendLogMessage = (e) => {
    const { dispatch, logMessage } = this.props;
    e.preventDefault();
    dispatch(sendLogMessage(logMessage));
  };

  handleJoinChat = (e) => {
    const { dispatch, pass } = this.props;
    e.preventDefault();
    dispatch(requestJoinChat(pass));
  };


  renderPopoverUserList() {
    const { users } = this.props;

    return (
      <Popover id="user-list-popup" title="ユーザ一覧">
        {(() => {
          if (users.size === 0) {
            return (<span>なし</span>);
          }

          return (
            <ul>
              {users.valueSeq().map((user) =>
                <li key={user.get('id')}>
                  <img src={user.get('icon_url')} alt={user.get('name')} />
                  {user.get('name')}
                </li>
              )}
            </ul>
          );
        })()}
      </Popover>
    );
  }

  renderSubmitForm() {
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

  renderJoinForm() {
    const { info, pass } = this.props;
    return (
      <Form inline onSubmit={this.handleJoinChat}>
        {info.get('pass') &&
          <input
            type="text"
            value={pass}
            placeholder="合言葉"
            onChange={this.handleChangeRoomPass}
            />
        }
        <Button type="submit">参加</Button>
      </Form>
    );
  }

  // TODO: hoge人のところ
  // TODO: hideオプション時の処理
  // TODO: 参加前にはいろいろなボタンを隠す
  render() {
    const { logs, users, join } = this.props;

    return (
      <div className="chat-box">
        <div className="user-list">
          <OverlayTrigger placement="left" overlay={this.renderPopoverUserList()}>
            <span>ユーザ({users.size}人) | 閲覧(hoge人)</span>
          </OverlayTrigger>
        </div>
        <div className="chat-logs">
          <ul>
            {logs.map((log) =>
              <li key={log.get('id')}>
                <b>{log.get('userName')}</b>
                <span>: {log.get('message')}</span>
              </li>
            )}
          </ul>
        </div>
        {join ? this.renderSubmitForm() : this.renderJoinForm()}
      </div>
    );
  }
}

function select(state) {
  const $$chatStore = state.$$chatStore;

  return {
    info: $$chatStore.get('logs'),
    logs: $$chatStore.get('logs'),
    users: $$chatStore.get('users'),
    logMessage: $$chatStore.get('logMessage'),
    join: $$chatStore.get('join'),
    pass: $$chatStore.get('pass'),
  };
}

export default connect(select)(ChatBox);
