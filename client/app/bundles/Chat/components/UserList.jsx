import React, { PropTypes } from 'react';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Immutable from 'immutable';


function renderPopoverUserList(users) {
  return (
    <Popover id="user-list-popup" title="ユーザ一覧">
      {(() => {
        if (users.size === 0) {
          return (<span>なし</span>);
        }

        return (
          <ul>
            {users.valueSeq().map((user) =>
              <li key={user.get('id')}>
                <img src={user.get('iconUrl')} alt={user.get('name')} />
                {user.get('name')}
              </li>
            )}
          </ul>
        );
      })()}
    </Popover>
  );
}

const UserList = (props) => {
  const { users } = props;
  return (
    <div className="user-list">
      <OverlayTrigger placement="left" overlay={renderPopoverUserList(users)}>
        <span>ユーザ({users.size}人){false /* TODO */ && '| 閲覧(hoge人)'}</span>
      </OverlayTrigger>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.instanceOf(Immutable.Map).isRequired,
};

export default UserList;
