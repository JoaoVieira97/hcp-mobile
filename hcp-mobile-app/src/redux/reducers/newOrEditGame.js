const INITIAL_STATE = {

    // step information
    stepID: 0,
    totalSteps: 5,
    readySteps: [false, false, false, false, false],

    // all information
    allLocals: [],
    allCoaches: [],
    allSecretaries: [],
    allEchelons: [],
    allAthletes: [],
    allTeams: [],
    allCompetitions: [],
    allSeasons: [],

    // game raw information
    rawStartTime: '',
    rawEndTime: '',
    rawHoursNotice: 0, // horas de antecedencia
    rawLocalID: undefined,
    rawHomeAdvantage: false, // em casa ou fora
    rawEchelonID: undefined,
    rawOpponentID: undefined,
    rawCoachesIDs: [],
    rawSecretariesIDs: [],
    rawAthletesIDs: [],

    // game temp information
    tempStartTime: '',
    tempEndTime: '',
};


export default function newOrEditGameReducer (state = INITIAL_STATE, action) {

    switch (action.type) {

        case 'GAME_RESET':
            return {
                ...INITIAL_STATE
            };

        case 'GAME_SET_STEP_ID':
            return {
                ...state,
                stepID: action.stepID
            };

        case 'GAME_SET_STEP_READY':
            return {
                ...state,
                readySteps: state.readySteps.map((item, index) => {
                    if(index === state.stepID)
                        return action.ready;
                    return item;
                })
            };

        case 'GAME_INCREASE_STEP':
            return {
                ...state,
                stepID: state.stepID + 1
            };

        case 'GAME_DECREASE_STEP':
            return {
                ...state,
                stepID: state.stepID - 1
            };

        case 'GAME_SET_ALL_INFORMATION':
            return {
                ...state,
                allLocals: action.allLocals,
                allCoaches: action.allCoaches,
                allSecretaries: action.allSecretaries,
                allEchelons: action.allEchelons,
                allAthletes: action.allAthletes,
                allTeams: action.allTeams,
                allCompetitions: action.allCompetitions,
                allSeasons: action.allSeasons,
            };

        default:
            return state;
    }
}