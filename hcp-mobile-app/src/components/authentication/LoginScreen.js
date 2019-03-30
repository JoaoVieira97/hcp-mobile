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

import {Button, TextInput, DefaultTheme} from 'react-native-paper';
import {MaterialIcons} from "@expo/vector-icons";
import Odoo from 'react-native-odoo-promise-based';
import {HOST, PORT, DATABASE} from 'react-native-dotenv';
import {connect} from 'react-redux';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserImage, setUserRoles} from "../../redux/actions/user";
import {colors} from "../../styles/index.style";
import Logo from "../../../assets/logo.png";
import Loader from '../screens/Loader';


class LoginScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            error: "",
            isLoading: false,
            hidePassword: true,
        };

        this.imageHeight = new Animated.Value(IMAGE_HEIGHT);

        console.log(HOST);
        console.log(PORT);
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
    handleLoginPressed = async() => {

        if(this.state.username && this.state.password) {

            // Odoo connection parameters
            const odoo = new Odoo({
                host: HOST,
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
            this.setState({error: true});
        }
    };

    /**
     * Função que permite mostrar a palavra-passe.
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
                        <StatusBar barStyle="light-content" backgroundColor={'#808e95'}/>
                        <Animated.Image
                            source={Logo}
                            style={[styles.logo, { height: this.imageHeight }]}
                        />
                        <TextInput
                            ref={ref => {this._usernameInput = ref}}
                            onChangeText={(text) => this.setState({username: text, error: false})}
                            mode={'flat'}
                            style={styles.input}
                            label={'Nome de utilizador'}
                            value={this.state.username}
                            error={this.state.error}
                            theme={{ colors: {
                                ...DefaultTheme.colors,
                                primary: colors.blueText,
                            }}}
                            autoCapitalize={'none'}
                        />
                        <View>
                            <TextInput
                                ref={ref => {this._passwordInput = ref}}
                                onChangeText={(text) => this.setState({password: text, error: false})}
                                mode={'flat'}
                                style={styles.input}
                                label={'Palavra-passe'}
                                value={this.state.password}
                                error={this.state.error}
                                secureTextEntry={this.state.hidePassword}
                                theme={{ colors: {
                                    ...DefaultTheme.colors,
                                    primary: colors.blueText,
                                }}}
                                autoCapitalize={'none'}
                            />
                            <TouchableOpacity
                                style={styles.icon}
                                onPress={this.handleShowPassword.bind(this)}>
                                <MaterialIcons
                                    name={this.state.hidePassword ? "visibility-off" : "visibility"}
                                    size={20}
                                    color={'#808d94'} />
                            </TouchableOpacity>
                        </View>
                        <Button
                            color={'#808d94'}
                            mode="contained"
                            contentStyle={styles.loginButtonInside}
                            style={styles.loginButtonOutside}
                            onPress={this.handleLoginPressed}
                        >
                            Login
                        </Button>
                        <Loader isLoading={this.state.isLoading}/>
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
        backgroundColor: '#b0bec5',
        justifyContent: 'center'
    },
    innerContainer: {
        alignItems: 'center',
    },
    logo: {
        height: IMAGE_HEIGHT,
        resizeMode: 'contain',
        marginBottom: 10
    },
    input: {
        marginBottom: 10,
        width: window.width - padding,
        backgroundColor: 'transparent'
    },
    icon: {
        position: 'absolute',
        top: 30,
        right: 5
    },
    loginButtonInside: {
        height: 50,
        width: window.width - padding,
    },
    loginButtonOutside: {
        marginTop: 20
    }
});


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