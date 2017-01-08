import chatReducer, { $$initialState as $$chatState } from './chatReducer';

export default {
  $$chatStore: chatReducer,
};

export const initialStates = {
  $$chatState,
};

export const initialStores = {
  $$chatStore: $$chatState,
};
