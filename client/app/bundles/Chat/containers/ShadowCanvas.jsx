import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

function cssColor(c) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function setCtxStyle(ctx, style) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
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


class ShadowCanvas extends React.Component {
  static propTypes = {
    visibleTempPath: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    paths: PropTypes.instanceOf(Immutable.Set).isRequired,
    style: PropTypes.instanceOf(Immutable.Map).isRequired,
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
    if (!this.isDrawable()) {
      return;
    }

    for (const path of paths) {
      const style = path.get('style').toJS();
      setCtxStyle(this.tempCtx, style);
      drawPathData(this.tempCtx, path.get('data').toJS());
      // 出力先のキャンバスに反映
      this.shadowCtx.globalCompositeOperation = typeToCompositeOperation(style.type);
      this.shadowCtx.drawImage(this.tempCtx.canvas, 0, 0);
    }
  }

  // 親から呼ばれる
  drawTempPath = (tempPath) => {
    if (!this.isDrawable()) {
      return;
    }

    const { width, height, style } = this.props;

    if (tempPath.length > 0) {
      setCtxStyle(this.myCtx, style.toJS());
      drawPathData(this.myCtx, tempPath);
      this.reflectOnCanvases();
    } else {
      this.myCtx.clearRect(0, 0, width, height);
    }
  }

  isDrawable() {
    return this.tempCtx && this.shadowCtx && this.myCtx;
  }

  // Canvasに反映
  reflectOnCanvases() {
    const { width, height, canvas, style, mainCanvas, previewCanvas, visibleTempPath } = this.props;
    if (!mainCanvas || !previewCanvas || !this.isDrawable()) {
      return;
    }

    const sCanvases = [
      {
        canvas: this.shadowCtx.canvas,
        compositeOperation: typeToCompositeOperation(),
        isDraw: true
      },
      {
        canvas: this.myCtx.canvas,
        compositeOperation: typeToCompositeOperation(style.get('type')),
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
    if (!this.isDrawable()) {
      return;
    }

    this.shadowCtx.clearRect(0, 0, width, height);
    this.drawPaths(paths);
    this.reflectOnCanvases();
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

    return (
      <div className="shadow-canvas">
        <canvas id="tempCanvas" width={width} height={height} ref={this.refCanvasCtx('temp')} />
        <canvas id="shadowCanvas" width={width} height={height} ref={this.refCanvasCtx('shadow')} />
        <canvas id="myCanvas" width={width} height={height} ref={this.refCanvasCtx('my')} />
      </div>
    );
  }
}

function select(state) {
  const $$canvasStore = state.$$canvasStore;

  return {
    visibleTempPath: $$canvasStore.get('visibleTempPath'),
    style: $$canvasStore.get('style'),
    paths: $$canvasStore.get('paths'),
    canvas: $$canvasStore.get('canvas'),
  };
}

export default connect(select)(ShadowCanvas);
