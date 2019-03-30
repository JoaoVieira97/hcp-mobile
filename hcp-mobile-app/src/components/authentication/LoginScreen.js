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
import { HOST, PORT, DATABASE } from 'react-native-dotenv';

import {connect} from 'react-redux';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserImage, setUserRoles} from "../../redux/actions/user";

import {colors} from "../../styles/index.style";


class LoginScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            error: "",
            isLoading: false
        };

        console.log(HOST);
        console.log(PORT);
    }

    /**
     * User authentication and validation.
     *
     * @returns {Promise<boolean>}
     */
    authentication = async () => {

        const response = await this.props.odoo.connect();

        if (response.success) {
            if (response.data.uid) {

                const session_token = response.data.session_id.toString();

                // Save data on Memory
                await AsyncStorage.setItem('username', this.state.username);
                await AsyncStorage.setItem('password', this.state.password);
                await AsyncStorage.setItem('access_token', session_token);

                // Save data on Redux
                await this.props.setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                );
                await this.getUserData();

                return true;

            } else {
                Alert.alert("Erro","As credenciais estão erradas!");
            }

        } else {
            Alert.alert("Erro", "A conexão ao servidor foi interrompida.");
        }
        return false;
    };

    /**
     * Get user image and roles.
     *
     * @returns {Promise<void>}
     */
    getUserData = async() => {

        // Define parameters
        const params = {
            ids: [this.props.user.id],
            fields: ['image', 'groups_id'],
        };

        // Get data
        const response = await this.props.odoo.get('res.users', params);

        // Check and parse data
        if(response.success) {

            await this.props.setUserImage(response.data[0].image);
            await this.props.setUserRoles(response.data[0].groups_id);
        }
    };

    /**
     * Função chamada após utilizador premir o botão de login.
     *
     * @returns {Promise<void>}
     */
    onLoginPressed = async() => {

        if(this.state.username && this.state.password) {

            // Odoo connection parameters
            const odoo = new Odoo({
                host: '10.0.2.2',
                port: PORT,
                database: DATABASE,
                username: this.state.username,
                password: this.state.password
            });

            // Save odoo data on store
            await this.props.setOdooInstance(odoo);

            // Authentication
            this.setState({isLoading: true});
            const loginResponse = await this.authentication();
            this.setState({isLoading: false});

            if(loginResponse) {

                // Go to Home Screen
                this.props.navigation.navigate('AppStack');
            }
        }
        else {
            this.setState({error: "Preencha todos os campos."});
        }
    };

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
                    autoCapitalize={'none'}
                    textColor={colors.blueText}
                    lineWidth={1}
                    baseColor={colors.greyText}
                    tintColor={colors.blueText}
                    animationDuration={225}
                    autoFocus={false}
                    error={this.state.error}
                    errorColor={colors.redText}
                    onSubmitEditing={this._next}
                />
                <TextField
                    onChangeText={(text) => this.setState({password: text, error: ""})}
                    ref={ref => {this._passwordInput = ref}}
                    value={this.state.password}
                    label={'Palavra-passe'}
                    autoCapitalize={'none'}
                    textColor={colors.blueText}
                    lineWidth={1}
                    baseColor={colors.greyText}
                    tintColor={colors.blueText}
                    animationDuration={225}
                    error={this.state.error}
                    errorColor={colors.redText}
                    secureTextEntry={true}
                    returnKeyType="send"
                    onSubmitEditing={this.onLoginPressed}

                    labelHeight={15}
                />
                <View style={styles.loginButton}>
                    <Button
                        onPress={this.onLoginPressed}
                        title="Login"
                        color={colors.redText}
                    />
                </View>

                { this.state.isLoading &&
                    <View style={styles.loading} opacity={0.5}>
                        <ActivityIndicator size='large' color={colors.loadingColor} />
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
        backgroundColor: colors.background1,
    },
    imageTop: {
        alignItems: 'center',
        marginBottom: 15
    },
    textTop: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        color: colors.blueText,
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
