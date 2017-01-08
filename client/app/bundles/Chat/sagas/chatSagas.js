import { eventChannel } from 'redux-saga';
import { fork, take, put, call, select } from 'redux-saga/effects';
import io from 'socket.io-client';

import actionTypes from '../constants/chatConstants';
import { successConnectChat, failureConnectChat,
  requestJoinChat, successJoinChat, failureJoinChat,
  addChatLog, setUserList, setLogMessage } from '../actions/chatActionCreators';

const socketIoURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000';

function subscribeSocket(socket, events) {
  return eventChannel((emit) => {
    for (const event of events) {
      socket.on(event, (data) => {
        emit({ event, data });
      });
    }
    return () => {};
  });
}

function* handleSocketEvent(socket) {
  const channel = yield call(subscribeSocket, socket, [
    'connect',
    'join',
    'init',
    'log',
    'users',
    'disconnect',
  ]);
  while (true) {
    const { event, data } = yield take(channel);
    console.log(event, data);
    switch (event) {
      case 'connect': {
        yield put(successConnectChat());
        const { join, pass } = yield select((state) => ({
          join: state.$$chatStore.get('join'),
          pass: state.$$chatStore.get('pass')
        }));
        if (join) {
          yield put(requestJoinChat(pass));
        }
        break;
      }

      case 'join': {
        const { status, message} = data;
        if (status === 'failed') {
          yield put(failureJoinChat(message));
        } else {
          yield put(successJoinChat());
        }
        break;
      }

      case 'init': {
        const { logs, users } = data;
        yield put(addChatLog(logs));
        yield put(setUserList(users));
        break;
      }

      case 'log': {
        const { log } = data;
        yield put(addChatLog([log]));
        break;
      }

      case 'users': {
        const { users } = data;
        yield put(setUserList(users));
        break;
      }

      case 'disconnect': {
        yield put(failureConnectChat());
        break;
      }

      default: {
        break;
      }
    }
  }
}

function* handleRequestJoinChat(socket) {
  while (true) {
    const { payload: { pass } } = yield take(actionTypes.REQUEST_JOIN_CHAT);
    socket.emit('join', { pass });
  }
}

function* handleSendLogMessage(socket) {
  while (true) {
    const { payload: { message } } = yield take(actionTypes.SEND_LOG_MESSAGE);
    if (message) {
      socket.emit('log', { message });
      yield put(setLogMessage(''));
    }
  }
}

function* handleSocketSaga(socket) {
  yield fork(handleRequestJoinChat, socket);
  yield fork(handleSendLogMessage, socket);
  yield fork(handleSocketEvent, socket);
}

function* handleRequestConnectChat() {
  const { payload: { id } } = yield take(actionTypes.REQUEST_CONNECT_CHAT);
  const socket = io.connect(`${socketIoURL}/chat?room=${id}`);
  yield fork(handleSocketSaga, socket);
}

export default function* handleChat() {
  yield fork(handleRequestConnectChat);
}
