import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'REQUEST_CONNECT_CHAT',
  'REQUEST_DISCONNECT_CHAT',
  'SUCCESS_CONNECT_CHAT',
  'FAILURE_CONNECT_CHAT',

  'REQUEST_JOIN_CHAT',
  'SUCCESS_JOIN_CHAT',
  'FAILURE_JOIN_CHAT',

  'ADD_CHAT_LOG',
  'SET_USER_LIST',
  'SET_ROOM_INFO',
  'SET_ROOM_PASS',
  'SET_CURRENT_USER_ID',

  'SET_LOG_MESSAGE',
  'SEND_LOG_MESSAGE',
]);

export default actionTypes;
