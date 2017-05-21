import { compose, createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducers, { initialStores } from '../reducers';
import sagas from '../sagas';

export default () => {
  const sagaMiddleware = createSagaMiddleware();
  const reducer = combineReducers(reducers);
  const composedStore = compose(
    applyMiddleware(sagaMiddleware)
  );
  const storeCreator = composedStore(createStore);
  const store = storeCreator(reducer, initialStores);

  sagaMiddleware.run(sagas);
  return store;
};
