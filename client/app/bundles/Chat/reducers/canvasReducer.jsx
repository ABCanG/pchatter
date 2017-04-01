import Immutable from 'immutable';

import actionTypes from '../constants/canvasConstants';

export const $$initialState = Immutable.fromJS({
  visibleTempPath: false,
  paths: Immutable.Set(),
  baseImage: null,
  style: {
    color: {
      r: 208,
      g: 2,
      b: 27,
      a: 1,
    },
    width: 5,
    type: 'pencil',
  },
  canvas: {
    scale: 0.5,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  }
});

export default function canvasReducer($$state = $$initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_VISIBLE_TEMP_PATH: {
      return $$state.set('visibleTempPath', payload.flag);
    }
    case actionTypes.INIT_CANVAS: {
      return $$state.withMutations((s) => (
        s.set('paths', Immutable.Set().merge(Immutable.fromJS(payload.paths)).sortBy((path) => path.get('num')))
          .set('baseImage', payload.image)
      ));
    }

    case actionTypes.ADD_PATH_TO_CANVAS: {
      return $$state.update('paths', (paths) => paths.merge(Immutable.fromJS(payload.paths)).sortBy((path) => path.get('num')));
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

    case actionTypes.SET_CANVAS_INFO: {
      return $$state.update('canvas', (canvas) => canvas.merge(Immutable.fromJS(payload.canvas)));
    }

    case actionTypes.SET_BASE_IMAGE: {
      return $$state.set('baseImage', payload.image);
    }

    default: {
      return $$state;
    }
  }
}
