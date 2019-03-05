import React from 'react';
import {
    ActivityIndicator, Alert,
    AsyncStorage,
    View,
} from 'react-native';
import Odoo from 'react-native-odoo-promise-based';


export default class OdooConnection extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

        this._odooConnection();
    }


    // Fetch the token from storage
    // Then create and established a rpc connection
    _odooConnection = async () => {

        const userToken = await AsyncStorage.getItem('access_token');
        const username = await AsyncStorage.getItem('username');
        const password = await AsyncStorage.getItem('password');

        if (userToken)
        {
            const odoo = new Odoo({
                host: '10.0.2.2',
                port: 8069,
                database: 'hcp',
                username: username,
                password: password,
                // sid: userToken
            });

            let response = await odoo.connect();
            if (response.success) {

                // Get and save the returned token
                const session_token = response.data.session_id.toString();
                await AsyncStorage.setItem('access_token', session_token);

                // Go to Home Screen
                this.props.navigation.navigate('Home', {odoo: odoo});

            } else {
                Alert.alert("Erro", response.error.toString());
            }
        } else {

            // If there is no token or token is no more valid
            this.props.navigation.navigate('Auth');
        }
    };



    // Render any loading content that you like here
    render() {
        return (
            <View>
                <ActivityIndicator />
            </View>
        );
    }
}