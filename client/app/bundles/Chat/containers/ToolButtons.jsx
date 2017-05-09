import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

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

function disableDrag(e) {
  e.preventDefault();
}


class ChatWidget extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    canvas: ImmutablePropTypes.map.isRequired,
    join: PropTypes.bool.isRequired,
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
    const { type, join } = this.props;

    return (
      <div className="tool-buttons">
        {join && <Button onMouseDown={this.handleClickPencil} className={type === 'pencil' ? 'active' : null}>
          <img src="/assets/pencil.png" alt="pencil" onDragStart={disableDrag} />
        </Button>}
        {join && <Button onMouseDown={this.handleClickEraser} className={type === 'eraser' ? 'active' : null}>
          <img src="/assets/eraser.png" alt="eraser" onDragStart={disableDrag} />
        </Button>}
        {false/* TODO */ && <Button onMouseDown={this.handleClickColorPicker} className={type === 'color-picker' ? 'active' : null}>
          <img src="/assets/color-picker.png" alt="color picker" onDragStart={disableDrag} />
        </Button>}
        <Button onMouseDown={this.handleClickZoomIn}>
          <img src="/assets/zoom-in.png" alt="zoom in" onDragStart={disableDrag} />
        </Button>
        <Button onMouseDown={this.handleClickZoomOut}>
          <img src="/assets/zoom-out.png" alt="zoom out" onDragStart={disableDrag} />
        </Button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;

  return {
    join: $$chatStore.get('join'),
    type: $$canvasStore.getIn(['style', 'type']),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(mapStateToProps)(ChatWidget);
