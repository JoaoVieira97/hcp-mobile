import {combineReducers} from 'redux';

import odoo from './odoo';
import user from './user';
import newOrEditTraining from './newOrEditTraining';
import newOrEditGame from './newOrEditGame';


// Combine all reducers off the app
export default combineReducers({
    odoo,
    user,
    newOrEditTraining,
    newOrEditGame
});