import React, { Component } from 'react';
import {
    Alert,
    View,
    StyleSheet,
    AsyncStorage,
    KeyboardAvoidingView
} from 'react-native';
import {Button, Card, TextInput, DefaultTheme, HelperText} from 'react-native-paper';
import {Ionicons} from "@expo/vector-icons";
import { Header } from 'react-navigation';
import * as Animatable from "react-native-animatable";
import {connect} from "react-redux";
import Authentication from '../authentication/Authentication';
import {colors} from "../../styles/index.style";
import {headerTitle, closeButton} from "../navigation/HeaderComponents";


class ResetPassword extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isResetDisabled: true,
            isNewPasswordInputDisabled: true,
            isLoading: false,
            username: "",
            oldPassword: "",
            oldPasswordInput: "",
            newPassword: "",
            newPasswordError: false,
            repeatNewPassword: "",
        };
    };

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'REDEFINIR PALAVRA-PASSE'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
    });

    async componentDidMount() {

        await this.fetchOldPassword();
    }

    /**
     *
     * @returns {Promise<void>}
     */
    fetchOldPassword = async () => {

        // TODO: fix this to get encrypted password and not the plain Text
        const oldPassword = await AsyncStorage.getItem('password');
        this.setState({
            'oldPassword': oldPassword
        });

        const params = {
            ids: [this.props.user.id],
            fields: ['password', 'login']
        };

        const response = await this.props.odoo.get('res.users', params);
        if(response.success && response.data.length > 0) {

            this.setState({
                'username': response.data[0].login,
            });
        }
    };

    /**
     * Reset user password.
     * @returns {Promise<void>}
     */
    resetPassword = async () => {

        this.setState({
            'isResetDisabled': true,
            'isLoading': true,
            'isNewPasswordInputDisabled': true
        });

        const fields = {'password': this.state.newPassword};
        const response = await this.props.odoo.update('res.users', [this.props.user.id], fields);
        if(response.success && response.data) {

            const auth = new Authentication();
            const isSuccess = await auth.userLogin(
                false,
                this.state.username,
                this.state.newPassword
            );

            this.setState({
                'isResetDisabled': false,
                'isLoading': false,
                'isNewPasswordInputDisabled': false
            });

            if(isSuccess === "success") {
                Alert.alert(
                    'Sucesso',
                    'A palavra-passe foi redefinida com sucesso.',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.goBack()}
                    ],
                    {cancelable: false},
                );
            } else {
                Alert.alert(
                    'Erro',
                    'Ocorreu um erro ao tentar redifinir a palavra-passe.',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.goBack()}
                    ],
                    {cancelable: false},
                );
            }
        }
        else {

            this.setState({
                'isResetDisabled': false,
                'isLoading': false,
                'isNewPasswordInputDisabled': false
            });

            Alert.alert(
                'Erro',
                'Ocorreu um erro ao tentar redifinir a palavra-passe.',
                    [
                    {text: 'OK', onPress: () => this.props.navigation.goBack()}
                    ],
                {cancelable: false},
            );
        }
    };

    /**
     * Old password change handler.
     * @param value
     * @returns {Promise<void>}
     */
    onOldPasswordChangeValue = async (value) => {

        await this.setState({'oldPasswordInput': value});

        if (value === this.state.oldPassword) {
            this.setState({'isNewPasswordInputDisabled': false});

            this._newPasswordInput.focus();
        }
        else
            this.setState({'isNewPasswordInputDisabled': true});
    };

    /**
     * Confirm if new and repeat password are equals.
     * @param value
     * @returns {Promise<void>}
     */
    onNewPasswordChangeValue = async (value) => {

        await this.setState({'newPassword': value});

        if (value === this.state.oldPassword) {
            this.setState({'newPasswordError': true});
        }
        else if (value !== '' && value === this.state.repeatNewPassword) {

            this.setState({
                'isResetDisabled': false,
                'newPasswordError': false
            });
        }
        else {
            this.setState({
                'isResetDisabled': true,
                'newPasswordError': false
            });
        }
    };

    /**
     * Confirm if new and repeat password are equals.
     * @param value
     * @returns {Promise<void>}
     */
    onConfirmPasswordChangeValue = async (value) => {

        await this.setState({'repeatNewPassword': value});

        if (this.state.newPassword === value) {
            this._repeatNewPasswordInput.blur();
            this.setState({'isResetDisabled': false});
        }
        else {
            this.setState({'isResetDisabled': true});
        }
    };


    render() {
        return (
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset = {Header.HEIGHT}
                style={styles.container}>
                <Animatable.View animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Redefinir"
                            subtitle="Defina uma palavra-passe diferente da atual."
                            left={(props) => <Ionicons name="md-lock" size={15} color={'#000'} {...props}/>}
                        />
                        <Card.Content>
                            <View style={styles.inputTextContent}>
                                <TextInput
                                    ref={ref => {this._oldPasswordInput = ref}}
                                    value={this.state.oldPasswordInput}
                                    label='Palavra-passe atual'
                                    onChangeText={text => this.onOldPasswordChangeValue(text)}
                                    autoCapitalize={'none'}
                                    secureTextEntry={true}
                                    theme={{ colors: {
                                            ...DefaultTheme.colors,
                                            primary: colors.blueColor,
                                        }}}
                                    style={styles.input}
                                />
                            </View>
                            <View style={styles.inputTextContent}>
                                <TextInput
                                    ref={ref => {this._newPasswordInput = ref}}
                                    label='Defina a nova palavra-passe'
                                    value={this.state.newPassword}
                                    onChangeText={text => this.onNewPasswordChangeValue(text)}
                                    disabled={this.state.isNewPasswordInputDisabled}
                                    autoCapitalize={'none'}
                                    secureTextEntry={true}
                                    returnKeyType={'next'}
                                    error={this.state.newPasswordError}
                                    theme={{ colors: {
                                            ...DefaultTheme.colors,
                                            primary: colors.blueColor,
                                        }}}
                                    style={styles.input}
                                />
                                {
                                    this.state.newPasswordError &&
                                    <HelperText
                                        type="error"
                                        visible={this.state.newPasswordError}
                                    >
                                        Introduza uma palavra-passe diferente da original!
                                    </HelperText>
                                }
                            </View>
                            <View style={styles.inputTextContent}>
                                <TextInput
                                    ref={ref => {this._repeatNewPasswordInput = ref}}
                                    label='Confirme a nova palavra-passe'
                                    value={this.state.repeatNewPassword}
                                    onChangeText={text => this.onConfirmPasswordChangeValue(text)}
                                    disabled={this.state.isNewPasswordInputDisabled}
                                    autoCapitalize={'none'}
                                    secureTextEntry={true}
                                    theme={{ colors: {
                                            ...DefaultTheme.colors,
                                            primary: colors.blueColor,
                                        }}}
                                    style={styles.input}
                                />
                            </View>
                        </Card.Content>
                        <Card.Actions style={{flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 40}}>
                            <Button
                                color={colors.redColor}
                                onPress={this.resetPassword.bind(this)}
                                disabled={this.state.isResetDisabled}
                                loading={this.state.isLoading}
                            >
                                Redefinir
                            </Button>
                            <Button
                                color={'#000'}
                                onPress={() => this.props.navigation.goBack()}
                            >
                                Cancelar
                            </Button>
                        </Card.Actions>
                    </Card>
                </Animatable.View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayColor,
        paddingHorizontal: 20,
        justifyContent: 'center'
    },
    innerContainer: {
        elevation: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5
    },
    inputTextContent: {
        marginTop: 10,
        width: '100%',
    },
    input: {
        //marginBottom: 10,
        //backgroundColor: 'rgba(173, 46, 83, 0.15)'
    },
    buttonContent: {
        //position: 'absolute',
        //bottom: 20,
        marginTop: 50,
        width: '100%',
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
