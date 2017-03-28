import React, { PropTypes } from 'react';
import { Button, Form, Popover, OverlayTrigger } from 'react-bootstrap';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { SketchPicker } from 'react-color';

import {
  requestConnectChat, requestJoinChat, setLogMessage,
  sendLogMessage, setRoomInfo, setRoomPass, setCurrentUserId
} from '../actions/chatActionCreators';
import { setStyleColor } from '../actions/canvasActionCreators';
import DrawCanvas from './DrawCanvas';
import WidthSlider from './WidthSlider';
import ToolButtons from './ToolButtons';

class ChatWidget extends React.Component {
  static propTypes = {
    roomInfo: PropTypes.shape({
      id: PropTypes.number.isRequired,
      pass: PropTypes.bool.isRequired,
      hidden: PropTypes.bool.isRequired,
    }).isRequired,
    currentUserId: PropTypes.number,
    join: PropTypes.bool.isRequired,
    logs: PropTypes.instanceOf(Immutable.Set).isRequired,
    users: PropTypes.instanceOf(Immutable.Map).isRequired,
    logMessage: PropTypes.string.isRequired,
    pass: PropTypes.string.isRequired,
    color: PropTypes.shape({
      r: PropTypes.number.isRequired,
      g: PropTypes.number.isRequired,
      b: PropTypes.number.isRequired,
      a: PropTypes.number.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    currentUserId: null
  };

  componentDidMount() {
    const { dispatch, roomInfo, currentUserId } = this.props;
    dispatch(setRoomInfo(roomInfo));
    dispatch(requestConnectChat(roomInfo.id));
    dispatch(setCurrentUserId(currentUserId));
  }

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

  handleChangeColor = (color) => {
    const { dispatch } = this.props;
    dispatch(setStyleColor(color.rgb));
  }

  refPreviewCanvas = (element) => {
    this.previewCanvas = element;
  }

  renderPopoverUserList() {
    const { users } = this.props;

    return (
      <Popover id="user-list-popup" title="ユーザ一覧">
        {(() => {
          if (users.size === 0) {
            return <span>なし</span>;
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

  render() {
    const { logs, users, logMessage, join, roomInfo, pass, color } = this.props;

    return (
      <div className="chatroom">
        <DrawCanvas previewCanvas={this.previewCanvas} />
        <div className="tool-box">
          <canvas id="previewCanvas" width={200} height={200} ref={this.refPreviewCanvas} />
          <ToolButtons />
          <SketchPicker width="200px" color={color} onChange={this.handleChangeColor} />
          <WidthSlider />
          <div className="user-list">
            <OverlayTrigger placement="left" overlay={this.renderPopoverUserList()}>
              <span>ユーザ({users.size}人) | 閲覧(hoge人)</span>
            </OverlayTrigger>
          </div>
          <div className="chat-logs">
            <ul>
              {logs.map((log) =>
                <li key={log.get('id')}>
                  <b>{log.get('userName')}</b>: {log.get('message')}
                </li>
              )}
            </ul>
          </div>
          {(() => {
            if (!join) {
              return (
                <div>
                  <Form inline onSubmit={this.handleJoinChat}>
                    {roomInfo.pass &&
                      <input
                        type="text"
                        value={pass}
                        placeholder="合言葉"
                        onChange={this.handleChangeRoomPass}
                        />
                    }
                    <Button type="submit">参加</Button>
                  </Form>
                </div>
              );
            }

            return (
              <div>
                <Form inline onSubmit={this.handleSendLogMessage}>
                  <input
                    type="text"
                    value={logMessage}
                    placeholder="Enter text"
                    onChange={this.handleChangeLogMessage}
                    />
                  <Button type="submit">送信</Button>
                </Form>
              </div>
            );
          })()}
        </div>
      </div>

    );
  }
}

function select(state, ownProps) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;
  const { currentUserId, id, pass, hidden } = ownProps;

  return {
    currentUserId,
    roomInfo: { id, pass, hidden },
    logs: $$chatStore.get('logs'),
    users: $$chatStore.get('users'),
    logMessage: $$chatStore.get('logMessage'),
    join: $$chatStore.get('join'),
    pass: $$chatStore.get('pass'),
    color: $$canvasStore.getIn(['style', 'color']).toJS(),
  };
}

export default connect(select)(ChatWidget);
