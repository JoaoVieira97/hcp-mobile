import React, { Component } from 'react';
import {
    Alert,
    View,
    StyleSheet, TouchableOpacity, AsyncStorage, KeyboardAvoidingView
} from 'react-native';

import {Button, TextInput, DefaultTheme, HelperText} from 'react-native-paper';
import {connect} from "react-redux";
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData} from "../../redux/actions/user";

import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";
import Odoo from "react-native-odoo-promise-based";
import {DATABASE, HOST, PORT} from "react-native-dotenv";
import { Constants } from 'expo';
import { Header } from 'react-navigation';

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
        }
    };

    async componentDidMount() {

        await this.fetchOldPassword();

        this._oldPasswordInput.focus();
    }

    /**
     * Define header navigation options.
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'REDEFINIR PALAVRA-PASSE'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginLeft: 10}} onPress = {() => navigation.goBack()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'} />
            </TouchableOpacity>
    });

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
                //'oldPassword': response.data[0].password
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
        });

        const fields = {
            'password': this.state.newPassword
        };

        const response = await this.props.odoo.update('res.users', [this.props.user.id], fields);
        if(response.success && response.data) {

            const odoo = new Odoo({
                host: HOST,
                port: PORT,
                database: DATABASE,
                username: this.state.username,
                password: this.state.newPassword
            });

            // Save odoo data on store
            await this.props.setOdooInstance(odoo);
            await this.authentication();

            this.setState({
                'isResetDisabled': false,
                'isLoading': false,
            });

            Alert.alert(
                'Sucesso',
                'A palavra-passe foi redefinida com sucesso.',
                [
                    {text: 'OK', onPress: () => this.props.navigation.goBack()}
                ],
                {cancelable: false},
            );
        }
        else {

            this.setState({
                'isResetDisabled': false,
                'isLoading': false,
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
     * User authentication again to reload odoo instance.
     * @returns {Promise<void>}
     */
    authentication = async () => {

        const response = await this.props.odoo.connect();
        if (response.success) {
            if (response.data.uid) {

                // Save data on Redux
                await this.props.setUserData(
                    response.data.uid.toString(),
                    response.data.name.toString()
                );

                // Odoo rpc calls require both user's name and password
                await AsyncStorage.multiSet([
                    ["username", this.state.username],
                    ["password", this.state.newPassword]
                ]);
            }
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
                style={[styles.container, {justifyContent: 'center'}]}>
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
                                primary: colors.blueText,
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
                                primary: colors.blueText,
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
                                primary: colors.blueText,
                            }}}
                        style={styles.input}
                    />
                </View>
                <View style={styles.buttonContent}>
                    <Button
                        dark
                        color={'rgba(173, 46, 83, 0.15)'}
                        mode="contained"
                        contentStyle={{height: 55}}
                        onPress={this.resetPassword.bind(this)}
                        disabled={this.state.isResetDisabled}
                        loading={this.state.isLoading}
                    >
                        Redefinir
                    </Button>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gradient2,
        paddingHorizontal: 20,
        //paddingTop: 30
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

const mapDispatchToProps = dispatch => ({

    setOdooInstance: (odoo) => {
        dispatch(setOdooInstance(odoo))
    },
    setUserData: (id, user) => {
        dispatch(setUserData(id, user))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
