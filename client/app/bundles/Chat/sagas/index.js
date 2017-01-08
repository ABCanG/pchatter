import { fork } from 'redux-saga/effects';

import handleChat from './chatSagas';

export default function* rootSaga() {
  yield fork(handleChat);
}
