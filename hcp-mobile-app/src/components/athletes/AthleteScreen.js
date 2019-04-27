import React, {Component} from 'react';

import {
    ScrollView,
    View,
    StyleSheet
} from 'react-native';

import { Button} from 'react-native-paper';
import { Avatar } from 'react-native-elements';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";

import * as Animatable from "react-native-animatable";
import Loader from "../screens/Loader";
import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";

class AthleteScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            athlete: {},
            /*const athlete =
                {
                'name':
                'image':,
                'squad_number':
                'echelon': this.state.echelon.denomination,
                'user_id':
                'position': aux.posicao,
                 };*/
        }
    }

    async componentDidMount() {

        await this.setState({
            athlete: this.props.navigation.getParam('athlete'),
            //isLoading: false,
        });

        this.setState({isLoading: false});

        console.log(this.state.athlete)
    
    }

    static navigationOptions = ({navigation}) => {

        return ({
            headerTitle:
                <CustomText
                    type={'bold'}
                    children={navigation.getParam('athlete').name}
                    style={{
                        color: '#ffffff',
                        fontSize: 20,
                        marginLeft: 5,
                    }}
                />,
            headerLeft: null,
            headerRight: <Ionicons
                name="md-close"
                size={30}
                color="white"
                style={{paddingRight: 20}}
                onPress = {() => navigation.navigate('AthletesScreen')}
            />
        });
    };

    async sendNotification(){

        let userId = this.props.user.id.toString()
        let userD = this.state.athlete.user_id.toString();
        console.log('sending notification to user ' + userD)

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.notificacao',
            method: 'sendNotificationToUser',
            args: [0, userId, userD]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );
        console.log("Pedido de notificação realizado")
    }

    render() {

        // User image
        let userImage;
        if(this.state.athlete.image !== false) {
            userImage = (
                <Avatar
                    size="small"
                    rounded
                    source={{uri: `data:image/png;base64,${this.state.athlete.image}`}}
                    //style={styles.headerImage}
                />
            );
        }
        else{
            userImage = (
                <Avatar
                    size="large"
                    rounded
                    source={require('../../../assets/user-account.png')}
                    containerStyle={styles.headerImage}
                />
            )
        }

        return (
            <ScrollView contentContainerStyle={styles.container}>
                {
                    !this.state.isLoading &&
                    <Animatable.View animation={"fadeIn"}>
                        <View style={styles.header}>
                            {userImage}
                            <CustomText type={'bold'} style={styles.headerName}>{this.state.athlete.name}</CustomText>
                        </View>

                        <View style={styles.athleteContent}>
                            <View style={{width: '50%', alignItems: 'center'}}>
                                <CustomText type={'bold'} style={styles.athleteValue}>
                                    {this.state.athlete.squad_number}
                                </CustomText>
                                <CustomText type={'bold'} style={styles.athleteTitle}>CAMISOLA</CustomText>
                            </View>
                            <View style={{width: '50%', alignItems: 'center'}}>
                                {
                                    this.state.athlete.echelon.includes('Sub') &&
                                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                                        <CustomText
                                            type={'bold'}
                                            style={[styles.athleteValue, {fontSize: 10, marginTop: 16, marginRight: 3}]}
                                        >SUB
                                        </CustomText>
                                        <CustomText type={'bold'} style={styles.athleteValue}>
                                            {
                                                this.state.athlete.echelon.slice(4)
                                            }
                                        </CustomText>
                                    </View>
                                }
                                {
                                    !this.state.athlete.echelon.includes('Sub') &&
                                    <CustomText type={'bold'} style={styles.athleteValue}>
                                        {
                                            this.state.athlete.echelon
                                        }
                                    </CustomText>
                                }
                                <CustomText type={'bold'} style={styles.athleteTitle}>ESCALÃO</CustomText>
                            </View>
                        </View>

                        <View style={styles.content}>
                            <View>
                                <CustomText type={'bold'} style={styles.contentTitle}>E-MAIL</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    A ACRESCENTAR...
                                </CustomText>
                            </View>
                            <View style={{marginTop: 15}}>
                                <CustomText type={'bold'} style={styles.contentTitle}>DATA DE NASCIMENTO</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    A ACRESCENTAR...
                                </CustomText>
                            </View>
                        </View>

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
                            <View style={styles.buttonContent}>
                                <Button
                                    dark
                                    color={'rgba(173, 46, 83, 0.15)'}
                                    mode="contained"
                                    contentStyle={{height: 55}}
                                    onPress={() => this.sendNotification()}
                                >
                                    Enviar notificação
                                </Button>
                            </View>
                        </View>
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
        //elevation: 5,
        marginTop: 15,
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
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteScreen);