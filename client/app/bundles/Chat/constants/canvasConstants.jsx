import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'CLEAR_TEMP_PATH',
  'INIT_TEMP_PATH',
  'ADD_TEMP_PATH',
  'SEND_TEMP_PATH',
  'ADD_PATH_TO_CANVAS',
  'SET_STYLE_COLOR',
  'SET_STYLE_WIDTH',
  'SET_STYLE_TYPE',
  'SET_CANVAS_SCALE',
  'SET_CANVAS_TOP',
  'SET_CANVAS_LEFT',
  'SET_CANVAS_IMAGE',
]);

export default actionTypes;
