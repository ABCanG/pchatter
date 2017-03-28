import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { SketchPicker } from 'react-color';

import { requestConnectChat, setRoomInfo, setCurrentUserId } from '../actions/chatActionCreators';
import { setStyleColor } from '../actions/canvasActionCreators';
import DrawCanvas from './DrawCanvas';
import WidthSlider from './WidthSlider';
import ToolButtons from './ToolButtons';
import ChatBox from './ChatBox';

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

  render() {
    const { color } = this.props;

    return (
      <div className="chatroom">
        <DrawCanvas previewCanvas={this.previewCanvas} />
        <div className="tool-box">
          <canvas id="previewCanvas" width={200} height={200} ref={this.refPreviewCanvas} />
          <ToolButtons />
          <SketchPicker width="200px" color={color} onChange={this.handleChangeColor} />
          <WidthSlider />
          <ChatBox />
        </div>
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$canvasStore = state.$$canvasStore;
  const { currentUserId, id, pass, hidden } = ownProps;

  return {
    currentUserId,
    roomInfo: { id, pass, hidden },
    color: $$canvasStore.getIn(['style', 'color']).toJS(),
  };
}

export default connect(select)(ChatWidget);
