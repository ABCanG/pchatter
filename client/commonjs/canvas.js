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

function drawPaths(paths, targetCtx, tempCtx, scale = 1) {
  for (const { style, data } of paths) {
    // node-canvasではcopyが効かないので対処
    if (tempCtx.globalCompositeOperation !== 'copy') {
      const { width, height } = tempCtx.canvas;
      tempCtx.clearRect(0, 0, width, height);
    }
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

module.exports = {
  setCtxStyle,
  getMidPoint,
  typeToCompositeOperation,
  getMainCanvasTrimInfo,
  drawPathData,
  drawPaths,
  resizeImage,
};
