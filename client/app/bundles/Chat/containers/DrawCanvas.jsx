import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  initTempPath, addTempPath, sendTempPath,
} from '../actions/canvasActionCreators';
import MainCanvas from './MainCanvas';


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
    previewCanvas: PropTypes.instanceOf(HTMLElement),
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    previewCanvas: null
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
    return (
      <div className="draw-canvas"
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}>
        <MainCanvas previewCanvas={this.props.previewCanvas} />
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$chatStore = state.$$chatStore;

  return {
    join: $$chatStore.get('join'),
  };
}

export default connect(select)(DrawCanvas);
