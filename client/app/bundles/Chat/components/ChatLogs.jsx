import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

const ChatLogs = (props) => {
  const { logs } = props;
  return (
    <div className="chat-logs">
      <ul>
        {logs.map((log) =>
          <li key={log.get('num')}>
            <b>{log.get('userName')}</b>
            <span>: {log.get('message')}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

ChatLogs.propTypes = {
  logs: ImmutablePropTypes.set.isRequired,
};

export default ChatLogs;
