// OPENED TRAININGS actions

export function setTrainings(trainingsList) {
    return {
        type: 'SET_TRAININGS',
        trainingsList: trainingsList
    }
}

export function addTrainings(trainingsList) {
    return {
        type: 'ADD_TRAININGS',
        trainingsList: trainingsList
    }
}

export function clearAllTrainings() {
    return {
        type: 'CLEAR_TRAININGS',
        trainingsList: []
    }
}

export function removeTraining(trainingID) {
    return {
        type: 'REMOVE_TRAINING',
        id: trainingID
    }
}
