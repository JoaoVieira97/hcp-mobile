// USER reducer


const INITIAL_STATE = {
    id: {},
    name: {},
    image: {},
    groups: [],
    partner_id: {}
};

// take the previous state and an action, and return the next state
export default function userReducer (state = INITIAL_STATE, action) {

    switch (action.type) {
        case 'SET_USER_DATA':
            return {
                ...state,
                id: parseInt(action.id),
                name: action.name
            };

        case 'SET_USER_IMAGE':
            return {
                ...state,
                image: action.image
            };

        case 'SET_USER_GROUPS':
            return {
                ...state,
                groups: action.groups
            };

        case 'SET_USER_PARTNER_ID':
            return {
                ...state,
                partner_id: action.partner_id
            };

        default:
            return state;
    }
}
