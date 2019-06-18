import React from 'react';
import store from '../../redux/store';
import {setOdooInstance} from "../../redux/actions/odoo";
import {
    setPartnerId,
    setUserData,
    setUserGroups,
    setUserImage
} from "../../redux/actions/user";
import {AsyncStorage} from 'react-native';
import Odoo from "react-native-odoo-promise-based";



const HOST      =   '89.26.252.108';
const PORT      =   80;
const DATABASE  =   'hcp';
const PROTOCOL  =   'http';



export default class Authentication {

    /**
     * Check if an user is already authenticated.
     * @returns {Promise<boolean>}
     */
    async checkIfUserIsAuthenticated() {

        let username = null;
        let password = null;

        await AsyncStorage.multiGet(['username', 'password']).then((data) => {
            username = data[0][1];
            password = data[1][1];
        });

        return !!(username && password);
    }

    /**
     * User authentication.
     * @param isAuthenticated
     * @param username
     * @param password
     * @returns {Promise<string>}
     */
    async userLogin(isAuthenticated, username=null, password=null) {

        if(isAuthenticated) {
            await AsyncStorage.multiGet(['username', 'password']).then((data) => {
                username = data[0][1];
                password = data[1][1];
            });
        }

        if(username && password) {

            // create an Odoo instance
            await this._odooInstance(username, password);

            // do authentication
            return await this._authentication(username, password);
        }
        return "fail";
    }

    /**
     * Get user drawerNavigator name.
     * @returns {Promise<string>}
     */
    static async getUserDrawerNavigator() {

        const groups = await store.getState().user.groups;
        const groupsNames = groups.map(item => item.name);

        if(groupsNames.length === 1) {

            switch (groupsNames[0]) {

                case 'Atleta':
                    return 'AthleteStack';

                case 'Treinador':
                    return 'CoachAndSecretaryStack';

                case 'Seccionista':
                    return 'CoachAndSecretaryStack';

                case 'Pai':
                    return 'FatherStack';

                default:
                    break;
            }
        }
        else if(groupsNames.length === 2) {

            // Atleta e (Treinador ou Seccionista)
            if(groupsNames.includes('Atleta') && (groupsNames.includes('Treinador') || groupsNames.includes('Seccionista')))
                return 'AthleteAndCoachOrSecretaryStack';

            // Atleta e Pai
            else if(groupsNames.includes('Atleta') && groupsNames.includes('Pai'))
                return 'AthleteAndFatherStack';

            // Treinador e Seccionista
            else if(groupsNames.includes('Treinador') && groupsNames.includes('Seccionista'))
                return 'CoachAndSecretaryStack';

            // Pai e (Treinador ou Seccionista)
            else if(groupsNames.includes('Pai') && (groupsNames.includes('Treinador') || groupsNames.includes('Seccionista')))
                return 'FatherAndCoachOrSecretaryStack';
        }

        return 'AppStack';
    };

    /**
     * Create Odoo instance.
     * @param username
     * @param password
     * @private
     * @returns {Promise<void>}
     */
    async _odooInstance(username, password) {

        // create a new Instance
        const odoo = new Odoo({
            host: HOST,
            port: PORT,
            database: DATABASE,
            username: username,
            password: password,
            protocol: PROTOCOL
        });

        // save odoo data on store
        await store.dispatch(setOdooInstance(odoo));
    }

    /**
     * User authentication.
     * @param username
     * @param password
     * @private
     * @returns {Promise<string>}
     */
    async _authentication(username, password) {

        const response = await store.getState().odoo.odoo.connect();
        if (response.success && response.data) {
            if (response.data.uid) {

                // save data on redux store
                await await store.dispatch(setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                ));

                // save data on async storage
                await AsyncStorage.multiSet([
                    ["username", username],
                    ["password", password]
                ]);

                // get user data (image, groups...)
                await this._getUserData();
                return "success";
            }
            return "fail"
        }
        return "error";
    }

    /**
     * Get user important information like user groups and partner id.
     * @private
     * @returns {Promise<void>}
     */
    async _getUserData() {

        const params = {
            ids: [store.getState().user.id],
            fields: ['image', 'groups_id', 'partner_id'],
        };

        const response = await store.getState().odoo.odoo.get('res.users', params);
        if(response.success && response.data.length > 0) {

            // set user partner id
            await store.dispatch(
                setPartnerId(response.data[0].partner_id[0])
            );
            // set user image
            await store.dispatch(
                setUserImage(response.data[0].image)
            );
            // set user groups
            await this._fetchUserGroups(response.data[0].groups_id);
        }
    }

    /**
     * Fetch and parse user groups.
     * @param groups
     * @private
     * @returns {Promise<void>}
     */
    async _fetchUserGroups(groups) {

        const params = {
            ids: groups,
            fields: ['full_name'],
        };

        const response = await store.getState().odoo.odoo.get('res.groups', params);
        if (response.success) {

            let result = [];
            for (let i = 0; i < response.data.length; i++) {

                const splitName = response.data[i].full_name.split(" / ");
                if (splitName[0] === 'Gestão de Equipas Desportivas')
                {
                    if (splitName[1] === 'Atleta')
                    {
                        const athleteParams = {
                            ids: [],
                            fields: ['id'],
                            domain: [
                                ['user_id', '=', store.getState().user.id]
                            ],
                            limit: 1
                        };

                        const athleteResponse = await store.getState().odoo.odoo.search_read('ges.atleta', athleteParams);
                        if (athleteResponse && athleteResponse.data.length > 0) {

                            const athleteInfo = {
                                name: 'Atleta',
                                id:  athleteResponse.data[0].id
                            };
                            result.push(athleteInfo);
                        }
                    }
                    else if (splitName[1] === 'Treinador')
                    {
                        const coachParams = {
                            ids: [],
                            fields: ['id'],
                            domain: [
                                ['user_id', '=', store.getState().user.id]
                            ],
                            limit: 1
                        };

                        const coachResponse = await store.getState().odoo.odoo.search_read('ges.treinador', coachParams);
                        if (coachResponse && coachResponse.data.length > 0) {

                            const coachInfo = {
                                name: 'Treinador',
                                id: coachResponse.data[0].id
                            };
                            result.push(coachInfo);
                        }
                    }
                    else if (splitName[1] === 'Seccionista')
                    {
                        const secretaryParams = {
                            ids: [],
                            fields: ['id'],
                            domain: [
                                ['user_id', '=', store.getState().user.id]
                            ],
                            limit: 1
                        };

                        const secretaryResponse = await store.getState().odoo.odoo.search_read('ges.seccionista', secretaryParams);
                        if (secretaryResponse && secretaryResponse.data.length > 0) {

                            const secretaryInfo = {
                                name: 'Seccionista',
                                id: secretaryResponse.data[0].id
                            };
                            result.push(secretaryInfo);
                        }
                    }
                    else if (splitName[1] === 'Pai')
                    {
                        const fatherParams = {
                            ids: [],
                            fields: ['id'],
                            domain: [
                                ['user_id', '=', store.getState().user.id]
                            ],
                            limit: 1
                        };

                        const fatherResponse = await store.getState().odoo.odoo.search_read('ges.pai', fatherParams);
                        if (fatherResponse && fatherResponse.data.length > 0) {

                            const fatherInfo = {
                                name: 'Pai',
                                id: fatherResponse.data[0].id
                            };
                            result.push(fatherInfo);
                        }
                    }
                }
            }

            await store.dispatch(
                setUserGroups(result)
            );
        }
    }
}
