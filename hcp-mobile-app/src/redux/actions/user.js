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

export function setUserGroups(groups) {
    return {
        type: 'SET_USER_GROUPS',
        groups: groups
    }
}

export function setPartnerId(partner_id) {
    return {
        type: 'SET_USER_PARTNER_ID',
        partner_id: partner_id,
    }
}