// USER reducer


const INITIAL_STATE = {
    id: {},
    name: {},
    image: {},
    roles: [],
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

        case 'SET_USER_ROLES':
            return {
                ...state,
                roles: action.groups
            };

        default:
            return state;
    }
}
