import actionTypes from '../constants/canvasConstants';

export function clearTempPath() {
  return {
    type: actionTypes.CLEAR_TEMP_PATH
  };
}

export function initTempPath(path) {
  return {
    type: actionTypes.INIT_TEMP_PATH,
    payload: { path }
  };
}

export function addTempPath(path) {
  return {
    type: actionTypes.ADD_TEMP_PATH,
    payload: { path }
  };
}

export function sendTempPath() {
  return {
    type: actionTypes.SEND_TEMP_PATH
  };
}

export function addPathToCanvas(paths) {
  return {
    type: actionTypes.ADD_PATH_TO_CANVAS,
    payload: { paths }
  };
}

export function setStyleColor(color) {
  return {
    type: actionTypes.SET_STYLE_COLOR,
    payload: { color }
  };
}

export function setStyleWidth(width) {
  return {
    type: actionTypes.SET_STYLE_WIDTH,
    payload: { width }
  };
}

export function setStyleType(type) {
  return {
    type: actionTypes.SET_STYLE_TYPE,
    payload: { type }
  };
}

export function setCanvasScale(scale) {
  return {
    type: actionTypes.SET_CANVAS_SCALE,
    payload: { scale }
  };
}

export function setCanvasTop(top) {
  return {
    type: actionTypes.SET_CANVAS_TOP,
    payload: { top }
  };
}

export function setCanvasLeft(left) {
  return {
    type: actionTypes.SET_CANVAS_LEFT,
    payload: { left }
  };
}
