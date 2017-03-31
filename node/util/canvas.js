const fs = require('fs');
const path = require('path');
const temp = require('temp');
const mkdirp = require('mkdirp-promise');
const Canvas = require('canvas');
const { drawPaths, resizeImage } = require('../../client/commonjs/canvas');

const tempWidth = 1000;
const tempHeight = 1000;
const thumbnailWidth = 200;
const thumbnailHeight = 200;

const tempCanvas = new Canvas(tempWidth, tempHeight);
const tempCanvas2 = new Canvas(tempWidth, tempHeight);
const thumbnailCanvas = new Canvas(thumbnailWidth, thumbnailHeight);
const tempCtx = tempCanvas.getContext('2d');
const tempCtx2 = tempCanvas2.getContext('2d');
const thumbnailCtx = thumbnailCanvas.getContext('2d');

tempCtx.lineCap = 'round';
tempCtx.lineJoin = 'round';

function writePng(canvas, filepath) {
  return new Promise((resolve, reject) => {
    const tempName = temp.path({ prefix: path.basename(filepath)});
    const out = fs.createWriteStream(tempName);
    const stream = canvas.pngStream();

    stream.on('data', (chunk) => {
      out.write(chunk);
    });

    stream.on('end', () => {
      fs.rename(tempName, filepath, () => {
        resolve();
      });
    });
  });
}

async function makeThumbnail(paths, filename) {
  for (const ctx of [tempCtx, tempCtx2, thumbnailCtx]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  drawPaths(paths, tempCtx2, tempCtx, 0.5);
  tempCtx.fillStyle = 'white';
  tempCtx.fillRect(0, 0, tempWidth, tempHeight);
  tempCtx.drawImage(tempCanvas2, 0, 0);
  tempCtx2.globalCompositeOperation = 'source-over';
  resizeImage(thumbnailCanvas, thumbnailWidth, thumbnailHeight,
     tempCanvas, 0, 0, tempWidth, tempHeight, tempCanvas2);

  const dirpath = path.join(__dirname, '../', '../', 'generated', 'thumbnail');
  const filepath = path.join(dirpath, filename);
  await mkdirp(dirpath);
  writePng(thumbnailCanvas, filepath);
}

module.exports = {
  writePng,
  makeThumbnail,
};
