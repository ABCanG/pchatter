import chatReducer, { $$initialState as $$chatState } from './chatReducer';
import canvasReducer, { $$initialState as $$canvasState } from './canvasReducer';

export default {
  $$chatStore: chatReducer,
  $$canvasStore: canvasReducer,
};

export const initialStates = {
  $$chatState,
  $$canvasState,
};

export const initialStores = {
  $$chatStore: $$chatState,
  $$canvasStore: $$canvasState,
};
