// USER reducer


const INITIAL_STATE = {
    stepId: 0,
    isStepReady: [],
    allLocals: [],
    allCoaches: [],
    allSecretaries: [],
    allEchelons: [],
    allAthletes: [],
    addSecretaryFlag: undefined,

    startDateTime: "Selecione o horário de ínicio", // start
    endDateTime: "Selecione o horário de fim", // stop
    localId: -1, // local
    echelonId: {}, // escalao
    coaches: [], // treinador
    athletes: [], // atletas
    secretaries: [], // seccionistas
};

// take the previous state and an action, and return the next state
export default function newTrainingReducer (state = INITIAL_STATE, action) {

    switch (action.type) {

        case 'RESET':
            return {
                ...INITIAL_STATE
            };

        case 'SET_STEP':
            return {
                ...state,
                stepId: action.stepId
            };

        case 'ADD_STEP_READY':
            return {
                ...state,
                isStepReady: [...state.isStepReady, false]
            };

        case 'SET_STEP_READY':
            return {
                ...state,
                isStepReady: state.isStepReady.map((item, index) => {
                    if(index === state.stepId)
                        return action.ready;
                    return item;
                })
            };

        case 'INCREASE_STEP':
            return {
                ...state,
                stepId: state.stepId + 1
            };

        case 'DECREASE_STEP':
            return {
                ...state,
                stepId: state.stepId - 1
            };

        case 'SET_ALL_LOCALS':
            return {
                ...state,
                allLocals: action.allLocals
            };

        case 'SET_ALL_COACHES':
            return {
                ...state,
                allCoaches: action.allCoaches
            };

        case 'SET_ALL_SECRETARIES':
            return {
                ...state,
                allSecretaries: action.allSecretaries
            };

        case 'SET_ALL_ECHELONS':
            return {
                ...state,
                allEchelons: action.allEchelons
            };

        case 'SET_ECHELON_IS_FETCHED':
            return {
                ...state,
                allEchelons: state.allEchelons.map(item => {
                    if (item.id === action.echelonId) {
                        let aux = item;
                        aux.fetched = true;
                        return aux;
                    }
                    return item;
                })
            };

        case 'SET_ALL_ATHLETES':
            return {
                ...state,
               allAthletes: [...state.allAthletes, ...action.allAthletes],
            };

        case 'ADD_SECRETARY_FLAG':
            return {
                ...state,
                addSecretaryFlag: action.flag
            };




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

        case 'SET_LOCAL_ID':
            return {
                ...state,
                localId: action.localId
            };

        case 'ADD_COACH':
            return {
                ...state,
                allCoaches: state.allCoaches.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                coaches: (action.id !== -1) ? [...state.coaches, action.id] : state.coaches
            };

        case 'REMOVE_COACH':
            return {
                ...state,
                allCoaches: state.allCoaches.map(item => {
                    if (item.id === action.id)
                        item.visible = true;

                    return item;
                }),
                coaches: state.coaches.filter(item => item !== action.id)
            };

        case 'ADD_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                secretaries: (action.id !== -1) ? [action.id, ...state.secretaries] : state.secretaries
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

        case 'SET_ECHELON_ID':
            return {
                ...state,
                echelonId: action.echelonId
            };

        case 'ADD_ATHLETES':
            return {
                ...state,
                athletes: action.athletes
            };

        case 'ADD_ATHLETE':
            return {
                ...state,
                athletes: [...state.athletes, action.athleteId]
            };

        case 'REMOVE_ATHLETE':
            return {
                ...state,
                athletes: state.athletes.filter(item => item !== action.athleteId)
            };


        default:
            return state;
    }
}
