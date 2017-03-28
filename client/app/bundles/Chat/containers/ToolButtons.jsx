import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { setStyleType, setCanvasInfo } from '../actions/canvasActionCreators';

function convertNewCanvasInfo(canvasInfo, diff) {
  const { scale, left, top, width, height } = canvasInfo;
  const newScale = scale + diff;
  return {
    scale: newScale,
    left: left + (((width / scale) - (width / newScale)) / 2),
    top: top + (((height / scale) - (height / newScale)) / 2),
  };
}

class ChatWidget extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    canvas: PropTypes.instanceOf(Immutable.Map).isRequired,
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
    const { dispatch, canvas } = this.props;
    dispatch(setCanvasInfo(convertNewCanvasInfo(canvas.toJS(), 0.05)));
  }

  handleClickZoomOut = () => {
    const { dispatch, canvas } = this.props;
    dispatch(setCanvasInfo(convertNewCanvasInfo(canvas.toJS(), -0.05)));
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
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(ChatWidget);
