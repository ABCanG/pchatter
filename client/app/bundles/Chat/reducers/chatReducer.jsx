import Immutable from 'immutable';

import actionTypes from '../constants/chatConstants';

export const $$initialState = Immutable.fromJS({
  info: {},
  connect: false,
  join: false,
  joinFailureMessage: '',
  logs: Immutable.Set(),
  users: Immutable.Map(),
  logMessage: '',
  pass: '',
});

export default function chatReducer($$state = $$initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_ROOM_INFO: {
      return $$state.set('info', Immutable.fromJS(payload.room));
    }

    case actionTypes.SET_ROOM_PASS: {
      return $$state.set('pass', payload.pass);
    }

    case actionTypes.SUCCESS_CONNECT_CHAT: {
      return $$state.set('connect', true);
    }

    case actionTypes.FAILURE_CONNECT_CHAT: {
      return $$state.set('connect', false);
    }

    case actionTypes.ADD_CHAT_LOG: {
      const logs = $$state.get('logs');
      return $$state.set('logs', logs.merge(Immutable.fromJS(payload.logs)).sortBy((log) => log.get('id')));
    }

    case actionTypes.SET_USER_LIST: {
      return $$state.set('users', Immutable.fromJS(payload.users).sortBy((user) => user.get('screen_name')));
    }

    case actionTypes.SET_LOG_MESSAGE: {
      return $$state.set('logMessage', payload.message);
    }

    case actionTypes.SUCCESS_JOIN_CHAT: {
      return $$state.withMutations((s) => (
        s.set('join', true)
          .set('joinFailureMessage', '')
      ));
    }

    case actionTypes.FAILURE_JOIN_CHAT: {
      return $$state.withMutations((s) => (
        s.set('join', false)
          .set('joinFailureMessage', payload.message)
      ));
    }

    default: {
      return $$state;
    }
  }
}
