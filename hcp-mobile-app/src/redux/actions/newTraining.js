// NEW TRAINING actions

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


export function setFirstStep(startDateTime, endDateTime, localId) {
    return {
        type: 'SET_FIRST_STEP',
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        localId: localId
    }
}

export function setSecondStep(coachId, secretaries) {
    return {
        type: 'SET_SECOND_STEP',
        coachId: coachId,
        secretaries: secretaries
    }
}

export function setThirdStep(athletes) {
    return {
        type: 'SET_THIRD_STEP',
        athletes: athletes
    }
}

