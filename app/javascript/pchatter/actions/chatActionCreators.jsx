import actionTypes from '../constants/chatConstants';

export function requestConnectChat(id) {
  return {
    type: actionTypes.REQUEST_CONNECT_CHAT,
    payload: { id }
  };
}

export function requestDisconnectChat() {
  return {
    type: actionTypes.REQUEST_DISCONNECT_CHAT,
  };
}

export function successConnectChat() {
  return {
    type: actionTypes.SUCCESS_CONNECT_CHAT
  };
}

export function failureConnectChat(error) {
  return {
    type: actionTypes.FAILURE_CONNECT_CHAT,
    payload: { error }
  };
}

export function requestJoinChat(pass = '') {
  return {
    type: actionTypes.REQUEST_JOIN_CHAT,
    payload: { pass }
  };
}

export function successJoinChat() {
  return {
    type: actionTypes.SUCCESS_JOIN_CHAT
  };
}

export function failureJoinChat(error) {
  return {
    type: actionTypes.FAILURE_JOIN_CHAT,
    payload: { error }
  };
}

export function addChatLog(logs) {
  return {
    type: actionTypes.ADD_CHAT_LOG,
    payload: { logs }
  };
}

export function setRoomInfo(room) {
  return {
    type: actionTypes.SET_ROOM_INFO,
    payload: { room }
  };
}

export function setCurrentUserId(currentUserId) {
  return {
    type: actionTypes.SET_CURRENT_USER_ID,
    payload: { currentUserId }
  };
}

export function setUserList(users) {
  return {
    type: actionTypes.SET_USER_LIST,
    payload: { users }
  };
}

export function setLogMessage(message) {
  return {
    type: actionTypes.SET_LOG_MESSAGE,
    payload: { message }
  };
}

export function setRoomPass(pass) {
  return {
    type: actionTypes.SET_ROOM_PASS,
    payload: { pass }
  };
}

export function sendLogMessage(message) {
  return {
    type: actionTypes.SEND_LOG_MESSAGE,
    payload: { message }
  };
}
