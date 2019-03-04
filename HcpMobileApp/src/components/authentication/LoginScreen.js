import React from 'react';
import {
    Alert,
    AsyncStorage,
    StyleSheet,
    Text,
    TextInput,
    Button,
    View,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';

import Logo from '../Logo';
import Odoo from 'react-native-odoo-promise-based';


const ACCESS_TOKEN = 'access_token';



export default class LoginScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            isLoading: false
        }
    }

    _storeToken = async (token) => {
        try {
            await AsyncStorage.setItem(ACCESS_TOKEN, token);
        } catch (error) {
            console.log(error);
        }
    };

    _retrieveToken = async () => {
        try {
            return await AsyncStorage.getItem(ACCESS_TOKEN, (err, res) => {
                console.log(res);
            });

        } catch (error) {
            console.log(error);
        }
    };

    async onLoginPressed() {

        this.setState({isLoading: true});
        try {

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
                    await this._storeToken(session_token);
                    this.props.navigation.navigate('App');
                } else {
                    Alert.alert("Erro","As credenciais estão erradas!");
                }

            } else {
                Alert.alert("Erro",response.error.toString());
            }

        } catch (error) {
            Alert.alert("Erro",error);
            this.setState({isLoading: false});
        }
    }

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
                <TextInput
                    onChangeText={(text) => this.setState({username: text})}
                    style={styles.inputText}
                    placeholder={'Username'}
                    placeholderTextColor="#0000e5"
                />
                <TextInput
                    onChangeText={(text) => this.setState({password: text})}
                    style={styles.inputText}
                    placeholder={'Password'}
                    placeholderTextColor="#0000e5"
                    secureTextEntry={true}
                />
                <Text style={styles.error}>
                    {this.state.error}
                </Text>
                <View style={styles.loginButton}>
                    <Button
                        onPress={this.onLoginPressed.bind(this)}
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
        marginBottom: 25
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
        marginBottom: 20
    },
    inputText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: '#0000e5',
        borderColor: '#0000e5',
        borderBottomWidth: 2,
        marginBottom: 16
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



