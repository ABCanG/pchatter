import React, { PropTypes } from 'react';
import Immutable from 'immutable';

const ChatLogs = (props) => {
  const { logs } = props;
  return (
    <div className="chat-logs">
      <ul>
        {logs.map((log) =>
          <li key={log.get('id')}>
            <b>{log.get('userName')}</b>
            <span>: {log.get('message')}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

ChatLogs.propTypes = {
  logs: PropTypes.instanceOf(Immutable.Set).isRequired,
};

export default ChatLogs;