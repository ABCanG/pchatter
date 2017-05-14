import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import EventListener from 'react-event-listener';

import { setVisibleTempPath, sendTempPath, setCanvasInfo, setStyleColor } from '../actions/canvasActionCreators';
import OffscreenCanvas from './OffscreenCanvas';
import { getMousePosition } from '../utils';

class DrawCanvas extends React.Component {
  static propTypes = {
    join: PropTypes.bool.isRequired,
    previewCanvas: PropTypes.instanceOf(HTMLElement),
    style: ImmutablePropTypes.map.isRequired,
    canvas: ImmutablePropTypes.map.isRequired,
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
    this.altKey = false;
    this.lastPos = null;
  }

  componentDidMount() {
    this.resizeCanvas();
  }

  resizeCanvas() {
    const { dispatch } = this.props;
    const { offsetWidth, offsetHeight } = this.mouseHandleElement;
    const width = offsetWidth - 2;
    const height = offsetHeight - 2;

    dispatch(setCanvasInfo({ width, height }));

    if (this.mouseCircleCtx) {
      const canvas = this.mouseCircleCtx.canvas;
      canvas.width = width;
      canvas.height = height;
      this.mouseCircleCtx.globalCompositeOperation = 'copy';
    }

    if (this.mainCanvas) {
      const canvas = this.mainCanvas;
      canvas.width = width;
      canvas.height = height;
    }
  }

  handleResize = () => {
    this.resizeCanvas();
  }

  handleMouseDown = (e) => {
    const { dispatch, join, canvas, style } = this.props;
    if (!join) {
      return;
    }

    const { scale, left, top } = canvas.toJS();
    const pos = getMousePosition(e, { scale, left, top });

    // e.button 0: 左 1: 中 2: 右
    if (this.altKey || style.get('type') === 'color-picker') {
      const color = this.getCanvasColor(pos.transformed);
      dispatch(setStyleColor(color));
    } else if (!this.isMouseDown) {
      this.isMouseDown = true;
      this.tempPath = [pos.transformed];
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
    this.lastPos = pos;
    this.drawMousePosition(pos);

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
    this.lastPos = null;
  }

  handleKeyDown = (e) => {
    this.changeSpoit(e.altKey);
  }

  handleKeyUp = (e) => {
    this.changeSpoit(e.altKey);
  }

  handleBlur = () => {
    this.changeSpoit(false);
  }

  changeSpoit(altKey) {
    const lastPos = this.lastPos;
    this.altKey = altKey;
    if (lastPos) {
      this.drawMousePosition(lastPos);
    }
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
    const { x, y } = pos.original;
    const circleColor = '#808080';

    if (this.altKey || style.get('type') === 'color-picker') {
      ctx.beginPath();
      const radius = 30;
      const color = this.getCanvasColor(pos.transformed);

      ctx.lineWidth = 10;
      ctx.strokeStyle = circleColor;
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      ctx.beginPath();
      ctx.lineWidth = 8;
      ctx.strokeStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.globalCompositeOperation = 'copy';
    } else {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = circleColor;
      ctx.arc(x, y, ((style.get('width') * canvas.get('scale')) / 2), 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }

  refMouseCircleCtx = (element) => {
    this.mouseCircleCtx = element.getContext('2d');
  }

  refMainCanvas = (element) => {
    this.mainCanvas = element;
  }

  refMouseHandleElement = (element) => {
    this.mouseHandleElement = element;
  }

  handleExportFunction = ({ getCanvasColor, drawTempPath }) => {
    this.getCanvasColor = getCanvasColor;
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
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          onBlur={this.handleBlur}
          onResize={this.handleResize} />
        {this.mouseHandleElement && <EventListener
          target={this.mouseHandleElement}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseOut={this.handleMouseOut} />}
        <OffscreenCanvas
          width={width}
          height={height}
          mainCanvas={this.mainCanvas}
          previewCanvas={this.props.previewCanvas}
          exportFunction={this.handleExportFunction} />
        <div className="canvas-back" style={style} />
        <canvas ref={this.refMainCanvas} />
        <canvas ref={this.refMouseCircleCtx} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  const $$chatStore = state.$$chatStore;
  const $$canvasStore = state.$$canvasStore;

  return {
    join: $$chatStore.get('join'),
    style: $$canvasStore.get('style'),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(mapStateToProps)(DrawCanvas);
