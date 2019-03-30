// OPENED TRAININGS  reducer

const INITIAL_STATE = {
    trainingsList: []
};


// take the previous state and an action, and return the next state
export default function openedTrainingsReducer (state = INITIAL_STATE, action) {

    switch (action.type) {
        case 'SET_TRAININGS':

            return {
                ...state,
                trainingsList: action.trainingsList
            };

        case 'ADD_TRAININGS':

            return {
                ...state,
                trainingsList: [...state.trainingsList, ...action.trainingsList]
            };

        case 'CLEAR_TRAININGS':

            return {
                ...state,
                trainingsList: action.trainingsList
            };

        case 'REMOVE_TRAINING':

            return {
                ...state,
                trainingsList: state.trainingsList.filter(item => item.id !== action.id)
            };

        default:
            return state;
    }
}
