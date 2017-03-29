import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import EventListener from 'react-event-listener';

import { setVisibleTempPath, sendTempPath, setCanvasInfo } from '../actions/canvasActionCreators';
import ShadowCanvas from './ShadowCanvas';
import { getMousePosition } from '../utils';

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
    this.lastRequestAnimationFrameId = null;
    this.tempPath = [];
  }

  componentDidMount() {
    this.resizeCanvas();
  }

  resizeCanvas() {
    const { dispatch } = this.props;
    const { offsetWidth, offsetHeight } = this.mouseHandleElement;

    dispatch(setCanvasInfo({
      width: offsetWidth,
      height: offsetHeight,
    }));

    if (this.mouseCircleCtx) {
      const canvas = this.mouseCircleCtx.canvas;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
    }

    if (this.mainCanvas) {
      const canvas = this.mainCanvas;
      canvas.width = offsetWidth;
      canvas.height = offsetHeight;
    }
  }

  handleResize = () => {
    this.resizeCanvas();
  }

  handleMouseDown = (e) => {
    const { dispatch, join, canvas } = this.props;
    if (!join) {
      return;
    }

    // e.button 0: 左 1: 中 2: 右
    if (!this.isMouseDown) {
      this.isMouseDown = true;
      const { scale, left, top } = canvas.toJS();
      this.tempPath = [getMousePosition(e, { scale, left, top }).transformed];
      this.drawTempPath(this.tempPath);
      dispatch(setVisibleTempPath(true));
    }
  }

  handleMouseMove = (e) => {
    window.getSelection().removeAllRanges();
    e.preventDefault();

    const { join, canvas } = this.props;
    if (!join) {
      return;
    }

    const { scale, left, top } = canvas.toJS();
    const pos = getMousePosition(e, { scale, left, top });
    this.drawMousePosition(pos.original);

    if (this.isMouseDown) {
      this.tempPath.push(pos.transformed);
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
    this.handleMouseUp();
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

  refMouseCircleCtx = (element) => {
    this.mouseCircleCtx = element && element.getContext('2d');
  }

  refMainCanvas = (element) => {
    this.mainCanvas = element;
  }

  refMouseHandleElement = (element) => {
    this.mouseHandleElement = element;
  }

  handleSetDrawTempPathMethod = (drawTempPath) => {
    this.drawTempPath = (tempPath) => {
      // 未実行のものがあればキャンセル
      if (this.lastRequestAnimationFrameId) {
        cancelAnimationFrame(this.lastRequestAnimationFrameId);
      }
      this.lastRequestAnimationFrameId = requestAnimationFrame(() => {
        this.lastRequestAnimationFrameId = null;
        drawTempPath(tempPath);
      });
    };
  }

  render() {
    const { canvas } = this.props;
    const width = 2000;
    const height = 2000;
    const style = {
      width,
      height,
      transformOrigin: 'left top',
      transform: `scale(${canvas.get('scale')}) translate(${-canvas.get('left')}px, ${-canvas.get('top')}px)`
    };

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
        <ShadowCanvas
          width={width}
          height={height}
          mainCanvas={this.mainCanvas}
          previewCanvas={this.props.previewCanvas}
          setDrawTempPathMethod={this.handleSetDrawTempPathMethod} />
        <div className="canvas-back" style={style} />
        <canvas id="mainCanvas" ref={this.refMainCanvas} />
        <canvas id="mouseCircleCanvas" ref={this.refMouseCircleCtx} />
      </div>
    );
  }
}

function select(state) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;

  return {
    join: $$chatStore.get('join'),
    style: $$canvasStore.get('style'),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(DrawCanvas);
