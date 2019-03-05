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
    ScrollView
} from 'react-native';

import { TextField } from 'react-native-material-textfield';


import Logo from '../Logo';
import Odoo from 'react-native-odoo-promise-based';


export default class LoginScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            error: "",
            isLoading: false
        }
    }

    async _onLoginPressed() {

        if(this.state.username && this.state.password) {
            this.setState({isLoading: true});

            const odoo = new Odoo({
                host: '10.0.2.2',
                port: 8069,
                database: 'hcp',
                username: this.state.username,
                password: this.state.password
            });

            let response = await odoo.connect();
            this.setState({isLoading: false});

            if (response.success) {

                if(response.data.uid) {
                    const session_token = response.data.session_id.toString();

                    // Save data
                    await AsyncStorage.setItem('username', this.state.username);
                    await AsyncStorage.setItem('password', this.state.password);
                    await AsyncStorage.setItem('access_token', session_token);

                    // Go to Home Screen
                    this.props.navigation.navigate('Home', {odoo: odoo});

                } else {
                    Alert.alert("Erro","As credenciais estão erradas!");
                }

            } else {
                Alert.alert("Erro",response.error.toString());
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
                    Bem-vindo de volta,
                </Text>
                <Text style={styles.textBottom}>
                    faça login para continuar.
                </Text>
                <TextField style={{paddingBottom: 5}}
                    onChangeText={(text) => this.setState({username: text, error: ""})}
                    value={this.state.username}
                    label={'Nome de utilizador'}
                    //placeholder={'nome123'}
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        height: "100%",
        paddingLeft: 25,
        paddingRight: 25,
        backgroundColor: '#fff1c2',
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



