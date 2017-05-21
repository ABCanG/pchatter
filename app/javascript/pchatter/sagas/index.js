import { fork } from 'redux-saga/effects';

import handleSocket from './socketSagas';

export default function* rootSaga() {
  yield fork(handleSocket);
}
