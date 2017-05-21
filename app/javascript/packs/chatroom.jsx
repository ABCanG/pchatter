import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import domready from 'domready';

import createStore from '../pchatter/store';
import ChatWidget from '../pchatter/containers/ChatWidget';

const ChatApp = (props) => {
  const store = createStore(props);
  const reactComponent = (
    <Provider store={store}>
      <ChatWidget {...props} />
    </Provider>
  );
  return reactComponent;
};

let lastMountNode = null;

function render() {
  const mountNode = document.getElementById('chatroom');
  if (mountNode) {
    const props = JSON.parse(mountNode.getAttribute('data-props'));
    ReactDOM.render(<ChatApp {...props} />, mountNode);
    lastMountNode = mountNode;
  } else if (lastMountNode) {
    ReactDOM.unmountComponentAtNode(lastMountNode);
    lastMountNode = null;
  }
}

domready(() => {
  document.addEventListener('turbolinks:load', render);
  render();
});
