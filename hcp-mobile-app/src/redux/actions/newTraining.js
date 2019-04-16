// NEW TRAINING actions

export function resetTraining() {
    return {
        type: 'RESET'
    }
}

export function setStep(id) {
    return {
        type: 'SET_STEP',
        stepId: id
    }
}

export function increaseStep() {
    return {
        type: 'INCREASE_STEP'
    }
}

export function decreaseStep() {
    return {
        type: 'DECREASE_STEP'
    }
}

export function addSecretaryFlag(flag) {
    return {
        type: 'ADD_SECRETARY_FLAG',
        flag: flag
    }
}

export function setStartDateTime(startDateTime) {
    return {
        type: 'SET_START_DATE_TIME',
        startDateTime: startDateTime
    }
}

export function setEndDateTime(endDateTime) {
    return {
        type: 'SET_END_DATE_TIME',
        endDateTime: endDateTime
    }
}

export function setAllLocals(allLocals) {
    return {
        type: 'SET_ALL_LOCALS',
        allLocals: allLocals
    }
}

export function setLocalId(localId) {
    return {
        type: 'SET_LOCAL_ID',
        localId: localId
    }
}

export function setAllCoaches(allCoaches) {
    return {
        type: 'SET_ALL_COACHES',
        allCoaches: allCoaches
    }
}

export function addCoach(coachId) {
    return {
        type: 'ADD_COACH',
        id: coachId
    }
}

export function removeCoach(coachId) {
    return {
        type: 'REMOVE_COACH',
        id: coachId
    }
}

export function setAllSecretaries(allSecretaries) {
    return {
        type: 'SET_ALL_SECRETARIES',
        allSecretaries: allSecretaries
    }
}

export function addSecretary(secretaryId) {
    return {
        type: 'ADD_SECRETARY',
        id: secretaryId
    }
}

export function removeSecretary(secretaryId) {
    return {
        type: 'REMOVE_SECRETARY',
        id: secretaryId
    }
}
