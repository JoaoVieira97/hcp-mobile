import {combineReducers} from 'redux';

import odoo from './odoo';
import user from './user';
import openedTrainings from './openedTrainings';


// Combine all reducers off the app
export default combineReducers({
    odoo,
    user,
    openedTrainings
});