import React from 'react';
import {
    Alert,
    AsyncStorage
} from 'react-native';

import Odoo from 'react-native-odoo-promise-based';

import {connect} from 'react-redux';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserImage, setUserGroups, setPartnerId} from "../../redux/actions/user";
import {HOST, PORT, DATABASE} from 'react-native-dotenv';

import Loader from '../screens/Loader';



class AuthenticationLoading extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true
        };

        console.log('AUTHENTICATION: ' + HOST);
    }

    async componentDidMount() {

        let username = null;
        let password = null;
        let navigateTo = 'Authentication'; // Default navigation

        await AsyncStorage.multiGet(['username', 'password']).then((data) => {
            username = data[0][1];
            password = data[1][1];
        });

        if(username && password) {

            // Odoo connection parameters
            const odoo = new Odoo({
                host: HOST,
                port: PORT,
                database: DATABASE,
                username: username,
                password: password
            });

            // Save odoo data on store
            await this.props.setOdooInstance(odoo);

            // Login to odoo server
            const loginResponse = await this.authentication();
            if(loginResponse) {

                // Get and save user data on store
                await this.getUserData();

                // Go to Home Screen
                navigateTo = 'AppStack';
            }
        }

        await this.setState({
            isLoading: false
        });

        this.props.navigation.navigate(navigateTo);
    }

    /**
     * User authentication and validation.
     *
     * @returns {Promise<boolean>}
     */
    async authentication() {

        const response = await this.props.odoo.connect();

        if (response.success) {

            if (response.data.uid) {

                const session_token = response.data.session_id.toString();

                // save data locally
                await AsyncStorage.setItem('access_token', session_token);

                // save user data on store
                await this.props.setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                );

                return true;
            }

        } else {
            Alert.alert("Erro",response.error.toString());
        }
        return false;
    }

    /**
     * Get user image and groups.
     *
     * @returns {Promise<void>}
     */
    async getUserData() {

        // Define parameters
        const params = {
            ids: [this.props.user.id],
            fields: ['image', 'groups_id', 'partner_id'],
        };

        // Get data
        const response = await this.props.odoo.get('res.users', params);

        // Check and and save user data on store
        if(response.success) {
            await this.props.setUserImage(response.data[0].image);
            await this.fetchUserGroups(response.data[0].groups_id);
            await this.props.setPartnerId(response.data[0].partner_id[0]);
        }
    }

    /**
     * Fetch and parse user groups.
     * @param groups
     * @returns {Promise<void>}
     */
    async fetchUserGroups(groups) {

        const params = {
            ids: groups,
            fields: ['full_name'],
        };

        const response = await this.props.odoo.get('res.groups', params);
        if (response.success) {

            // User groups filtered
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
                                ['user_id', '=', this.props.user.id]
                            ],
                            limit: 1
                        };

                        const athleteResponse = await this.props.odoo.search_read('ges.atleta', athleteParams);
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
                                ['user_id', '=', this.props.user.id]
                            ],
                            limit: 1
                        };

                        const coachResponse = await this.props.odoo.search_read('ges.treinador', coachParams);
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
                                ['user_id', '=', this.props.user.id]
                            ],
                            limit: 1
                        };

                        const secretaryResponse = await this.props.odoo.search_read('ges.seccionista', secretaryParams);
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
                                ['user_id', '=', this.props.user.id]
                            ],
                            limit: 1
                        };

                        const fatherResponse = await this.props.odoo.search_read('ges.pai', fatherParams);
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

            await this.props.setUserGroups(result);
        }
    }


    // Render any loading content that you like here
    render() {
        return (
            <Loader isLoading={this.state.isLoading}/>
        );
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({

    setOdooInstance: (odoo) => {
        dispatch(setOdooInstance(odoo))
    },
    setUserData: (id, user) => {
        dispatch(setUserData(id, user))
    },
    setUserImage: (image) => {
        dispatch(setUserImage(image))
    },
    setUserGroups: (groups) => {
        dispatch(setUserGroups(groups))
    },
    setPartnerId: (partner_id) => {
        dispatch(setPartnerId(partner_id))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationLoading);