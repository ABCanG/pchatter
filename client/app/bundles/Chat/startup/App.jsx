import React from 'react';
import ReactOnRails from 'react-on-rails';
import { Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';

import createStore from '../store';
import ChatWidget from '../containers/ChatWidget';

injectTapEventPlugin();

const ChatApp = (props, _railsContext) => {
  const store = createStore(props);
  const reactComponent = (
    <Provider store={store}>
      <ChatWidget {...props} />
    </Provider>
  );
  return reactComponent;
};

ReactOnRails.register({ ChatApp });
