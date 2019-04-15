// USER reducer


const INITIAL_STATE = {
    stepId: 0,
    startDateTime: "Selecione o horário de ínicio", // start
    endDateTime: "Selecione o horário de fim", // stop
    localId: -1, // local
    allLocals: [],
    degreeId: {}, // escalao
    coachId: {}, // treinador
    athletes: [], // atletas - array
    secretaries: [], // seccionistas - array,
    allSecretaries: [],
};

// take the previous state and an action, and return the next state
export default function newTrainingReducer (state = INITIAL_STATE, action) {

    switch (action.type) {

        case 'SET_START_DATE_TIME':
            return {
                ...state,
                startDateTime: action.startDateTime
            };

        case 'SET_END_DATE_TIME':
            return {
                ...state,
                endDateTime: action.endDateTime
            };

        case 'SET_ALL_LOCALS':
            return {
                ...state,
                allLocals: action.allLocals
            };

        case 'SET_LOCAL_ID':
            return {
                ...state,
                localId: action.localId
            };

        case 'SET_ALL_SECRETARIES':
            return {
                ...state,
                allSecretaries: action.allSecretaries
            };

        case 'ADD_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                secretaries: (action.id !== -1) ? [...state.secretaries, action.id] : state.secretaries
            };

        case 'REMOVE_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = true;

                    return item;
                }),
                secretaries: state.secretaries.filter(item => item !== action.id)
            };

        case 'SET_FIRST_STEP':
            return {
                ...state,
                stepId: 0,
                startDateTime: action.startDateTime,
                endDateTime: action.endDateTime,
                localId: action.localId
            };

        case 'SET_SECOND_STEP':
            return {
                ...state,
                stepId: 1,
                coachId: action.coachId,
                secretaries: action.secretaries,
            };

        case 'SET_THIRD_STEP':
            return {
                ...state,
                stepId: 2,
                athletes: action.athletes,
            };



        default:
            return state;
    }
}
