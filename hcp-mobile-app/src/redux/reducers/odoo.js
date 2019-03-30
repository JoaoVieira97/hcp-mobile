// ODOO reducer

const INITIAL_STATE = {
    odoo: {},
};


// take the previous state and an action, and return the next state
export default function odooReducer (state = INITIAL_STATE, action) {

    switch (action.type) {
        case 'SET_ODOO_CONNECTION_INSTANCE':

            return {
                ...state,
                odoo: action.odoo
            };

        default:
            return state;
    }
}
