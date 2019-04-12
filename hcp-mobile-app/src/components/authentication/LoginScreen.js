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
import {HOST, PORT, DATABASE } from 'react-native-dotenv';
import {connect} from 'react-redux';
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserImage, setUserGroups} from "../../redux/actions/user";
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
        console.log(response);

        if (response.success) {
            if (response.data.uid) {

                // Save data on Redux
                await this.props.setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                );
                await this.getUserData();

                if(this.props.user.groups.length > 0)
                {
                    // Odoo rpc calls require both user's name and password
                    await AsyncStorage.multiSet([
                        ["username", this.state.username],
                        ["password", this.state.password]
                    ]);
                    
                    return true;
                }
                else {

                    Alert.alert("Erro","Por favor, verifique com o administrador os acessos à aplicação.");
                    return true;
                }

            } else {
                Alert.alert("Erro","As credenciais estão erradas!");
            }

        } else {
            Alert.alert("Erro", "A conexão ao servidor foi interrompida.");
        }
        return false;
    };

    /**
     * Get user image and groups.
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
            await this.fetchUserGroups(response.data[0].groups_id);
        }
    };

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
    setUserGroups: (groups) => {
        dispatch(setUserGroups(groups))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);