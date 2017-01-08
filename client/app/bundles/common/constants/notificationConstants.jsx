// See https://www.npmjs.com/package/mirror-creator
// Allows us to set up constants in a slightly more concise syntax. See:
// client/app/bundles/Manager/actions/managerActionCreators.jsx
import mirrorCreator from 'mirror-creator';

const actionTypes = mirrorCreator([
  'ADD_NOTIFICATION',
  'DISMISS_NOTIFICATION',
]);

export default actionTypes;
