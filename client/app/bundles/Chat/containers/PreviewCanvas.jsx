import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { setCanvasInfo } from '../actions/canvasActionCreators';
import { getMousePosition } from '../utils';

class PreviewCanvas extends React.Component {
  static propTypes = {
    canvas: PropTypes.instanceOf(Immutable.Map).isRequired,
    refPreviewCanvas: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.isMouseDown = false;
  }

  setFramePosition(e) {
    const { dispatch } = this.props;
    const { width, height } = this.getFrameWidthHeight();
    const { x, y } = getMousePosition(e, { target: this.previewElement }).original;
    dispatch(setCanvasInfo({
      left: (x - (width / 2)) * 10,
      top: (y - (height / 2)) * 10,
    }));
  }

  getFrameWidthHeight() {
    const { canvas } = this.props;
    const scale = canvas.get('scale');
    return {
      width: canvas.get('width') / 10 / scale,
      height: canvas.get('height') / 10 / scale,
    };
  }

  handleMouseDown = (e) => {
    if (!this.isMouseDown) {
      this.isMouseDown = true;
      this.setFramePosition(e);
    }
  }

  handleMouseMove = (e) => {
    window.getSelection().removeAllRanges();
    e.preventDefault();

    if (this.isMouseDown) {
      this.setFramePosition(e);
    }
  }

  handleMouseUp = () => {
    if (this.isMouseDown) {
      this.isMouseDown = false;
    }
  }

  handleMouseOut = () => {
    this.isMouseDown = false;
  }

  refPreviewElement = (element) => {
    this.previewElement = element;
  }

  render() {
    const { canvas } = this.props;
    const { width, height } = this.getFrameWidthHeight();
    const style = {
      width,
      height,
      transform: `translate(${canvas.get('left') / 10}px, ${canvas.get('top') / 10}px)`
    };

    return (
      <div
        className="preview"
        onMouseDown={this.handleMouseDown}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseOut={this.handleMouseOut}
        ref={this.refPreviewElement}>
        <canvas id="previewCanvas" width={200} height={200} ref={this.props.refPreviewCanvas} />
        <div className="preview-frame" style={style} />
      </div>
    );
  }
}

function select(state) {
  const $$canvasStore = state.$$canvasStore;

  return {
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(PreviewCanvas);
