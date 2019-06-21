export function resetTraining() {
    return {
        type: 'TRAINING_RESET'
    }
}

export function setAllInformation(
    allLocals, allCoaches, allSecretaries,
    allEchelons, allAthletes
) {
    return {
        type: 'TRAINING_SET_ALL_INFORMATION',
        allLocals: allLocals,
        allCoaches: allCoaches,
        allSecretaries: allSecretaries,
        allEchelons: allEchelons,
        allAthletes: allAthletes,
    }
}

export function setLocalID(id) {
    return {
        type: 'TRAINING_SET_LOCAL',
        id: id
    }
}

export function setStartTime(startTime) {
    return {
        type: 'TRAINING_SET_START_TIME',
        startTime: startTime
    }
}

export function setEndTime(endTime) {
    return {
        type: 'TRAINING_SET_END_TIME',
        endTime: endTime
    }
}

export function setAllCoaches(allCoaches) {
    return {
        type: 'TRAINING_SET_ALL_COACHES',
        allCoaches: allCoaches
    }
}

export function addCoach(id) {
    return {
        type: 'TRAINING_ADD_COACH',
        id: id
    }
}

export function removeCoach(id) {
    return {
        type: 'TRAINING_REMOVE_COACH',
        id: id
    }
}

export function setAllSecretaries(allSecretaries) {
    return {
        type: 'TRAINING_SET_ALL_SECRETARIES',
        allSecretaries: allSecretaries
    }
}

export function addSecretary(id) {
    return {
        type: 'TRAINING_ADD_SECRETARY',
        id: id
    }
}

export function removeSecretary(id) {
    return {
        type: 'TRAINING_REMOVE_SECRETARY',
        id: id
    }
}

export function setEchelon(id) {
    return {
        type: 'TRAINING_SET_ECHELON',
        id: id
    }
}

export function setAthletes(ids) {
    return {
        type: 'TRAINING_SET_ATHLETES',
        ids: ids
    }
}

export function addAthlete(id) {
    return {
        type: 'TRAINING_ADD_ATHLETE',
        id: id
    }
}

export function removeAthlete(id) {
    return {
        type: 'TRAINING_REMOVE_ATHLETE',
        id: id
    }
}