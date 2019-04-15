import {combineReducers} from 'redux';

import odoo from './odoo';
import user from './user';
import openedTrainings from './openedTrainings';
import newTraining from './newTraining';


// Combine all reducers off the app
export default combineReducers({
    odoo,
    user,
    openedTrainings,
    newTraining
});