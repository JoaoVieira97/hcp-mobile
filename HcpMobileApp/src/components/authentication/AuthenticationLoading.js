import React from 'react';
import {
    ActivityIndicator, Alert,
    AsyncStorage,
    View,
} from 'react-native';

import Odoo from 'react-native-odoo-promise-based';

import {connect} from 'react-redux';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserImage, setUserRoles} from "../../redux/actions/user";





class AuthenticationLoading extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

        const token = await AsyncStorage.getItem('access_token');
        const username = await AsyncStorage.getItem('username');
        const password = await AsyncStorage.getItem('password');

        if(token) {
            // odoo connection parameters
            const odoo = new Odoo({
                host: 'hugo-host.ddns.net', //10.0.2.2
                port: 8069,
                database: 'hcp',
                sid: token,
                username: username,
                password: password
            });

            // save odoo data on store
            await this.props.setOdooInstance(odoo);

            // login to odoo server
            const loginResponse = await this.odooConnection();
            if(loginResponse) {

                // get and save user data on store
                await this.getUserData();

                // Go to Home Screen
                this.props.navigation.navigate('AppStack');

            } else {
                // Token is invalid
                this.props.navigation.navigate('Authentication');
            }

        } else {
            // There is no token
            this.props.navigation.navigate('Authentication');
        }
    }


    async getUserData() {

        // Define parameters
        const params = {
            ids: [this.props.user.id],
            fields: [ 'name', 'image', 'groups_id' ],
        };

        // Get data
        const response = await this.props.odoo.get('res.users', params);

        // Check and and save user data on store
        if(response.success) {

            await this.props.setUserImage(response.data[0].image);
            await this.props.setUserRoles(response.data[0].groups_id);
        }
    }

    async odooConnection() {

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


    // Render any loading content that you like here
    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator />
            </View>
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
    setUserRoles: (groups) => {
        dispatch(setUserRoles(groups))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationLoading);