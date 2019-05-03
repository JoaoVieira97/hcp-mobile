import React from 'react';

import {
    View,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    StatusBar,
    Alert,
    AsyncStorage,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import Authentication from './Authentication';
import {Button, TextInput, DefaultTheme} from 'react-native-paper';
import {MaterialIcons} from "@expo/vector-icons";
import {connect} from 'react-redux';
import {colors} from "../../styles/index.style";
import Logo from "../../../assets/logo.png";


class LoginScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            isUsernameDisabled: false,
            isPasswordDisabled: false,
            usernameError: false,
            passwordError: false,
            isLoading: false,
            isLoginDisabled: false,
            hidePassword: true,
        };

        this.imageHeight = new Animated.Value(IMAGE_HEIGHT);
    }

    componentDidMount() {

        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow,
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide,
        );
    }

    componentWillUnmount() {

        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = () => {

        Animated.timing(this.imageHeight, {
            duration: 500,
            toValue: IMAGE_HEIGHT_SMALL,
        }).start();
    };

    _keyboardDidHide = () => {

        Animated.timing(this.imageHeight, {
            duration: 500,
            toValue: IMAGE_HEIGHT,
        }).start();

        this._usernameInput.blur();
        this._passwordInput.blur();
    };

    /**
     * Handler for user login.
     * @returns {Promise<void>}
     */
    handleLoginPressed = async() => {

        Keyboard.dismiss();

        if(this.state.username && this.state.password) {

            this.setState({
                isLoading: true,
                isLoginDisabled: true,
                isUsernameDisabled: true,
                isPasswordDisabled: true
            });

            // authentication
            const auth = new Authentication();
            const isSuccess = await auth.userLogin(
                false,
                this.state.username,
                this.state.password
            );

            this.setState({
                isLoading: false,
                isLoginDisabled: false,
                isUsernameDisabled: false,
                isPasswordDisabled: false
            });

            if(isSuccess === "success") {

                // if user has a valid groups
                if(this.props.user.groups.length > 0) {

                    // go to app stack
                    this.props.navigation.navigate('AppStack');
                }
                else {
                    Alert.alert("Erro","Por favor, verifique com o administrador os acessos à aplicação.");
                }
            }
            else if(isSuccess === "fail") {
                Alert.alert("Erro","As credenciais estão erradas!");
                await AsyncStorage.clear();
            }
            else {
                Alert.alert("Erro", "A conexão ao servidor foi interrompida.");
                await AsyncStorage.clear();
            }
        }
        else {
            if(!this.state.username)
                this.setState({usernameError: true});
            if(!this.state.password)
                this.setState({passwordError: true});
        }
    };

    /**
     * Handler for show password.
     */
    handleShowPassword =() => {

        this.setState(state => ({
            hidePassword: !state.hidePassword
        }));
    };

    render() {

        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.innerContainer}>
                        <StatusBar barStyle="light-content" backgroundColor={colors.grayColor}/>
                        <Animated.Image
                            source={Logo}
                            style={[styles.logo, { height: this.imageHeight }]}
                        />
                        <TextInput
                            ref={ref => {this._usernameInput = ref}}
                            onChangeText={(text) => this.setState({username: text, error: false})}
                            mode={'flat'}
                            style={styles.input}
                            label={'E-mail'}
                            value={this.state.username}
                            error={this.state.usernameError}
                            disabled={this.state.isUsernameDisabled}
                            theme={{ colors: {
                                    ...DefaultTheme.colors,
                                    primary: colors.blueText,
                                }}}
                            autoCapitalize={'none'}
                            autoComplete={'email'}
                            keyboardType={'email-address'}
                        />
                        <View>
                            <TextInput
                                ref={ref => {this._passwordInput = ref}}
                                onChangeText={(text) => this.setState({password: text, error: false})}
                                mode={'flat'}
                                style={styles.input}
                                label={'Palavra-passe'}
                                value={this.state.password}
                                error={this.state.passwordError}
                                disabled={this.state.isPasswordDisabled}
                                secureTextEntry={this.state.hidePassword}
                                theme={{ colors: {
                                        ...DefaultTheme.colors,
                                        primary: colors.blueText,
                                    }}}
                                autoCapitalize={'none'}
                            />
                            <TouchableOpacity
                                style={styles.icon}
                                onPress={this.handleShowPassword.bind(this)}
                                disabled={this.state.isPasswordDisabled}
                            >
                                <MaterialIcons
                                    name={this.state.hidePassword ? "visibility-off" : "visibility"}
                                    size={20}
                                    color={'#808d94'} />
                            </TouchableOpacity>
                        </View>
                        <Button
                            color={colors.redColor}
                            mode="contained"
                            contentStyle={styles.loginButtonInside}
                            style={styles.loginButtonOutside}
                            onPress={this.handleLoginPressed}
                            disabled={this.state.isLoginDisabled}
                            loading={this.state.isLoading}
                        >
                            Login
                        </Button>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        );
    }
}

const window = Dimensions.get('window');
const padding = 30;
const IMAGE_HEIGHT = window.width / 3;
const IMAGE_HEIGHT_SMALL = window.width / 4;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayColor,
        justifyContent: 'center'
    },
    innerContainer: {
        //flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20
    },
    logo: {
        height: IMAGE_HEIGHT,
        resizeMode: 'contain',
        marginBottom: 10
    },
    input: {
        marginBottom: 10,
        width: window.width - padding,
        backgroundColor: 'transparent',
        zIndex: 100
    },
    icon: {
        position: 'absolute',
        top: 20,
        right: 5,
        zIndex: 200,
        width: 40,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonInside: {
        height: 50,
        width: window.width - padding,
    },
    loginButtonOutside: {
        marginTop: 20
    }
});

const mapStateToProps = state => ({user: state.user});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);