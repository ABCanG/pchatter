import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';

import {
  setCtxStyle,
  typeToCompositeOperation,
  getMainCanvasTrimInfo,
  drawPathData,
  drawPaths,
  resizeImage,
} from '../../../../commonjs/canvas';

function createCtx(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  return ctx;
}

class OffscreenCanvas extends React.Component {
  static propTypes = {
    visibleTempPath: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    paths: ImmutablePropTypes.set.isRequired,
    style: PropTypes.shape({
      color: PropTypes.shape({
        r: PropTypes.number.isRequired,
        g: PropTypes.number.isRequired,
        b: PropTypes.number.isRequired,
        a: PropTypes.number.isRequired,
      }).isRequired,
      width: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
    }).isRequired,
    canvas: ImmutablePropTypes.map.isRequired,
    mainCanvas: PropTypes.instanceOf(HTMLElement),
    previewCanvas: PropTypes.instanceOf(HTMLElement),
    baseImage: PropTypes.instanceOf(HTMLElement),
    setDrawTempPathMethod: PropTypes.func.isRequired,
  };

  static defaultProps = {
    width: 2000,
    height: 2000,
    mainCanvas: null,
    previewCanvas: null,
    baseImage: null,
  };

  constructor(props) {
    super(props);
    const { width, height } = props;
    const offscrenNames = ['temp', 'original', 'my', 'previewCache', 'mainCache'];

    this.tempPath = [];

    this.ctx = offscrenNames.reduce((ctx, name) => {
      ctx[name] = createCtx(width, height);
      return ctx;
    }, {});

    this.ctx.temp.globalCompositeOperation = 'copy';
    this.ctx.my.globalCompositeOperation = 'copy';
    this.ctx.mainCache.globalCompositeOperation = 'copy';
  }

  componentDidMount() {
    this.props.setDrawTempPathMethod(this.drawTempPath);
    requestAnimationFrame(this.redraw);
  }

  shouldComponentUpdate(nextProps) {
    const { visibleTempPath, canvas, paths, baseImage } = this.props;
    const isRefreshPreview = visibleTempPath !== nextProps.visibleTempPath;
    const isRefreshMain = !Immutable.is(canvas, nextProps.canvas);
    if (isRefreshPreview || isRefreshMain) {
      requestAnimationFrame(() => {
        if (isRefreshPreview) {
          this.reflectOnPreviewCanvas();
        }
        if (isRefreshMain) {
          this.makeOffscreenMainCache();
          this.reflectOnMainCanvas();
        }
      });
      return true;
    }

    if (baseImage !== nextProps.baseImage) {
      requestAnimationFrame(this.redraw);
      return false;
    }

    const pathDiff = nextProps.paths.subtract(paths);

    if (pathDiff.size > 0) {
      const lastPath = paths.last();
      // 古いパスが変更された場合はredraw
      if (lastPath && lastPath.get('id') > pathDiff.first().get('id')) {
        requestAnimationFrame(this.redraw);
        return false;
      }

      requestAnimationFrame(() => {
        const rawPathDiff = pathDiff.toJS();
        this.drawMainAndPreviewCache(rawPathDiff);
        this.reflectOnPreviewCanvas();
        this.makeOffscreenMainCache();
        this.reflectOnMainCanvas();
      });
    }

    return false;
  }

  // 親から呼ばれる
  drawTempPath = (tempPath) => {
    const { width, height, style } = this.props;

    this.tempPath = tempPath;

    if (tempPath.length > 0) {
      setCtxStyle(this.ctx.my, style);
      drawPathData(this.ctx.my, tempPath);
      this.reflectOnMainCanvas();
    } else {
      this.ctx.my.clearRect(0, 0, width, height);
    }
  }

  makeOffscreenMainCache() {
    const { canvas, mainCanvas } = this.props;
    if (mainCanvas) {
      const { width: mainWidth, height: mainHeght } = mainCanvas;
      const { sx, sy, sw, sh } = getMainCanvasTrimInfo(canvas, mainCanvas);
      const cacheCanvas = this.ctx.mainCache.canvas;
      const src = this.ctx.original.canvas;
      resizeImage(cacheCanvas, mainWidth, mainHeght, src, sx, sy, sw, sh);
    }
  }

  drawMainAndPreviewCache(paths) {
    const tempCtx = this.ctx.temp;
    drawPaths(paths, this.ctx.original, tempCtx);
    drawPaths(paths, this.ctx.previewCache, tempCtx, 0.1);
  }

  reflectOnPreviewCanvas() {
    const { previewCanvas } = this.props;
    if (!previewCanvas) {
      return;
    }

    const ctx = previewCanvas.getContext('2d');
    const cacheCanvas = this.ctx.previewCache.canvas;
    const { width: pWidth, height: pHeght } = previewCanvas;

    ctx.fillStyle = 'white';
    ctx.globalCompositeOperation = typeToCompositeOperation();
    ctx.fillRect(0, 0, pWidth, pHeght);
    ctx.drawImage(cacheCanvas, 0, 0, pWidth, pHeght, 0, 0, pWidth, pHeght);
  }

  reflectOnMainCanvas() {
    const { canvas, style, mainCanvas, visibleTempPath } = this.props;
    if (mainCanvas) {
      const ctx = mainCanvas.getContext('2d');
      const { width: mainWidth, height: mainHeght } = mainCanvas;
      const cacheCanvas = this.ctx.mainCache.canvas;

      ctx.clearRect(0, 0, mainWidth, mainHeght);
      ctx.globalCompositeOperation = typeToCompositeOperation();
      ctx.drawImage(cacheCanvas, 0, 0, mainWidth, mainHeght, 0, 0, mainWidth, mainHeght);

      // 自分の引いた線を反映
      if (visibleTempPath) {
        const { sx, sy, sw, sh } = getMainCanvasTrimInfo(canvas, mainCanvas);
        const src = this.ctx.my.canvas;
        const temp = this.ctx.temp.canvas;
        ctx.globalCompositeOperation = typeToCompositeOperation(style.type);
        // TODO resizeImageを使わないように
        resizeImage(mainCanvas, mainWidth, mainHeght, src, sx, sy, sw, sh, temp);
      }
    }
  }

  redraw = () => {
    const { width, height, paths, baseImage, previewCanvas } = this.props;
    const rawPaths = paths.toJS();
    this.ctx.original.clearRect(0, 0, width, height);
    this.ctx.previewCache.clearRect(0, 0, width, height);
    if (baseImage) {
      this.ctx.original.drawImage(baseImage, 0, 0);
      const { width: pWidth, height: pHeght } = previewCanvas;
      const src = this.ctx.original.canvas;
      const temp = this.ctx.temp.canvas;
      resizeImage(this.ctx.previewCache.canvas, pWidth, pHeght, src, 0, 0, width, height, temp);
    }
    this.drawMainAndPreviewCache(rawPaths);
    this.reflectOnPreviewCanvas();
    this.makeOffscreenMainCache();
    this.reflectOnMainCanvas();
  }

  render() {
    return (
      <div className="offscreen-canvas" />
    );
  }
}

function mapStateToProps(state) {
  const $$canvasStore = state.$$canvasStore;

  return {
    visibleTempPath: $$canvasStore.get('visibleTempPath'),
    style: $$canvasStore.get('style').toJS(),
    paths: $$canvasStore.get('paths'),
    canvas: $$canvasStore.get('canvas'),
    baseImage: $$canvasStore.get('baseImage'),
  };
}

export default connect(mapStateToProps)(OffscreenCanvas);
