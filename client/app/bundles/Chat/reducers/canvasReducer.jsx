import Immutable from 'immutable';

import actionTypes from '../constants/canvasConstants';

export const $$initialState = Immutable.fromJS({
  visibleTempPath: false,
  paths: Immutable.Set(),
  style: {
    color: {
      r: 208,
      g: 2,
      b: 27,
      a: 1,
    },
    width: 5,
    type: 'source-over',
  },
  canvas: {
    scale: 1,
    top: 0,
    left: 0,
  }
});

export default function canvasReducer($$state = $$initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_VISIBLE_TEMP_PATH: {
      return $$state.set('visibleTempPath', payload.flag);
    }

    case actionTypes.ADD_PATH_TO_CANVAS: {
      return $$state.update('paths', (paths) => paths.merge(Immutable.fromJS(payload.paths)).sortBy((path) => path.get('id')));
    }

    case actionTypes.SET_STYLE_COLOR: {
      return $$state.update('style', (style) => style.set('color', Immutable.fromJS(payload.color)));
    }

    case actionTypes.SET_STYLE_WIDTH: {
      return $$state.update('style', (style) => style.set('width', payload.width));
    }

    case actionTypes.SET_STYLE_TYPE: {
      return $$state.update('style', (style) => style.set('type', payload.type));
    }

    case actionTypes.SET_CANVAS_SCALE: {
      return $$state.update('canvas', (canvas) => canvas.set('scale', payload.scale));
    }

    case actionTypes.SET_CANVAS_TOP: {
      return $$state.update('canvas', (canvas) => canvas.set('top', payload.top));
    }

    case actionTypes.SET_CANVAS_LEFT: {
      return $$state.update('canvas', (canvas) => canvas.set('left', payload.left));
    }

    default: {
      return $$state;
    }
  }
}
