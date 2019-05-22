import React, { Component } from 'react';
import {
    ScrollView,
    View,
    StyleSheet,
    CameraRoll, Alert,
} from 'react-native';
import { ImagePicker, Permissions } from 'expo';
import {Button} from 'react-native-paper';
import { Avatar } from 'react-native-elements';
import {connect} from "react-redux";
import {setUserImage} from "../../redux/actions/user";

import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";
import * as Animatable from "react-native-animatable";
import Loader from "../screens/Loader";
import ResetPassword from "./ResetPassword";
import moment from 'moment';

class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isAthlete: false,
            athleteId: false,
            squadNumber: undefined,
            level: undefined,
            birthday: undefined,
            email: undefined,
            isEditActive: false,
            image: false
        };
    };

    async componentDidMount() {

        await this.fetchUserData();

        // Get Athlete group id
        const athleteInfo = this.props.user.groups.filter(item => item.name === 'Atleta');
        if(athleteInfo.length > 0) {

            const athleteId = athleteInfo[0].id;
            await this.fetchAthleteData(athleteId);

            this.setState({athleteId: athleteId});
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
            let athleteAge = '';
            const currDate = moment();

            if(response.data[0].birthdate) {
                birthday =
                    response.data[0].birthdate.slice(8,10) + '/' +
                    response.data[0].birthdate.slice(5,7) + '/' +
                    response.data[0].birthdate.slice(0,4);

                const athleteBirthAux = moment(response.data[0].birthdate);
                athleteAge = currDate.diff(athleteBirthAux, 'years');
            }

            this.setState({
                image: this.props.user.image,
                birthday: birthday,
                email: response.data[0].email,
                age: athleteAge
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

    /**
     * Pick an image from local storage.
     * @returns {Promise<void>}
     * @private
     */
    _pickImage = async () => {

        // GET OR ASK PERMISSIONS
        let granted = false;
        const {status} = await Permissions.getAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (status !== 'granted') {

            const statusCamera = await Permissions.askAsync(Permissions.CAMERA);
            const statusCameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            granted = statusCamera.status === 'granted' && statusCameraRoll.status === 'granted';
        }
        else
            granted = true;

        if (granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: 'Images',
                aspect: [4, 4],
                quality: 1,
                base64: true
            });

            if (!result.cancelled) {

                this.setState({image: result.base64});
                this.updateImageAlert(result.base64);
            }
        }
    };

    /**
     * Pick camera.
     * @returns {Promise<void>}
     * @private
     */
    _pickCamera = async () => {

        let granted = false;
        const {status} = await Permissions.getAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (status !== 'granted') {

            const statusCamera = await Permissions.askAsync(Permissions.CAMERA);
            const statusCameraRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            granted = statusCamera.status === 'granted' && statusCameraRoll.status === 'granted';
        }
        else
            granted = true;

        if(granted) {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
                base64: true
            });

            if (!result.cancelled) {

                this.setState({image: result.base64});
                this.updateImageAlert(result.base64);

                // Save image to local storage
                CameraRoll.saveToCameraRoll(result.uri, 'photo');
            }
        }
    };

    /**
     * Delete an image.
     * @returns {Promise<void>}
     * @private
     */
    _deleteImage = async() =>{

        Alert.alert(
            'Remover imagem',
            'Pretende remover a imagem de utilizador?',
            [
                {text: 'Sim',
                    onPress: async () => {
                        await this.updateImage(false);
                    }
                },
                {text: 'Cancelar'}
            ],
            {cancelable: false},
        );
    };

    /**
     * Ask user if he wants to update the image.
     */
    updateImageAlert = (image) => {

        Alert.alert(
            'Escolher imagem',
            'Pretende utilizar a imagem selecionada?',
            [
                {text: 'Sim',
                    onPress: async () => {
                        await this.updateImage(image);
                    },
                },
                {text: 'Cancelar',
                    onPress: () => {
                        this.setState({image: this.props.user.image});
                    },
                }
            ],
            {cancelable: false},
        );
    };

    /**
     * Update user image.
     * @returns {Promise<void>}
     * @private
     */
    updateImage = async(image) => {

        this.setState({'isLoading': true,});

        const fields = {'image': image};
        const response = await this.props.odoo.update('res.users', [this.props.user.id], fields);
        if (response.success) {

            await this.props.setUserImage(image);
            await this.setState({
                image: image,
                'isLoading': false,
                'isEditActive': false,
            });
        }
        else {

            this.setState({
                'isLoading': false,
                'image': this.props.user.image
            });

            Alert.alert(
                'Erro ao atualizar',
                'Ocorreu um erro ao atualizar a imagem selecionada. Por favor, tente novamente.',
                [
                    {text: 'Confirmar'}
                ],
                {cancelable: true},
            );
        }
    };

    render() {

        let content;
        if (this.state.isLoading) {
            content = (
                <Loader isLoading={this.state.isLoading}/>
            );
        }
        else {
            // User image
            let userImage;
            if(this.state.image !== false) {
                userImage = (
                    <Avatar
                        size={90}
                        rounded
                        source={{uri: `data:image/png;base64,${this.state.image}`}}
                        onPress={() => this.setState(state => ({isEditActive: !state.isEditActive}))}
                        containerStyle={styles.userImageContainer}
                    />
                );
            }
            else{
                userImage = (
                    <Avatar
                        size={90}
                        rounded
                        source={require('../../../assets/user-account.png')}
                        onPress={() => this.setState(state => ({isEditActive: !state.isEditActive}))}
                        containerStyle={styles.userImageContainer}
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

            content = (
                <Animatable.View animation={"fadeIn"}>
                    <ScrollView contentContainerStyle={{paddingHorizontal: 20, paddingTop: 20}}>
                        <View style={styles.header}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <Animatable.View
                                    animation={this.state.isEditActive ? "fadeInRight" : "fadeOutRight"}
                                    style={styles.headerIconLeft}>
                                    <Avatar
                                        size={40}
                                        rounded
                                        icon={{name: 'delete', type: 'ionicons'}}
                                        onPress={this._deleteImage}
                                        activeOpacity={0.7}
                                    />
                                </Animatable.View>
                                <View style={styles.headerImage}>
                                    {userImage}
                                </View>
                                <Animatable.View
                                    animation={this.state.isEditActive ? "fadeInLeft" : "fadeOutLeft"}
                                    style={[styles.headerIconRight]}>
                                    <View>
                                        <Avatar
                                            size={40}
                                            rounded
                                            icon={{name: 'camera', type: 'ionicons'}}
                                            onPress={this._pickCamera}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                    <View style={{marginTop: 15}}>
                                        <Avatar
                                            size={40}
                                            rounded
                                            icon={{name: 'create', type: 'ionicons'}}
                                            onPress={this._pickImage}
                                            activeOpacity={0.7}
                                        />
                                    </View>
                                </Animatable.View>
                            </View>
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
                                    {
                                        this.state.birthday !== 'Não definida' ?
                                        this.state.birthday + '  ( ' + this.state.age + ' anos )' :
                                        this.state.birthday
                                    }
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.buttonContent}>
                            <Button
                                icon="lock"
                                color={'#fff'}
                                mode="contained"
                                contentStyle={{height: 55}}
                                onPress={() => {
                                    this.props.navigation.navigate('ResetPassword');
                                    this.setState({'isEditActive': false});
                                }}
                            >
                                Redifinir palavra-passe
                            </Button>
                        </View>
                        {
                            this.state.isAthlete &&
                            <View style={{paddingBottom: 20}}>
                                <View style={styles.buttonContent}>
                                    <Button
                                        color={'#fff'}
                                        mode="contained"
                                        contentStyle={{height: 55}}
                                        onPress={() =>
                                            this.props.navigation.navigate('ProfileInjuriesTypesScreen',
                                                {
                                                    athleteId: this.state.athleteId,
                                                    athleteName: this.props.user.name,
                                                    athleteImage: this.state.image
                                                }
                                            )
                                        }
                                    >
                                        Lesões
                                    </Button>
                                </View>
                            </View>
                        }
                    </ScrollView>
                </Animatable.View>
            );
        }

        return (
            <View style={styles.container}>
                { content }
            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayColor,
        //paddingHorizontal: 20,
        //paddingBottom: 10
    },
    header: {
        width: '100%',
        alignItems: 'center',
    },
    headerImage: {
        width: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200
    },
    headerIconLeft: {
        width: '25%',
        justifyContent: 'center',
        zIndex: 100,
        alignItems: 'flex-end'
    },
    headerIconRight: {
        width: '25%',
        justifyContent: 'center',
        zIndex: 100,
        alignItems: 'flex-start'
    },
    headerName: {
        color: '#000',
        fontSize: 20,
        marginTop: 10,
        textAlign: 'center'
    },
    userImageContainer: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerRoles: {
        color: colors.redColor,
        fontSize: 15,
        marginTop: 5,
        letterSpacing: 2,
        textAlign: 'center'
    },
    athleteContent: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 10,
        padding: 15,
        borderRadius: 7,
        borderColor: '#fff',
        backgroundColor: '#fff',
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    athleteTitle: {
        color: '#000',
        fontSize: 12,
        letterSpacing: 5
    },
    athleteValue: {
        color: colors.redColor,
        fontSize: 25,
    },
    content: {
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
        padding: 15,
        borderRadius: 7,
        backgroundColor: '#fff',
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    contentTitle: {
        color: '#000',
        fontSize: 12,
        letterSpacing: 2
    },
    contentValue: {
        color: colors.redColor,
        fontSize: 16
    },
    buttonContent: {
        width: '100%',
        paddingBottom: 10,
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({

    setUserImage: (image) => {
        dispatch(setUserImage(image))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ProfileScreen);
