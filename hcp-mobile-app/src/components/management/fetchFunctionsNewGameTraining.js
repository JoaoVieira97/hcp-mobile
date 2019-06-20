/**
 * Fetch all locals.
 * @returns {Promise<array>}
 */
export async function fetchAllLocals(odoo) {

    const  params = {
        fields: ['id', 'descricao'],
        order: 'descricao ASC'
    };

    const response = await odoo.search_read('ges.local', params);
    if (response.success && response.data.length > 0) {

        return response.data.map(item => ({
            id: item.id,
            name: item.descricao
        }));
    }

    return [];
}

/**
 * Fetch all coaches.
 * @returns {Promise<array>}
 */
export async function fetchAllCoaches(odoo) {

    const  params = {
        fields: ['id', 'display_name', 'image'],
        order: 'display_name ASC',

    };

    const response = await odoo.search_read('ges.treinador', params);
    if (response.success && response.data.length > 0) {

        return response.data.map(item => ({
            id: item.id,
            name: item.display_name,
            image: item.image
        }));
    }

    return [];
}

/**
 * Fetch all secretaries.
 * @returns {Promise<array>}
 */
export async function fetchAllSecretaries(odoo){

    const  params = {
        fields: ['id', 'display_name', 'image'],
        order: 'display_name ASC'
    };

    const response = await odoo.search_read('ges.seccionista', params);
    if (response.success && response.data.length > 0) {

        return response.data.map(item => ({
            id: item.id,
            name: item.display_name,
            image: item.image
        }));
    }

    return [];
}

/**
 * Fetch all echelons.
 * @returns {Promise<array>}
 */
export async function fetchAllEchelons(odoo){

    const params = {
        fields: [ 'id', 'designacao'],
        order: 'id ASC',
    };

    const response = await odoo.search_read('ges.escalao', params);
    if(response.success && response.data.length > 0){

        return response.data.map(item => ({
            id: item.id,
            name: item.designacao
        }));
    }
    return [];
}

/**
 * Fetch all athletes.
 * @returns {Promise<array>}
 */
export async function fetchAllAthletes(odoo){

    const params = {
        fields: [ 'id', 'display_name', 'image', 'numerocamisola'],
        order: 'id ASC',
    };

    const response = await odoo.search_read('ges.atleta', params);
    if(response.success && response.data.length > 0){

        return response.data.map(item => ({
            id: item.id,
            name: item.display_name,
            image: item.image,
            squadNumber: item.numerocamisola,
        }));
    }
    return [];
}