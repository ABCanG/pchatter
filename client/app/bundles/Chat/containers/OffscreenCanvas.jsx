import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

function createCtx(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  return ctx;
}

function setCtxStyle(ctx, style) {
  const c = style.color;
  ctx.strokeStyle = `rgb(${c.r},${c.g},${c.b})`;
  ctx.globalAlpha = style.color.a;
  ctx.lineWidth = style.width;
}

function getMidPoint(one, another) {
  return {
    x: (one.x + another.x) / 2,
    y: (one.y + another.y) / 2,
  };
}

function typeToCompositeOperation(type) {
  const operations = {
    pencil: 'source-over',
    eraser: 'destination-out',
  };
  return operations[type] || operations.pencil;
}

function getMainCanvasTrimInfo(canvas, mainCanvas) {
  const { width: mainWidth, height: mainHeght } = mainCanvas;
  const scale = canvas.get('scale');
  const sx = canvas.get('left');
  const sy = canvas.get('top');
  const sw = mainWidth / scale;
  const sh = mainHeght / scale;
  return {sx, sy, sw, sh};
}

// パスを描画
function drawPathData(ctx, pathData) {
  const length = pathData.length;

  if (!length) {
    return;
  }

  if (length < 3) {
    // 直線を引く
    ctx.beginPath();
    const firstPoint = pathData[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const point of pathData) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  } else {
    const [firstPoint, ...restPoint] = pathData;
    const lastPoint = pathData[length - 1];
    const firstMidPoint = getMidPoint(firstPoint, pathData[1]);

    // 最初と最後は直線、途中はベジェ曲線を引く
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    ctx.lineTo(firstMidPoint.x, firstMidPoint.y);
    restPoint.forEach((point, index, points) => {
      const nextPoint = points[index + 1];
      if (!nextPoint) {
        return;
      }

      const midPoint = getMidPoint(point, nextPoint);
      ctx.quadraticCurveTo(point.x, point.y, midPoint.x, midPoint.y);
    });
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.stroke();
  }
}

function resizeImage(dCanvas, dw, dh, sCanvas, sx, sy, sw, sh, tempCanvas = null) {
  const tmpCanvas = tempCanvas || dCanvas;
  const ctx = tmpCanvas.getContext('2d');
  const scale = Math.max(Math.max(sw, sh) / tmpCanvas.width, 1);

  let tempWidth = sw / scale;
  let tempHeight = sh / scale;

  ctx.drawImage(sCanvas, sx, sy, sw, sh, 0, 0, tempWidth, tempHeight);
  while (tempWidth / dw > 2) {
    const nextWidth = tempWidth / 2;
    const nextHeight = tempHeight / 2;
    ctx.drawImage(tmpCanvas, 0, 0, tempWidth, tempHeight, 0, 0, nextWidth, nextHeight);
    tempWidth = nextWidth;
    tempHeight = nextHeight;
  }

  dCanvas.getContext('2d').drawImage(tmpCanvas, 0, 0, tempWidth, tempHeight, 0, 0, dw, dh);
}


class OffscreenCanvas extends React.Component {
  static propTypes = {
    visibleTempPath: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    paths: PropTypes.instanceOf(Immutable.Set).isRequired,
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
    canvas: PropTypes.instanceOf(Immutable.Map).isRequired,
    mainCanvas: PropTypes.instanceOf(HTMLElement),
    previewCanvas: PropTypes.instanceOf(HTMLElement),
    setDrawTempPathMethod: PropTypes.func.isRequired,
  };

  static defaultProps = {
    width: 2000,
    height: 2000,
    mainCanvas: null,
    previewCanvas: null,
  };

  constructor(props) {
    super(props);
    const { width, height } = props;
    const offscrenNames = ['temp', 'main', 'my', 'previewCache', 'mainCache'];

    this.tempPath = [];

    this.ctx = offscrenNames.reduce((ctx, name) => {
      ctx[name] = createCtx(width, height);
      return ctx;
    }, {});

    this.ctx.temp.globalCompositeOperation = 'copy';
    this.ctx.my.globalCompositeOperation = 'copy';
    this.ctx.previewCache.globalCompositeOperation = 'copy';
    this.ctx.mainCache.globalCompositeOperation = 'copy';
  }

  componentDidMount() {
    this.props.setDrawTempPathMethod(this.drawTempPath);
    requestAnimationFrame(this.redraw);
  }

  shouldComponentUpdate(nextProps) {
    const { visibleTempPath, canvas, paths } = this.props;
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
        this.drawPaths(rawPathDiff, this.ctx.main);
        this.drawPaths(rawPathDiff, this.ctx.previewCache, 0.1);
        this.reflectOnPreviewCanvas();
        this.makeOffscreenMainCache();
        this.reflectOnMainCanvas();
      });
    }

    return false;
  }

  drawPaths(paths, targetCtx, scale = 1) {
    const tempCtx = this.ctx.temp;
    for (const { style, data } of paths) {
      tempCtx.save();
      setCtxStyle(tempCtx, style);
      tempCtx.scale(scale, scale);
      drawPathData(tempCtx, data);
      tempCtx.restore();

      // 出力先のキャンバスに反映
      targetCtx.globalCompositeOperation = typeToCompositeOperation(style.type);
      targetCtx.drawImage(tempCtx.canvas, 0, 0);
    }
  }

  // 親から呼ばれる
  drawTempPath = (tempPath) => {
    const { width, height, style } = this.props;

    this.tempPath = tempPath;

    if (tempPath.length > 0) {
      setCtxStyle(this.ctx.my, style);
      drawPathData(this.ctx.my, tempPath);
      this.reflectOnPreviewCanvas();
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
      const target = this.ctx.main.canvas;
      resizeImage(cacheCanvas, mainWidth, mainHeght, target, sx, sy, sw, sh);
    }
  }

  reflectOnPreviewCanvas() {
    const { style, previewCanvas, visibleTempPath } = this.props;
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

    // 自分の引いた線を反映
    if (visibleTempPath) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this.drawPaths([{ style, data: this.tempPath }], ctx, 0.1);
    }
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
        const target = this.ctx.my.canvas;
        const temp = this.ctx.temp.canvas;
        ctx.globalCompositeOperation = typeToCompositeOperation(style.type);
        // TODO resizeImageを使わないように
        resizeImage(mainCanvas, mainWidth, mainHeght, target, sx, sy, sw, sh, temp);
      }
    }
  }

  redraw = () => {
    const { width, height, paths } = this.props;
    const rawPaths = paths.toJS();
    this.ctx.main.clearRect(0, 0, width, height);
    this.drawPaths(rawPaths, this.ctx.main);
    this.ctx.previewCache.clearRect(0, 0, width, height);
    this.drawPaths(rawPaths, this.ctx.previewCache, 0.1);
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

function select(state) {
  const $$canvasStore = state.$$canvasStore;

  return {
    visibleTempPath: $$canvasStore.get('visibleTempPath'),
    style: $$canvasStore.get('style').toJS(),
    paths: $$canvasStore.get('paths'),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(OffscreenCanvas);
