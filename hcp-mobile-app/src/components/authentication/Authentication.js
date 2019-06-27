import React from 'react';
import store from '../../redux/store';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setPartnerId, setUserData, setUserGroups, setUserImage} from "../../redux/actions/user";
import {Alert, AsyncStorage} from 'react-native';
import Odoo from "react-native-odoo-promise-based";

const HOST      =   '89.26.252.108';
const PORT      =   80;
const DATABASE  =   'hcp';
const PROTOCOL  =   'http';

/*
const HOST      =   'erp.hcpenafiel.pt';
const PORT      =   443;
const DATABASE  =   'hcp-prod';
const PROTOCOL  =   'https';
*/


export default class Authentication {

     static async set(key, value) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            //Alert.alert('SET', error.message);
            return false;
        }

        return true;
    };

    static async get(key) {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            //Alert.alert('GET', error.message);
            return null;
        }
    };


    /**
     * Check if an user is already authenticated.
     * @returns {Promise<boolean>}
     */
    async checkIfUserIsAuthenticated() {

        const username = await Authentication.get('username');
        const password = await Authentication.get('password');

        //Alert.alert('login', username + ' + ' + password);

        return username !== null && password !== null;
    }

    /**
     * User authentication.
     * Returns:
     * - success (right credentials)
     * - fail (wrong credentials)
     * - error (no connection)
     * - app-error (async storage error)
     * @param isAuthenticated
     * @param username
     * @param password
     * @returns {Promise<string>}
     */
    async userLogin(isAuthenticated, username=null, password=null) {

        const auxUsername = await Authentication.get('username');
        const auxPassword = await Authentication.get('password');

        // is already authenticated
        if(auxUsername !== null && auxPassword !== null) {

            const odoo = this._odooInstance(auxUsername, auxPassword);
            return await this._authentication(odoo);
        }
        // is login request
        else {

            let result = await Authentication.set('username', username);
            if(result) {

                result = await Authentication.set('password', password);
                if(result) {

                    const odoo = this._odooInstance(username, password);
                    return await this._authentication(odoo);
                }
            }

            return 'app-error'
        }
    }

    /**
     * Create Odoo instance.
     * @param username
     * @param password
     * @private
     */
    _odooInstance(username, password) {

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
        store.dispatch(setOdooInstance(odoo));
        return odoo;
    }

    /**
     * User authentication.
     * @private
     * @returns {Promise<string>}
     */
    async _authentication(odoo) {

        const response = await odoo.connect();
        if (response.success && response.data) {
            if (response.data.uid) {

                await store.dispatch(setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                ));

                await this._getUserData(odoo);
                return "success";
            }
            return "fail";
        }

        if(response.error && response.error.message === 'Odoo Server Error') {
            return "fail";
        }

        return "error";
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
     * Get user important information like user groups and partner id.
     * @private
     * @returns {Promise<void>}
     */
    async _getUserData(odoo) {

        const params = {
            ids: [store.getState().user.id],
            fields: ['image', 'groups_id', 'partner_id'],
        };

        const response = await odoo.get('res.users', params);
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
