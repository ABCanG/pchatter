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

function cssColor(c) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function setCtxStyle(ctx, style) {
  ctx.strokeStyle = cssColor(style.color);
  ctx.lineWidth = style.width;
  ctx.globalAlpha = style.color.a;
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

// パスを描画
function drawPathData(ctx, pathData) {
  const length = pathData.length;

  if (!length) {
    return;
  }

  // 画面クリア
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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

function reflectOnCanvas(dCanvas, sCanvases, sx, sy, sw, sh, backColor = null) {
  const { width, height } = dCanvas;
  const ctx = dCanvas.getContext('2d');

  if (backColor) {
    ctx.fillStyle = backColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  for (const { isDraw, canvas, compositeOperation } of sCanvases) {
    if (isDraw) {
      ctx.globalCompositeOperation = compositeOperation;
      ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, width, height);
    }
  }
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

    this.ctx = offscrenNames.reduce((ctx, name) => {
      ctx[name] = createCtx(width, height);
      return ctx;
    }, {});
  }

  componentDidMount() {
    this.props.setDrawTempPathMethod(this.drawTempPath);
    requestAnimationFrame(this.redraw);
  }

  shouldComponentUpdate(nextProps) {
    const { visibleTempPath, width, height, canvas, paths } = this.props;
    if (width !== nextProps.width ||
      height !== nextProps.height ||
      visibleTempPath !== nextProps.visibleTempPath ||
      !Immutable.is(canvas, nextProps.canvas)
    ) {
      requestAnimationFrame(() => {
        this.reflectOnCanvases();
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
        this.drawPaths(pathDiff);
        this.reflectOnCanvases();
      });
    }

    return false;
  }

  drawPaths(paths) {
    for (const path of paths) {
      const style = path.get('style').toJS();
      setCtxStyle(this.ctx.temp, style);
      drawPathData(this.ctx.temp, path.get('data').toJS());
      // 出力先のキャンバスに反映
      this.ctx.main.globalCompositeOperation = typeToCompositeOperation(style.type);
      this.ctx.main.drawImage(this.ctx.temp.canvas, 0, 0);
    }
  }

  // 親から呼ばれる
  drawTempPath = (tempPath) => {
    const { width, height, style } = this.props;

    if (tempPath.length > 0) {
      setCtxStyle(this.ctx.my, style);
      drawPathData(this.ctx.my, tempPath);
      this.reflectOnCanvases();
    } else {
      this.ctx.my.clearRect(0, 0, width, height);
    }
  }

  // Canvasに反映
  reflectOnCanvases() {
    const { width, height, canvas, style, mainCanvas, previewCanvas, visibleTempPath } = this.props;
    if (!mainCanvas || !previewCanvas) {
      return;
    }

    const sCanvases = [
      {
        canvas: this.ctx.main.canvas,
        compositeOperation: typeToCompositeOperation(),
        isDraw: true
      },
      {
        canvas: this.ctx.my.canvas,
        compositeOperation: typeToCompositeOperation(style.type),
        isDraw: visibleTempPath
      }
    ];

    if (previewCanvas) {
      reflectOnCanvas(previewCanvas, sCanvases, 0, 0, width, height, 'white');
    }

    if (mainCanvas) {
      const scale = canvas.get('scale');
      const sx = canvas.get('left');
      const sy = canvas.get('top');
      const sw = mainCanvas.width / scale;
      const sh = mainCanvas.height / scale;
      reflectOnCanvas(mainCanvas, sCanvases, sx, sy, sw, sh);
    }
  }

  redraw = () => {
    const { width, height, paths } = this.props;

    this.ctx.main.clearRect(0, 0, width, height);
    this.drawPaths(paths);
    this.reflectOnCanvases();
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
