export function resetGame() {
    return {
        type: 'GAME_RESET'
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

export function setCompetitionID(id) {
    return {
        type: 'GAME_SET_COMPETITION',
        id: id
    }
}

export function setSeasonID(id) {
    return {
        type: 'GAME_SET_SEASON',
        id: id
    }
}

export function setOpponentID(id) {
    return {
        type: 'GAME_SET_OPPONENT',
        id: id
    }
}

export function setHomeAdvantage(value) {
    return {
        type: 'GAME_SET_HOME',
        value: value
    }
}

export function setLocalID(id) {
    return {
        type: 'GAME_SET_LOCAL',
        id: id
    }
}

export function setHoursNotice(hours) {
    return {
        type: 'GAME_SET_HOURS_NOTICE',
        hours: hours
    }
}

export function setStartTime(startTime) {
    return {
        type: 'GAME_SET_START_TIME',
        startTime: startTime
    }
}

export function setEndTime(endTime) {
    return {
        type: 'GAME_SET_END_TIME',
        endTime: endTime
    }
}

export function setAllCoaches(allCoaches) {
    return {
        type: 'GAME_SET_ALL_COACHES',
        allCoaches: allCoaches
    }
}

export function addCoach(id) {
    return {
        type: 'GAME_ADD_COACH',
        id: id
    }
}

export function removeCoach(id) {
    return {
        type: 'GAME_REMOVE_COACH',
        id: id
    }
}

export function setAllSecretaries(allSecretaries) {
    return {
        type: 'GAME_SET_ALL_SECRETARIES',
        allSecretaries: allSecretaries
    }
}

export function addSecretary(id) {
    return {
        type: 'GAME_ADD_SECRETARY',
        id: id
    }
}

export function removeSecretary(id) {
    return {
        type: 'GAME_REMOVE_SECRETARY',
        id: id
    }
}

export function setEchelon(id) {
    return {
        type: 'GAME_SET_ECHELON',
        id: id
    }
}

export function setAthletes(ids) {
    return {
        type: 'GAME_SET_ATHLETES',
        ids: ids
    }
}

export function addAthlete(id) {
    return {
        type: 'GAME_ADD_ATHLETE',
        id: id
    }
}

export function removeAthlete(id) {
    return {
        type: 'GAME_REMOVE_ATHLETE',
        id: id
    }
}