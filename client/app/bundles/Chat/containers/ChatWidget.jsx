import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { SketchPicker } from 'react-color';

import { requestConnectChat, setRoomInfo, setCurrentUserId } from '../actions/chatActionCreators';
import { setStyleColor } from '../actions/canvasActionCreators';
import DrawCanvas from './DrawCanvas';
import PreviewCanvas from './PreviewCanvas';
import WidthSlider from './WidthSlider';
import ToolButtons from './ToolButtons';
import UserList from '../components/UserList';
import ChatLogs from '../components/ChatLogs';
import SubmitLogForm from './SubmitLogForm';
import JoinChatForm from './JoinChatForm';

class ChatWidget extends React.Component {
  static propTypes = {
    roomInfo: PropTypes.shape({
      id: PropTypes.number.isRequired,
      pass: PropTypes.bool.isRequired,
      hidden: PropTypes.bool.isRequired,
    }).isRequired,
    currentUserId: PropTypes.number,
    color: PropTypes.shape({
      r: PropTypes.number.isRequired,
      g: PropTypes.number.isRequired,
      b: PropTypes.number.isRequired,
      a: PropTypes.number.isRequired,
    }).isRequired,
    users: PropTypes.instanceOf(Immutable.Map).isRequired,
    logs: PropTypes.instanceOf(Immutable.Set).isRequired,
    join: PropTypes.bool.isRequired,
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

  handleChangeColor = (color) => {
    const { dispatch } = this.props;
    dispatch(setStyleColor(color.rgb));
  }

  refPreviewCanvas = (element) => {
    this.previewCanvas = element;
  }

  // TODO: hideオプション時の処理
  // TODO: 参加前にはいろいろなボタンを隠す
  render() {
    const { color, users, logs, join } = this.props;

    return (
      <div className="chatroom">
        <DrawCanvas previewCanvas={this.previewCanvas} />
        <div className="tool-box">
          <PreviewCanvas refPreviewCanvas={this.refPreviewCanvas} />
          <ToolButtons />
          <SketchPicker width="200px" color={color} onChange={this.handleChangeColor} />
          <WidthSlider />
          <UserList users={users} />
          <ChatLogs logs={logs} />
          {join ? <SubmitLogForm /> : <JoinChatForm />}
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
    users: $$chatStore.get('users'),
    logs: $$chatStore.get('logs'),
    join: $$chatStore.get('join'),
    color: $$canvasStore.getIn(['style', 'color']).toJS(),
  };
}

export default connect(select)(ChatWidget);
