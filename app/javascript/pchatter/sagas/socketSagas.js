import { eventChannel } from 'redux-saga';
import { fork, take, put, call, select } from 'redux-saga/effects';
import io from 'socket.io-client';

import chatActionTypes from '../constants/chatConstants';
import canvasActionTypes from '../constants/canvasConstants';
import {
  successConnectChat, failureConnectChat,
  requestJoinChat, successJoinChat, failureJoinChat,
  addChatLog, setUserList, setLogMessage
} from '../actions/chatActionCreators';
import { setVisibleTempPath, addPathToCanvas, initCanvas } from '../actions/canvasActionCreators';
import { loadImage } from '../utils';

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
    'path',
    'users',
    'disconnect',
  ]);

  for (;;) {
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
        const { logs, paths, users, baseImageNum } = data;
        if (baseImageNum) {
          const baseImageUrl = yield select((state) => state.$$chatStore.getIn(['info', 'baseImageUrl']));
          const img = yield call(loadImage, `${baseImageUrl}?${baseImageNum}`);
          yield put(initCanvas(paths, img));
        } else {
          yield put(initCanvas(paths));
        }
        yield put(addChatLog(logs));
        yield put(setUserList(users));
        break;
      }

      case 'log': {
        const { log } = data;
        yield put(addChatLog([log]));
        break;
      }

      case 'path': {
        const { path } = data;
        yield put(addPathToCanvas([path]));
        const currentUserId = yield select((state) => state.$$chatStore.get('currentUserId'));
        if (path.userId === currentUserId) {
          yield put(setVisibleTempPath(false));
        }
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
  for (;;) {
    const { payload: { pass } } = yield take(chatActionTypes.REQUEST_JOIN_CHAT);
    socket.emit('join', { pass });
  }
}

function* handleSendLogMessage(socket) {
  for (;;) {
    const { payload: { message } } = yield take(chatActionTypes.SEND_LOG_MESSAGE);
    if (message) {
      socket.emit('log', { message });
      yield put(setLogMessage(''));
    }
  }
}

function* handleSendPath(socket) {
  for (;;) {
    const { payload: { tempPath } } = yield take(canvasActionTypes.SEND_TEMP_PATH);
    const path = {
      data: tempPath,
      style: yield select((state) => state.$$canvasStore.get('style').toJS()),
    };

    socket.emit('path', { path });
  }
}

function* handleRequestConnectChat() {
  for (;;) {
    const { payload: { id } } = yield take(chatActionTypes.REQUEST_CONNECT_CHAT);
    const socket = io.connect(`${socketIoURL}/chat?room=${id}`);
    const tasks = [
      yield fork(handleRequestJoinChat, socket),
      yield fork(handleSendLogMessage, socket),
      yield fork(handleSendPath, socket),
      yield fork(handleSocketEvent, socket),
    ];
    yield take(chatActionTypes.REQUEST_DISCONNECT_CHAT);
    for (const task of tasks) {
      task.cancel();
    }
    socket.disconnect();
  }
}

export default function* handleChat() {
  yield fork(handleRequestConnectChat);
}
