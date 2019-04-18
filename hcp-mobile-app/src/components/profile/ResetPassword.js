import React, { Component } from 'react';
import {
    ScrollView,
    View,
    StyleSheet
} from 'react-native';

import {Avatar, Button, DefaultTheme, TextInput} from 'react-native-paper';

import {connect} from "react-redux";
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserGroups, setUserImage} from "../../redux/actions/user";

import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";
import * as Animatable from "react-native-animatable";
import Loader from "../screens/Loader";
import Logo from "../../../assets/logo.png";
import {MaterialIcons} from "@expo/vector-icons";

class ResetPassword extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            old_password: '',
            new_password: '',
            confirmed_password: '',
            isValidOld: false,
            isValidNew: false,
        }
    };

    /*async componentDidMount() {

        this.setState({isLoading: false});
    }*/

    /**
     * Fetch normal user data.
     * @returns {Promise<void>}
     */
    fetchPassword = async (text) => {

        this.setState({old_password: text})

        const params = {
            ids: [this.props.user.id],
            fields: []
        };

        const response = await this.props.odoo.get('res.users', params);
        if (response.success && response.data.length > 0) {

            console.log(response.data)
        }
    }

    async savePassword() {
        console.log('OLA!!!!');
        console.log(this.props.user.id);

        const params = {
            ids: [this.props.user.id],
            fields: [],
        };

        const response = await this.props.odoo.get('res.users', params);
        if (response.success && response.data.length > 0) {

            console.log(response.data)
        }

    }


    render() {

        return (
            <View style={styles.container}>
                <TextInput
                    label='Password atual'
                    value={this.state.old_password}
                    onChangeText={text => this.fetchPassword(text)}
                />
                <TextInput
                    label='Nova password'
                    value={this.state.new_password}
                    onChangeText={text => this.fetchPassword(text)}
                />
                <TextInput
                    label='Confirme password'
                    value={this.state.confirmed_password}
                    onChangeText={text => this.fetchPassword(text)}
                />
                <View style={styles.buttonContent}>
                    <Button
                        dark
                        color={'rgba(173, 46, 83, 0.15)'}
                        mode="contained"
                        contentStyle={{height: 55}}
                        onPress={this.savePassword}
                    >
                        Guardar
                    </Button>
                    <Button
                        dark
                        color={'rgba(173, 46, 83, 0.15)'}
                        mode="contained"
                        contentStyle={{height: 55}}
                        onPress={() => console.log('Pressed')}
                    >
                        Cancelar
                    </Button>
                </View>
            </View>


        );
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.gradient2,
        paddingHorizontal: 20,
        paddingBottom: 10
    },
    header: {
        width: '100%',
        alignItems: 'center',
    },
    headerImage: {
        elevation: 5,
    },
    headerName: {
        color: '#fff',
        fontSize: 20,
        marginTop: 10,
        textShadowColor: colors.gradient1
    },
    headerRoles: {
        color: '#fff',
        fontSize: 15,
        marginTop: 5,
        textShadowColor: colors.gradient1,
        letterSpacing: 2
    },
    athleteContent: {
        flexDirection: 'row',
        marginTop: 10,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        backgroundColor: 'rgba(173, 46, 83, 0.15)'
    },
    athleteTitle: {
        color: 'rgba(255, 255, 255, 0.45)',
        fontSize: 12,
        letterSpacing: 5
    },
    athleteValue: {
        color: '#fff',
        fontSize: 25,
    },
    content: {
        marginTop: 10,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        backgroundColor: 'rgba(173, 46, 83, 0.15)'
    },
    contentTitle: {
        color: 'rgba(255, 255, 255, 0.45)',
        fontSize: 12,
        letterSpacing: 2
    },
    contentValue: {
        color: '#fff',
        fontSize: 16
    },
    buttonContent: {
        marginTop: 10,
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
    },
    setUserImage: (image) => {
        dispatch(setUserImage(image))
    },
    setUserGroups: (groups) => {
        dispatch(setUserGroups(groups))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
