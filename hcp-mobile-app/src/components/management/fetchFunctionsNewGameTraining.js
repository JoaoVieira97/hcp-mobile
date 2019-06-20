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
            image: item.image,
            visible: true
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
            image: item.image,
            visible: true
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
 * @returns {Promise<object>}
 */
export async function fetchAllAthletes(odoo){

    const params = {
        fields: [ 'id', 'display_name', 'image', 'numerocamisola', 'escalao', 'posicao'],
        order: 'numerocamisola ASC',
    };

    const response = await odoo.search_read('ges.atleta', params);
    if(response.success && response.data.length > 0){

        let athletesByEchelon = {};

        for (let i = 0; i < response.data.length; i++) {

            let item = response.data[i];
            if (!athletesByEchelon[item.escalao[1]]) {
                athletesByEchelon[item.escalao[1]] = [];
            }

            athletesByEchelon[item.escalao[1]].push({
                id: item.id,
                name: item.display_name,
                image: item.image,
                squadNumber: item.numerocamisola,
                position: item.posicao,
                visible: true
            });
        }

        return athletesByEchelon;
    }
    return null;
}

/**
 * Fetch all opponent teams.
 * @returns {Promise<array>}
 */
export async function fetchAllTeams(odoo){

    const params = {
        fields: [ 'id', 'nome'],
        order: 'nome ASC',
    };

    const response = await odoo.search_read('ges.equipa_adversaria', params);
    if(response.success && response.data.length > 0){

        return response.data.map(item => ({
            id: item.id,
            name: item.nome
        }));
    }

    return [];
}

/**
 * Fetch all competitions.
 * @returns {Promise<array>}
 */
export async function fetchAllCompetitions(odoo){

    const params = {
        fields: [ 'id', 'designacao'],
        order: 'designacao ASC',
    };

    const response = await odoo.search_read('ges.competicao', params);
    if(response.success && response.data.length > 0){

        return response.data.map(item => ({
            id: item.id,
            name: item.designacao
        }));
    }

    return [];
}

/**
 * Fetch all seasons.
 * @returns {Promise<array>}
 */
export async function fetchAllSeasons(odoo) {

    const params = {
        fields: [ 'id', 'name'],
        order: 'name ASC',
    };

    const response = await odoo.search_read('ges.epoca', params);
    if(response.success && response.data.length > 0){

        return response.data.map(item => ({
            id: item.id,
            name: item.name
        }));
    }

    return [];
}