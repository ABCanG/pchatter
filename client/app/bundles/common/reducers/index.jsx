// This file is our manifest of all reducers for the app.
// See also /client/app/bundles/Manager/store/managerStore.jsx
// A real world app will likely have many reducers and it helps to organize them in one file.
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import notificationReducer, { $$initialState as $$notificationState } from './notificationReducer';

export default {
  routing: routerReducer,
  form: formReducer,
  $$notificationStore: notificationReducer,
};

export const initialStates = {
  $$notificationState,
};

export const initialStores = {
  $$notificationStore: $$notificationState,
};
