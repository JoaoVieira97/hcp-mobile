import {createStore} from 'redux';
import rootReducer from '../reducers/index';



// Where data will be stored!
const store = createStore(rootReducer);

export default store;
