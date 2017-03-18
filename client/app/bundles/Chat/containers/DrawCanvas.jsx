import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import {
  initTempPath, addTempPath, sendTempPath,
} from '../actions/canvasActionCreators';

function getMousePosition(e) {
  const rect = e.target.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) - 1,
    y: (e.clientY - rect.top) - 1,
  };
}

class DrawCanvas extends React.Component {
  static propTypes = {
    join: PropTypes.bool.isRequired,
    canvas: PropTypes.instanceOf(Immutable.Map).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.isMouseDown = false;
  }


  handleMouseDown = (e) => {
    const { dispatch, join } = this.props;
    if (!join) {
      return;
    }

    // e.button 0: 左 1: 中 2: 右
    if (!this.isMouseDown) {
      this.isMouseDown = true;
      dispatch(initTempPath(getMousePosition(e)));
    }
  }

  handleMouseMove = (e) => {
    window.getSelection().removeAllRanges();
    e.preventDefault();

    const { dispatch, join } = this.props;
    if (!join) {
      return;
    }

    if (this.isMouseDown) {
      dispatch(addTempPath(getMousePosition(e)));
    }
  }

  handleMouseUp = (e) => {
    const { dispatch, join } = this.props;
    if (!join) {
      return;
    }

    if (this.isMouseDown) {
      this.isMouseDown = false;
      dispatch(sendTempPath());
    }
  }

  render() {
    const { canvas } = this.props;
    const style = {
      transform: `scale(${canvas.get('scale')}) translate(-${canvas.get('top')}px, -${canvas.get('left')}px)`
    };

    return (
      <div className="draw-canvas"
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}>
        <img src="/base.png" style={style} />
        <img src={canvas.get('image')} style={style} />
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;

  return {
    join: $$chatStore.get('join'),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(DrawCanvas);
