import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';


import { setStyleType, setCanvasInfo } from '../actions/canvasActionCreators';

class ChatWidget extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    scale: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  handleClickPencil = () => {
    const { dispatch } = this.props;
    dispatch(setStyleType('pencil'));
  }

  handleClickEraser = () => {
    const { dispatch } = this.props;
    dispatch(setStyleType('eraser'));
  }

  handleClickColorPicker = () => {
    const { dispatch } = this.props;
    dispatch(setStyleType('color-picker'));
  }

  handleClickZoomIn = () => {
    const { dispatch, scale } = this.props;
    dispatch(setCanvasInfo({ scale: scale + 0.05 }));
  }

  handleClickZoomOut = () => {
    const { dispatch, scale } = this.props;
    dispatch(setCanvasInfo({ scale: scale - 0.05 }));
  }

  render() {
    const { type } = this.props;

    return (
      <div className="tool-buttons">
        <Button onClick={this.handleClickPencil} className={type === 'pencil' ? 'active' : null}>
          <img src="/assets/pencil.png" alt="pencil" />
        </Button>
        <Button onClick={this.handleClickEraser} className={type === 'eraser' ? 'active' : null}>
          <img src="/assets/eraser.png" alt="eraser" />
        </Button>
        <Button onClick={this.handleClickColorPicker} className={type === 'color-picker' ? 'active' : null}>
          <img src="/assets/color-picker.png" alt="color picker" />
        </Button>
        <Button onClick={this.handleClickZoomIn}>
          <img src="/assets/zoom-in.png" alt="zoom in" />
        </Button>
        <Button onClick={this.handleClickZoomOut}>
          <img src="/assets/zoom-out.png" alt="zoom out" />
        </Button>
      </div>
    );
  }
}

function select(state) {
  const $$canvasStore = state.$$canvasStore;

  return {
    type: $$canvasStore.getIn(['style', 'type']),
    scale: $$canvasStore.getIn(['canvas', 'scale']),
  };
}

export default connect(select)(ChatWidget);
