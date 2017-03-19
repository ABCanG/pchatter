import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

function cssColor(c) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

class MainCanvas extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    paths: PropTypes.instanceOf(Immutable.Set).isRequired,
    style: PropTypes.instanceOf(Immutable.Map).isRequired,
    tempPath: PropTypes.instanceOf(Immutable.List).isRequired,
    canvas: PropTypes.instanceOf(Immutable.Map).isRequired,
    previewCanvas: PropTypes.instanceOf(HTMLElement),
  };

  static defaultProps = {
    width: 2000,
    height: 2000,
    previewCanvas: null
  };

  componentDidMount() {
    requestAnimationFrame(this.redraw);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { width, height, paths, tempPath } = this.props;
    if (width !== nextProps.width || height !== nextProps.height) {
      return true;
    }

    const pathDiff = nextProps.paths.subtract(paths);
    const refreshMainCanvas = pathDiff.size > 0;
    const refreshTempCanvas = !Immutable.is(tempPath, nextProps.tempPath);

    // 古いパスが変更された場合はredraw
    if (refreshMainCanvas) {
      const lastPath = paths.last();
      if (lastPath && lastPath.get('id') > pathDiff.first().get('id')) {
        requestAnimationFrame(this.redraw);
        return false;
      }
    }

    if (refreshMainCanvas || refreshTempCanvas) {
      requestAnimationFrame(() => {
        if (refreshMainCanvas) {
          this.drawPaths(pathDiff);
        }
        if (refreshTempCanvas) {
          this.drawTempPath();
        }
        this.reflectOnPreviewCanvas();
      });
    }
    return false;
  }

  componentDidUpdate() {
    requestAnimationFrame(this.redraw);
  }

  // tempのスタイルの設定
  setTempCtxStyle(style) {
    if (!this.isDrawable()) {
      return;
    }

    const ctx = this.tempCtx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = cssColor(style.color);
    ctx.lineWidth = style.width;
    ctx.globalAlpha = style.color.a;
    ctx.globalCompositeOperation = style.type;
  }

  // パスを描画
  drawPathData(pathData, distCtx) {
    if (!this.isDrawable()) {
      return;
    }

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

    // 出力先のキャンバスに反映
    distCtx.drawImage(this.tempCtx.canvas, 0, 0);
  }

  drawPaths(paths) {
    for (const path of paths) {
      this.setTempCtxStyle(path.get('style').toJS());
      this.drawPathData(path.get('data'), this.mainCtx);
    }
  }

  drawTempPath() {
    if (!this.isDrawable()) {
      return;
    }

    const { width, height, tempPath, style } = this.props;

    this.myCtx.clearRect(0, 0, width, height);
    if (tempPath.size > 0) {
      this.setTempCtxStyle(style.toJS());
      this.drawPathData(tempPath, this.myCtx);
    }
  }

  isDrawable() {
    return this.tempCtx && this.mainCtx && this.myCtx;
  }

  // 画像にしてpreviewCanvasに反映
  reflectOnPreviewCanvas() {
    const { width, height, previewCanvas } = this.props;
    if (!previewCanvas || !this.isDrawable()) {
      return;
    }

    const previewWidth = previewCanvas.width;
    const previewHeight = previewCanvas.height;
    const ctx = previewCanvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, previewWidth, previewHeight);
    ctx.drawImage(this.mainCtx.canvas, 0, 0, width, height, 0, 0, previewWidth, previewHeight);
    ctx.drawImage(this.tempCtx.canvas, 0, 0, width, height, 0, 0, previewWidth, previewHeight);
  }

  redraw = () => {
    const { width, height, paths } = this.props;
    if (!this.isDrawable()) {
      return;
    }

    this.mainCtx.clearRect(0, 0, width, height);
    this.drawPaths(paths);
    this.drawTempPath();
    this.reflectOnPreviewCanvas();
  }

  refCanvasCtx(target) {
    return (element) => {
      if (element) {
        this[`${target}Ctx`] = element.getContext('2d');
      } else {
        this[`${target}Ctx`] = null;
      }
    };
  }

  render() {
    const { width, height, canvas } = this.props;
    const style = {
      width,
      height,
      transform: `scale(${canvas.get('scale')}) translate(-${canvas.get('top')}px, -${canvas.get('left')}px)`
    };

    return (
      <div className="canvas-wrapper">
        <div className="canvas-back" style={style} />
        <canvas id="tempCanvas" width={width} height={height} ref={this.refCanvasCtx('temp')} />
        <canvas id="mainCanvas" width={width} height={height} ref={this.refCanvasCtx('main')} style={style} />
        <canvas id="myCanvas" width={width} height={height} ref={this.refCanvasCtx('my')} style={style} />
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
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(MainCanvas);
