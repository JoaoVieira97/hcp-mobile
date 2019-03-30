// USER actions

export function setUserData(id, name) {
    return {
        type: 'SET_USER_DATA',
        id: id,
        name: name
    }
}

export function setUserImage(image) {
    return {
        type: 'SET_USER_IMAGE',
        image: image
    }
}

export function setUserRoles(groups) {
    return {
        type: 'SET_USER_ROLES',
        groups: groups
    }
}
