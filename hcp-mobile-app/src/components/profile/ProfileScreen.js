import React, { Component } from 'react';
import {
    ScrollView,
    View,
    StyleSheet
} from 'react-native';

import { Button} from 'react-native-paper';
import { Avatar } from 'react-native-elements';
import {connect} from "react-redux";
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserGroups, setUserImage} from "../../redux/actions/user";

import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";
import * as Animatable from "react-native-animatable";
import Loader from "../screens/Loader";
import ResetPassword from "./ResetPassword";

class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isAthlete: false,
            squadNumber: undefined,
            level: undefined,
            birthday: undefined,
            email: undefined,
        }
    };

    async componentDidMount() {

        await this.fetchUserData();

        // Get Athlete group id
        const athleteInfo = this.props.user.groups.filter(item => item.name === 'Atleta');
        if(athleteInfo.length > 0) {

            const athleteId = athleteInfo[0].id;
            await this.fetchAthleteData(athleteId);
        }

        this.setState({isLoading: false});
    }

    /**
     * Fetch normal user data.
     * @returns {Promise<void>}
     */
    fetchUserData = async () => {

        const params = {
            ids: [this.props.user.id],
            fields: ['email', 'birthdate']
        };

        const response = await this.props.odoo.get('res.users', params);
        if (response.success && response.data.length > 0) {

            let birthday = 'Não definida';
            if(response.data[0].birthdate) {
                birthday =
                    response.data[0].birthdate.slice(8,10) + '/' +
                    response.data[0].birthdate.slice(5,7) + '/' +
                    response.data[0].birthdate.slice(0,4);
            }

            this.setState({
                birthday: birthday,
                email: response.data[0].email,
            });
        }
    };

    /**
     * Fetch only athlete user data.
     * @returns {Promise<void>}
     */
    fetchAthleteData = async (athleteId) => {

        const params = {
            ids: [athleteId],
            fields: ['numerocamisola', 'escalao'],
        };

        const response = await this.props.odoo.get('ges.atleta', params);
        if (response.success && response.data.length > 0) {

            this.setState({
                isAthlete: true,
                squadNumber: response.data[0].numerocamisola,
                level: response.data[0].escalao[1],
            });
        }
    };

    render() {

        // User image
        let userImage;
        if(this.props.user.image !== false) {
            userImage = (
                <Avatar
                    size="large"
                    rounded
                    source={{uri: `data:image/png;base64,${this.props.user.image}`}}
                    //style={styles.headerImage}
                    onPress={() => this.props.navigation.navigate('TesteUpload')}
                />
            );
        }
        else{
            userImage = (
                <Avatar
                    size="large"
                    rounded
                    source={require('../../../assets/user-account.png')}
                    //style={styles.headerImage}
                    onPress={() => this.props.navigation.navigate('TesteUpload')}
                />
            )
        }

        // User roles
        let rolesText = this.props.user.groups[0].name;
        this.props.user.groups.forEach((item, index) => {
            if(index !== 0) {
                rolesText = rolesText + ' | ' + item.name;
            }
        });

        return (
            <ScrollView contentContainerStyle={styles.container}>
                {
                    !this.state.isLoading &&
                    <Animatable.View animation={"fadeIn"}>
                        <View style={styles.header}>
                            {userImage}
                            <CustomText type={'bold'} style={styles.headerName}>{this.props.user.name}</CustomText>
                            <CustomText type={'normal'} style={styles.headerRoles}>{rolesText}</CustomText>
                        </View>
                        {
                            this.state.isAthlete &&
                            <View style={styles.athleteContent}>
                                <View style={{width: '50%', alignItems: 'center'}}>
                                    <CustomText type={'bold'} style={styles.athleteValue}>
                                        {this.state.squadNumber}
                                    </CustomText>
                                    <CustomText type={'bold'} style={styles.athleteTitle}>CAMISOLA</CustomText>
                                </View>
                                <View style={{width: '50%', alignItems: 'center'}}>
                                    {
                                        this.state.level.includes('Sub') &&
                                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                                            <CustomText
                                                type={'bold'}
                                                style={[styles.athleteValue, {fontSize: 10, marginTop: 16, marginRight: 3}]}
                                            >SUB
                                            </CustomText>
                                            <CustomText type={'bold'} style={styles.athleteValue}>
                                                {
                                                    this.state.level.slice(4)
                                                }
                                            </CustomText>
                                        </View>
                                    }
                                    {
                                        !this.state.level.includes('Sub') &&
                                        <CustomText type={'bold'} style={styles.athleteValue}>
                                            {
                                                this.state.level
                                            }
                                        </CustomText>
                                    }
                                    <CustomText type={'bold'} style={styles.athleteTitle}>ESCALÃO</CustomText>
                                </View>
                            </View>
                        }
                        <View style={styles.content}>
                            <View>
                                <CustomText type={'bold'} style={styles.contentTitle}>E-MAIL</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    {this.state.email}
                                </CustomText>
                            </View>
                            <View style={{marginTop: 15}}>
                                <CustomText type={'bold'} style={styles.contentTitle}>DATA DE NASCIMENTO</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    {this.state.birthday}
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.buttonContent}>
                            <Button
                                icon="lock"
                                dark
                                color={'rgba(173, 46, 83, 0.15)'}
                                mode="contained"
                                contentStyle={{height: 55}}
                                onPress={() => this.props.navigation.navigate('ResetPassword')}
                            >
                                Redifinir palavra-passe
                            </Button>
                        </View>
                        {
                            this.state.isAthlete &&
                                <View>
                                    <View style={styles.buttonContent}>
                                        <Button
                                            dark
                                            color={'rgba(173, 46, 83, 0.15)'}
                                            mode="contained"
                                            contentStyle={{height: 55}}
                                            onPress={() => console.log('Pressed')}
                                        >
                                            Estatísticas
                                        </Button>
                                    </View>
                                    <View style={styles.buttonContent}>
                                        <Button
                                            dark
                                            color={'rgba(173, 46, 83, 0.15)'}
                                            mode="contained"
                                            contentStyle={{height: 55}}
                                            onPress={() => console.log('Pressed')}
                                        >
                                            Dados antropométricos
                                        </Button>
                                    </View>
                                </View>
                        }
                        <Loader isLoading={this.state.isLoading}/>
                    </Animatable.View>
                }
            </ScrollView>
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

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);
