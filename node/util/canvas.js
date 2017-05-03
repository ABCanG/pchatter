const fs = require('fs');
const fsp = require('fs-promise');
const path = require('path');
const temp = require('temp');
const mkdirp = require('mkdirp-promise');
const Canvas = require('canvas');
const { drawPaths, resizeImage } = require('../../client/commonjs/canvas');

const { Image } = Canvas;
const tempWidth = 2000;
const tempHeight = 2000;
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

const generatedDirPath = path.join(__dirname, '../', '../', 'generated');

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

async function getBaseImagePath(filename) {
  return path.join(generatedDirPath, 'base_image', filename);
}

async function existsBaseImage(filename) {
  const filepath = await getBaseImagePath(filename);
  try {
    await fsp.stat(filepath);
    return true;
  } catch (e) {
    return false;
  }
}

async function loadImage(filepath) {
  try {
    const image = new Image();
    image.src = await fsp.readFile(filepath);
    return image;
  } catch (e) {
    // base file not found
  }
  return null;
}

async function makeThumbnail(paths, filename) {
  for (const ctx of [tempCtx, tempCtx2, thumbnailCtx]) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
  tempCtx2.globalCompositeOperation = 'source-over';
  const image = await loadImage(await getBaseImagePath(filename));
  if (image) {
    tempCtx2.drawImage(image, 0, 0);
  }
  drawPaths(paths, tempCtx2, tempCtx);
  tempCtx.globalCompositeOperation = 'source-over';
  tempCtx.fillStyle = 'white';
  tempCtx.fillRect(0, 0, tempWidth, tempHeight);
  tempCtx.drawImage(tempCanvas2, 0, 0);
  tempCtx2.globalCompositeOperation = 'source-over';
  resizeImage(thumbnailCanvas, thumbnailWidth, thumbnailHeight,
     tempCanvas, 0, 0, tempWidth, tempHeight, tempCanvas2);

  const dirpath = path.join(generatedDirPath, 'thumbnail');
  const filepath = path.join(dirpath, filename);
  await mkdirp(dirpath);
  await writePng(thumbnailCanvas, filepath);
}

async function updateBaseImage(paths, filename) {
  const filepath = await getBaseImagePath(filename);
  tempCtx.globalCompositeOperation = 'source-over';
  tempCtx.clearRect(0, 0, tempWidth, tempHeight);
  const image = await loadImage(filepath);
  if (image) {
    tempCtx.drawImage(image, 0, 0);
  }

  drawPaths(paths, tempCtx, tempCtx2);
  await mkdirp(path.dirname(filepath));
  await writePng(tempCanvas, filepath);
}

module.exports = {
  getBaseImagePath,
  existsBaseImage,
  writePng,
  makeThumbnail,
  updateBaseImage,
};
