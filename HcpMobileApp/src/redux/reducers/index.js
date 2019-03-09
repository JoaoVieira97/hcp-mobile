import {combineReducers} from 'redux';

import odoo from './odoo';
import user from './user';


// Combine all reducers off the app
export default combineReducers({
    odoo,
    user
});