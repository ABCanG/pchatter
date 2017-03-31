import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { SketchPicker } from 'react-color';

import { requestConnectChat, requestDisconnectChat, setRoomInfo, setCurrentUserId } from '../actions/chatActionCreators';
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
      name: PropTypes.string.isRequired,
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

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(requestDisconnectChat());
  }

  handleChangeColor = (color) => {
    const { dispatch } = this.props;
    dispatch(setStyleColor(color.rgb));
  }

  refPreviewCanvas = (element) => {
    this.previewCanvas = element;
  }

  render() {
    const { color, users, logs, join, roomInfo } = this.props;

    return (
      <div className="chat-widget">
        {!join && <div className="container">
          <JoinChatForm />
        </div>}
        {(join || !roomInfo.hidden) && <div className="chatroom">
          <DrawCanvas previewCanvas={this.previewCanvas} />
          <div className="tool-box">
            <PreviewCanvas refPreviewCanvas={this.refPreviewCanvas} />
            <ToolButtons />
            {join && <div>
              <SketchPicker width="200px" color={color} onChange={this.handleChangeColor} />
              <WidthSlider />
            </div>}
            <UserList users={users} />
            <ChatLogs logs={logs} />
            {join && <SubmitLogForm />}
          </div>
        </div>}
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;
  const { currentUserId, id, name, pass, hidden } = ownProps;

  return {
    currentUserId,
    roomInfo: { id, name, pass, hidden },
    users: $$chatStore.get('users'),
    logs: $$chatStore.get('logs'),
    join: $$chatStore.get('join'),
    color: $$canvasStore.getIn(['style', 'color']).toJS(),
  };
}

export default connect(select)(ChatWidget);
