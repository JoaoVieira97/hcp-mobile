import React from 'react';
import {
    Alert,
    AsyncStorage,
    StyleSheet,
    Text,
    Button,
    View,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';

import { TextField } from 'react-native-material-textfield';
import Logo from '../Logo';
import Odoo from 'react-native-odoo-promise-based';

import {connect} from 'react-redux';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserImage, setUserRoles} from "../../redux/actions/user";


class LoginScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            error: "",
            isLoading: false
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

        // Check and parse data
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
                await AsyncStorage.setItem('username', this.state.username);
                await AsyncStorage.setItem('password', this.state.password);
                await AsyncStorage.setItem('access_token', session_token);

                // save user data on store
                await this.props.setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                );

                return true;

            } else {
                Alert.alert("Erro","As credenciais estão erradas!");
            }

        } else {
            Alert.alert("Erro",response.error.toString());
        }
        return false;
    }


    async _onLoginPressed() {

        if(this.state.username && this.state.password) {

            // start loading indicator
            this.setState({isLoading: true});

            // odoo connection parameters
            const odoo = new Odoo({
                host: 'hugo-host.ddns.net', //10.0.2.2
                port: 8069,
                database: 'hcp',
                username: this.state.username,
                password: this.state.password
            });

            // save odoo data on store
            await this.props.setOdooInstance(odoo);

            // login to odoo server
            const loginResponse = await this.odooConnection();
            this.setState({isLoading: false});

            if(loginResponse) {

                // get and save user data on store
                await this.getUserData();

                // Go to Home Screen
                this.props.navigation.navigate('AppStack');
            }
        }
        else {
            this.setState({error: "Preencha todos os campos."});
        }
    }

    _next = () => {
        this._passwordInput && this._passwordInput.focus();
    };

    render() {

        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View style={styles.imageTop}>
                    <Logo size={"big"}/>
                </View>
                <Text style={styles.textTop}>
                    Bem-vindo,
                </Text>
                <Text style={styles.textBottom}>
                    faça login para continuar.
                </Text>
                <TextField
                    onChangeText={(text) => this.setState({username: text, error: ""})}
                    value={this.state.username}
                    label={'Nome de utilizador'}
                    //placeholder={'nome123'}
                    autoCapitalize={'none'}
                    textColor={'#0000e5'}
                    lineWidth={1}
                    baseColor={'#a2a2a2'}
                    tintColor={'#0000e5'}
                    animationDuration={225}
                    autoFocus={false}
                    error={this.state.error}
                    errorColor={'#ad2e53'}
                    onSubmitEditing={this._next}
                />
                <TextField
                    onChangeText={(text) => this.setState({password: text, error: ""})}
                    ref={ref => {this._passwordInput = ref}}
                    value={this.state.password}
                    label={'Palavra-passe'}
                    autoCapitalize={'none'}s
                    //placeholder={'muitosegura'}
                    textColor={'#0000e5'}
                    lineWidth={1}
                    baseColor={'#a2a2a2'}
                    tintColor={'#0000e5'}
                    animationDuration={225}
                    error={this.state.error}
                    errorColor={'#ad2e53'}
                    secureTextEntry={true}
                    returnKeyType="send"
                    onSubmitEditing={this._onLoginPressed.bind(this)}

                    labelHeight={15}
                />
                <View style={styles.loginButton}>
                    <Button
                        onPress={this._onLoginPressed.bind(this)}
                        title="Login"
                        color="#ad2e53"
                        accessibilityLabel="Learn more about this purple button"
                    />
                </View>

                { this.state.isLoading &&
                    <View style={styles.loading} opacity={0.5}>
                        <ActivityIndicator size='large' color='#0000e5' />
                    </View>
                }
            </KeyboardAvoidingView>
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        height: "100%",
        paddingLeft: 25,
        paddingRight: 25,
        backgroundColor: '#d7e8ff',
        //backgroundColor: '#fff1c2',
    },
    imageTop: {
        alignItems: 'center',
        marginBottom: 15
    },
    textTop: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        color: '#0000e5',
        marginBottom: 5
    },
    textBottom: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 18,
        marginBottom: 10
    },
    loginButton: {
        marginTop: 35,
        zIndex: 100
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#ffffff",
        zIndex: 101
    }
});
