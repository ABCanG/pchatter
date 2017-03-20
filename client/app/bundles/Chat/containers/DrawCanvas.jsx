import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import EventListener from 'react-event-listener';

import { setVisibleTempPath, sendTempPath } from '../actions/canvasActionCreators';
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
    this.tempPath = [];
  }

  componentDidMount() {
    this.resizeCanvas();
  }

  resizeCanvas() {
    if (this.mouseCircleCtx) {
      const canvas = this.mouseCircleCtx.canvas;
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    }
  }

  handleResize = () => {
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
      this.tempPath = [getMousePosition(e)];
      this.drawTempPath(this.tempPath);
      dispatch(setVisibleTempPath(true));
    }
  }

  handleMouseMove = (e) => {
    window.getSelection().removeAllRanges();
    e.preventDefault();

    const { join } = this.props;
    if (!join) {
      return;
    }

    const pos = getMousePosition(e);
    this.drawMousePosition(pos);

    if (this.isMouseDown) {
      this.tempPath.push(pos);
      this.drawTempPath(this.tempPath);
    }
  }

  handleMouseUp = () => {
    const { dispatch, join } = this.props;
    if (!join) {
      return;
    }

    if (this.isMouseDown) {
      this.isMouseDown = false;
      dispatch(sendTempPath(this.tempPath));
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

  refMouseHandleElement = (element) => {
    this.mouseHandleElement = element;
  }

  handleSetDrawTempPathMethod = (drawTempPath) => {
    this.drawTempPath = (tempPath) => requestAnimationFrame(() => {
      drawTempPath(tempPath);
    });
  }

  render() {
    return (
      <div className="draw-canvas"
        ref={this.refMouseHandleElement}>
        <EventListener
          target="window"
          onResize={this.handleResize} />
        {this.mouseHandleElement && <EventListener
          target={this.mouseHandleElement}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseOut={this.handleMouseOut} />}
        <MainCanvas previewCanvas={this.props.previewCanvas}
          setDrawTempPathMethod={this.handleSetDrawTempPathMethod} />
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
