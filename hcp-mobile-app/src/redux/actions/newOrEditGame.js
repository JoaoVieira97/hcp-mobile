export function resetTraining() {
    return {
        type: 'GAME_RESET'
    }
}

export function setStepID(id) {
    return {
        type: 'GAME_SET_STEP_ID',
        stepID: id
    }
}

export function setStepReady(ready) {
    return {
        type: 'GAME_SET_STEP_READY',
        ready: ready
    }
}

export function increaseStep() {
    return {
        type: 'GAME_INCREASE_STEP'
    }
}

export function decreaseStep() {
    return {
        type: 'GAME_DECREASE_STEP'
    }
}

export function setAllInformation(
    allLocals, allCoaches, allSecretaries,
    allEchelons, allAthletes, allTeams,
    allCompetitions, allSeasons
) {
    return {
        type: 'GAME_SET_ALL_INFORMATION',
        allLocals: allLocals,
        allCoaches: allCoaches,
        allSecretaries: allSecretaries,
        allEchelons: allEchelons,
        allAthletes: allAthletes,
        allTeams: allTeams,
        allCompetitions: allCompetitions,
        allSeasons: allSeasons
    }
}