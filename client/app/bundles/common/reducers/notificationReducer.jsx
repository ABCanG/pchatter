import Immutable from 'immutable';

import actionTypes from '../constants/notificationConstants';

export const $$initialState = Immutable.fromJS([]);

export default function apiReducer($$state = $$initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.ADD_NOTIFICATION:
      console.log(payload);
      console.log($$state);
      return $$state.push(payload);

    case actionTypes.DISMISS_NOTIFICATION:
      return $$state.delete(payload);

    default:
      return $$state;
  }
}
