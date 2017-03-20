import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'SET_VISIBLE_TEMP_PATH',
  'SEND_TEMP_PATH',
  'ADD_PATH_TO_CANVAS',
  'SET_STYLE_COLOR',
  'SET_STYLE_WIDTH',
  'SET_STYLE_TYPE',
  'SET_CANVAS_SCALE',
  'SET_CANVAS_TOP',
  'SET_CANVAS_LEFT',
]);

export default actionTypes;
