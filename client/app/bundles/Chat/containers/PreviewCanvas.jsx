import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import { setCanvasImage } from '../actions/canvasActionCreators';

function cssColor(c) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

class PreviewCanvas extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    paths: PropTypes.instanceOf(Immutable.Set).isRequired,
    style: PropTypes.instanceOf(Immutable.Map).isRequired,
    tempPath: PropTypes.instanceOf(Immutable.List).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    width: 2000,
    height: 2000,
  };

  constructor(props) {
    super(props);
    this.mainImage = null;
  }

  componentDidMount() {
    requestAnimationFrame(this.redraw);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { width, height, paths, tempPath } = this.props;
    if (width !== nextProps.width || height !== nextProps.height) {
      return true;
    }

    const pathDiff = nextProps.paths.subtract(paths);
    if (pathDiff.size > 0) {
      const lastPath = paths.last();
      if (lastPath && lastPath.get('id') < pathDiff.first().get('id')) {
        return true; // 古いパスが変更された場合はredraw
      }
      requestAnimationFrame(() => {
        this.restoreImage();
        this.drawPaths(pathDiff);
        this.buckupImage();
        this.drawTempPath();
        this.reflectOnDrawCanvas();
      });
    } else if (!Immutable.is(tempPath, nextProps.tempPath)) {
      requestAnimationFrame(() => {
        this.restoreImage();
        this.drawTempPath();
        this.reflectOnDrawCanvas();
      });
    }
    return false;
  }

  componentDidUpdate() {
    requestAnimationFrame(this.redraw);
  }

  // tempのスタイルの設定
  setTempCtxStyle(style) {
    const ctx = this.tempCtx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = cssColor(style.color);
    ctx.lineWidth = style.width;
    ctx.globalAlpha = style.color.a;
    ctx.globalCompositeOperation = style.type;
  }

  // パスを描画
  drawPathData(pathData) {
    const { width, height } = this.props;
    const ctx = this.tempCtx;

    // 画面クリア
    ctx.clearRect(0, 0, width, height);

    // 線を引く
    ctx.beginPath();
    const firstPoint = pathData.first();
    ctx.moveTo(firstPoint.get('x'), firstPoint.get('y'));
    for (const point of pathData.shift()) {
      ctx.lineTo(point.get('x'), point.get('y'));
    }
    ctx.stroke();

    // mainに反映
    this.mainCtx.drawImage(this.tempCanvas, 0, 0);
  }

  drawPaths(paths) {
    for (const path of paths) {
      this.setTempCtxStyle(path.get('style').toJS());
      this.drawPathData(path.get('data'));
    }
  }

  drawTempPath() {
    const { tempPath, style } = this.props;

    if (tempPath.size === 0) {
      return;
    }

    this.setTempCtxStyle(style.toJS());
    this.drawPathData(tempPath);
  }

  // 画像にしてDrawCanvasに反映
  reflectOnDrawCanvas() {
    const { dispatch } = this.props;
    dispatch(setCanvasImage(this.mainCanvas.toDataURL()));
  }

  buckupImage() {
    const { width, height } = this.props;
    this.mainImage = this.mainCtx.getImageData(0, 0, width, height);
  }

  restoreImage() {
    if (this.mainImage) {
      this.mainCtx.putImageData(this.mainImage, 0, 0);
    }
  }

  redraw = () => {
    const { width, height, paths } = this.props;
    this.mainCtx.clearRect(0, 0, width, height);
    this.drawPaths(paths);
    this.buckupImage();
    this.drawTempPath();
    this.reflectOnDrawCanvas();
  }

  refMainCtx = (element) => {
    this.mainCanvas = element;
    this.mainCtx = element.getContext('2d');
  }

  refTempCtx = (element) => {
    this.tempCanvas = element;
    this.tempCtx = element.getContext('2d');
  }

  render() {
    const { width, height } = this.props;

    return (
      <div className="canvas-wrapper">
        <canvas id="mainCanvas" width={width} height={height} ref={this.refMainCtx} />
        <canvas id="tempCanvas" width={width} height={height} ref={this.refTempCtx} />
      </div>
    );
  }
}

function select(state, ownProps) {
  const $$canvasStore = state.$$canvasStore;

  return {
    style: $$canvasStore.get('style'),
    paths: $$canvasStore.get('paths'),
    tempPath: $$canvasStore.get('tempPath'),
  };
}

export default connect(select)(PreviewCanvas);
