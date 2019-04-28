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
            isEditActive: false,
            image: false,
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
                image: this.props.user.image,
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

    /**
     * Pick an image from local storage.
     * @returns {Promise<void>}
     * @private
     */
    _pickImage = async () => {

        await Permissions.getAsync(Permissions.CAMERA);
        await Permissions.getAsync(Permissions.CAMERA_ROLL);
        //await Permissions.askAsync(Permissions.CAMERA);
        //await Permissions.askAsync(Permissions.CAMERA_ROLL);

        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            mediaTypes: 'Images',
            aspect: [4, 4],
            quality: 1,
            base64: true
        });

        if (!result.cancelled) {
            this.setState({
                image: result.base64,
            });

            setTimeout(()=>{this.timeOut(result.base64)}, 3000);
        }
    };

    /**
     * Pick camera.
     * @returns {Promise<void>}
     * @private
     */
    _pickCamera = async () => {

        //await Permissions.getAsync(Permissions.CAMERA);
        //await Permissions.getAsync(Permissions.CAMERA_ROLL);
        await Permissions.askAsync(Permissions.CAMERA);
        await Permissions.askAsync(Permissions.CAMERA_ROLL);

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
            base64: true
        });

        if (!result.cancelled) {
            this.setState({
                image: result.base64,
            });

            CameraRoll.saveToCameraRoll(result.uri, 'photo');

            setTimeout(()=>{this.timeOut(result.base64)}, 3000);
        }

    };

    _deleteImage = async() =>{

        let flag = true;

        Alert.alert(
            'Apagar foto',
            'Tem a certeza que quer eliminar a foto atual?',
            [
                {text: 'OK',
                    onPress: async () => {
                        await this.updateImage(flag,false);
                        this.props.navigation.goBack();
                    },
                },
                {text: 'Cancelar',
                    onPress: async () => {
                        this.props.navigation.goBack();
                    },
                    style:'cancel',
                }
            ],
            {cancelable: false},
        );
    };

    /**
     * When timeOut, update (or not) the profile image.
     * @returns {Promise<void>}
     */
    timeOut = async (image) => {

        let flag = true;

        Alert.alert(
            'Escolha da foto',
            'Tem a certeza que quer continuar com esta foto?',
            [
                {text: 'OK',
                    onPress: async () => {
                        await this.updateImage(flag,image);
                        this.props.navigation.goBack()
                    },
                },
                {text: 'Cancelar',
                    onPress: async () => {
                        flag = false;
                        await this.updateImage(flag,image);
                        this.props.navigation.goBack()
                    },
                    style:'cancel',
                }
            ],
            {cancelable: false},
        );
    };


    /**
     * Update image: if flag=true, update odoo and redux; else update State. if image=false, also update State
     * @returns {Promise<void>}
     * @private
     */
    updateImage = async(flag,image) => {

        this.setState({
            'isLoading': true,
        });

        if(flag) {
            const fields = {
                'image': image,
            };

            const response = await this.props.odoo.update('res.users', [this.props.user.id], fields);

            if (response.success) {
                await this.props.setUserImage(image);
            }
        }

        if(!flag || !image){
            this.setState({
                image: this.props.user.image,
            });
        }

        this.setState({
            'isLoading': false,
        });
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
                        containerStyle={{elevation: 5}}
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
                                <View style={{flex:1, flexDirection:'column'}}>
                                    <Animatable.View
                                        animation={this.state.isEditActive ? "fadeInLeft" : "fadeOutLeft"}
                                        style={[styles.headerIconRight,{marginBottom:10}]}>
                                        <Avatar
                                            size={40}
                                            rounded
                                            icon={{name: 'camera', type: 'ionicons'}}
                                            onPress={this._pickCamera}
                                            activeOpacity={0.7}
                                        />
                                    </Animatable.View>
                                    <Animatable.View
                                        animation={this.state.isEditActive ? "fadeInLeft" : "fadeOutLeft"}
                                        style={styles.headerIconRight}>
                                        <Avatar
                                            size={40}
                                            rounded
                                            icon={{name: 'create', type: 'ionicons'}}
                                            onPress={this._pickImage}
                                            activeOpacity={0.7}
                                        />
                                    </Animatable.View>
                                </View>
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
                                    {this.state.birthday}
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.buttonContent}>
                            <Button
                                icon="lock"
                                //dark
                                color={'#fff'}
                                mode="contained"
                                contentStyle={{height: 55}}
                                onPress={() => this.props.navigation.navigate('ResetPassword')}
                            >
                                Redifinir palavra-passe
                            </Button>
                        </View>
                        {
                            this.state.isAthlete &&
                            <View style={{paddingBottom: 20}}>
                                <View style={styles.buttonContent}>
                                    <Button
                                        //dark
                                        color={'#fff'}
                                        mode="contained"
                                        contentStyle={{height: 55}}
                                        onPress={() => console.log('Pressed')}
                                    >
                                        Estatísticas
                                    </Button>
                                </View>
                                <View style={styles.buttonContent}>
                                    <Button
                                        //dark
                                        color={'#fff'}
                                        mode="contained"
                                        contentStyle={{height: 55}}
                                        onPress={() => console.log('Pressed')}
                                    >
                                        Dados antropométricos
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
        zIndex: 200,
    },
    headerIconLeft: {
        width: '25%',
        justifyContent: 'center',
        zIndex: 100,
        alignItems: 'flex-end',
    },
    headerIconRight: {
        //marginBottom: 3,
        width: '25%',
        justifyContent: 'center',
        zIndex: 100,
        alignItems: 'flex-start',
    },
    headerName: {
        color: '#000',
        fontSize: 20,
        marginTop: 10,
    },
    headerRoles: {
        color: colors.redColor,
        fontSize: 15,
        marginTop: 5,
        letterSpacing: 2
    },
    athleteContent: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 10,
        padding: 15,
        borderRadius: 7,
        borderColor: '#fff',
        backgroundColor: '#fff',
        elevation: 2
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
        elevation: 2
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
