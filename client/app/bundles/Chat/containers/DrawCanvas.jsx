import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

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
    style: PropTypes.instanceOf(Immutable.Map).isRequired,
    canvas: PropTypes.instanceOf(Immutable.Map).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    previewCanvas: null
  };

  constructor(props) {
    super(props);
    this.isMouseDown = false;
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeEvent);
    this.resizeCanvas();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResizeEvent);
  }

  resizeCanvas() {
    if (this.mouseCircleCtx) {
      const canvas = this.mouseCircleCtx.canvas;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
  }

  handleResizeEvent = () => {
    this.resizeCanvas();
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

    const pos = getMousePosition(e);
    this.drawMousePosition(pos);

    if (this.isMouseDown) {
      dispatch(addTempPath(pos));
    }
  }

  handleMouseUp = () => {
    const { dispatch, join } = this.props;
    if (!join) {
      return;
    }

    if (this.isMouseDown) {
      this.isMouseDown = false;
      dispatch(sendTempPath());
    }
  }

  handleMouseOut = () => {
    this.clearMousePositionCanvas();
  }

  clearMousePositionCanvas() {
    const ctx = this.mouseCircleCtx;
    if (ctx) {
      const canvas = ctx.canvas;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  drawMousePosition(pos) {
    const ctx = this.mouseCircleCtx;
    if (!ctx) {
      return;
    }

    const { style, canvas } = this.props;
    const { x, y } = pos;
    this.clearMousePositionCanvas();
    ctx.strokeStyle = '#808080';
    ctx.beginPath();
    ctx.arc(x, y, (style.get('width') * canvas.get('scale')) / 2, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  refCanvasCtx = (element) => {
    if (element) {
      this.mouseCircleCtx = element.getContext('2d');
    } else {
      this.mouseCircleCtx = null;
    }
  }

  render() {
    return (
      <div className="draw-canvas"
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseOut={this.handleMouseOut}>
        <MainCanvas previewCanvas={this.props.previewCanvas} />
        <canvas id="mouseCircleCanvas" ref={this.refCanvasCtx} />
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;

  return {
    join: $$chatStore.get('join'),
    style: $$canvasStore.get('style'),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(DrawCanvas);
