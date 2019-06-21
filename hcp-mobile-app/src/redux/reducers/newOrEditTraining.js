const INITIAL_STATE = {

    // all information
    allLocals: [],
    allCoaches: [],
    allSecretaries: [],
    allEchelons: [],
    allAthletes: {},

    // game raw information
    rawStartTime: "Selecione o horário de início...",
    rawEndTime: "Selecione o horário de fim...",
    rawLocalID: undefined,
    rawEchelonID: undefined,
    rawCoachesIDs: [],
    rawSecretariesIDs: [],
    rawAthletesIDs: [],
};


export default function newOrEditTrainingReducer (state = INITIAL_STATE, action) {

    switch (action.type) {

        case 'TRAINING_RESET':
            return {
                ...INITIAL_STATE
            };

        case 'TRAINING_SET_ALL_INFORMATION':
            return {
                ...state,
                allLocals: action.allLocals,
                allCoaches: action.allCoaches,
                allSecretaries: action.allSecretaries,
                allEchelons: action.allEchelons,
                allAthletes: action.allAthletes,
            };

        case 'TRAINING_SET_LOCAL':
            return {
                ...state,
                rawLocalID: action.id
            };

        case 'TRAINING_SET_START_TIME':
            return {
                ...state,
                rawStartTime: action.startTime
            };

        case 'TRAINING_SET_END_TIME':
            return {
                ...state,
                rawEndTime: action.endTime
            };

        case 'TRAINING_SET_ALL_COACHES':
            return {
                ...state,
                allCoaches: action.allCoaches
            };

        case 'TRAINING_ADD_COACH':
            return {
                ...state,
                allCoaches: state.allCoaches.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                rawCoachesIDs: [...state.rawCoachesIDs, action.id]
            };

        case 'TRAINING_REMOVE_COACH':
            return {
                ...state,
                allCoaches: state.allCoaches.map(item => {
                    if (item.id === action.id)
                        item.visible = true;

                    return item;
                }),
                rawCoachesIDs: state.rawCoachesIDs.filter(item => item !== action.id)
            };

        case 'TRAINING_SET_ALL_SECRETARIES':
            return {
                ...state,
                allSecretaries: action.allSecretaries
            };

        case 'TRAINING_ADD_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                rawSecretariesIDs: [...state.rawSecretariesIDs, action.id]
            };

        case 'TRAINING_REMOVE_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = true;

                    return item;
                }),
                rawSecretariesIDs: state.rawSecretariesIDs.filter(item => item !== action.id)
            };

        case 'TRAINING_SET_ECHELON':
            return {
                ...state,
                rawEchelonID: action.id
            };

        case 'TRAINING_SET_ATHLETES':
            return {
                ...state,
                rawAthletesIDs: action.ids
            };

        case 'TRAINING_ADD_ATHLETE':
            return {
                ...state,
                rawAthletesIDs: [...state.rawAthletesIDs, action.id]
            };

        case 'TRAINING_REMOVE_ATHLETE':
            return {
                ...state,
                rawAthletesIDs: state.rawAthletesIDs.filter(item => item !== action.id)
            };

        default:
            return state;
    }
}