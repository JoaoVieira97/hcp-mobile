const INITIAL_STATE = {

    // all information
    allLocals: [],
    allCoaches: [],
    allSecretaries: [],
    allEchelons: [],
    allAthletes: {},
    allTeams: [],
    allCompetitions: [],
    allSeasons: [],

    // game raw information
    rawStartTime: "Selecione o horário de início...",
    rawEndTime: "Selecione o horário de fim...",
    rawHoursNotice: 1.5, // horas de antecedencia
    rawLocalID: undefined,
    rawHomeAdvantage: 's', // em casa ou fora
    rawEchelonID: undefined,
    rawOpponentID: undefined,
    rawCompetitionID: undefined,
    rawSeasonID: undefined,
    rawCoachesIDs: [],
    rawSecretariesIDs: [],
    rawAthletesIDs: [],
};


export default function newOrEditGameReducer (state = INITIAL_STATE, action) {

    switch (action.type) {

        case 'GAME_RESET':
            return {
                ...INITIAL_STATE
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

        case 'GAME_SET_COMPETITION':
            return {
                ...state,
                rawCompetitionID: action.id
            };

        case 'GAME_SET_SEASON':
            return {
                ...state,
                rawSeasonID: action.id
            };

        case 'GAME_SET_OPPONENT':
            return {
                ...state,
                rawOpponentID: action.id
            };

        case 'GAME_SET_HOME':
            return {
                ...state,
                rawHomeAdvantage: action.value
            };

        case 'GAME_SET_LOCAL':
            return {
                ...state,
                rawLocalID: action.id
            };

        case 'GAME_SET_HOURS_NOTICE':
            return {
                ...state,
                rawHoursNotice: action.hours
            };

        case 'GAME_SET_START_TIME':
            return {
                ...state,
                rawStartTime: action.startTime
            };

        case 'GAME_SET_END_TIME':
            return {
                ...state,
                rawEndTime: action.endTime
            };

        case 'GAME_SET_ALL_COACHES':
            return {
                ...state,
                allCoaches: action.allCoaches
            };

        case 'GAME_ADD_COACH':
            return {
                ...state,
                allCoaches: state.allCoaches.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                rawCoachesIDs: [...state.rawCoachesIDs, action.id]
            };

        case 'GAME_REMOVE_COACH':
            return {
                ...state,
                allCoaches: state.allCoaches.map(item => {
                    if (item.id === action.id)
                        item.visible = true;

                    return item;
                }),
                rawCoachesIDs: state.rawCoachesIDs.filter(item => item !== action.id)
            };

        case 'GAME_SET_ALL_SECRETARIES':
            return {
                ...state,
                allSecretaries: action.allSecretaries
            };

        case 'GAME_ADD_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = false;

                    return item;
                }),
                rawSecretariesIDs: [...state.rawSecretariesIDs, action.id]
            };

        case 'GAME_REMOVE_SECRETARY':
            return {
                ...state,
                allSecretaries: state.allSecretaries.map(item => {
                    if (item.id === action.id)
                        item.visible = true;

                    return item;
                }),
                rawSecretariesIDs: state.rawSecretariesIDs.filter(item => item !== action.id)
            };

        case 'GAME_SET_ECHELON':
            return {
                ...state,
                rawEchelonID: action.id
            };

        case 'GAME_SET_ATHLETES':
            return {
                ...state,
                rawAthletesIDs: action.ids
            };

        case 'GAME_ADD_ATHLETE':
            return {
                ...state,
                rawAthletesIDs: [...state.rawAthletesIDs, action.id]
            };

        case 'GAME_REMOVE_ATHLETE':
            return {
                ...state,
                rawAthletesIDs: state.rawAthletesIDs.filter(item => item !== action.id)
            };

        default:
            return state;
    }
}