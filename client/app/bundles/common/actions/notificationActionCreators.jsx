import actionTypes from '../constants/notificationConstants';

export function addNotification(payload) {
  return {
    type: actionTypes.ADD_NOTIFICATION,
    payload
  };
}

export function dismissNotification(payload) {
  return {
    type: actionTypes.DISMISS_NOTIFICATION,
    payload
  };
}
