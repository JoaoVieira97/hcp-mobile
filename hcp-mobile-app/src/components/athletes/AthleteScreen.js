import React, {Component} from 'react';

import {
    ScrollView,
    View,
    StyleSheet
} from 'react-native';
import { Button} from 'react-native-paper';
import { Avatar } from 'react-native-elements';
import {connect} from 'react-redux';
import * as Animatable from "react-native-animatable";
import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";
import {headerTitle, closeButton} from "../navigation/HeaderComponents";



class AthleteScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            athlete: {},
            isLoading: true
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'ATLETAS'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
    });

    async componentDidMount() {

        await this.setState({
            athlete: this.props.navigation.getParam('athlete'),
        });

        this.setState({isLoading: false});
    }

    render() {

        let content;
        if (this.state.isLoading) {
            content = (
                <View />
            );
            /* <Loader isLoading={this.state.isLoading}/> */
        }
        else {

            const athlete = this.state.athlete;
            let athleteImage;
            if(athlete.image !== false) {
                athleteImage = (
                    <Avatar
                        size={90}
                        rounded
                        source={{uri: `data:image/png;base64,${athlete.image}`}}
                        containerStyle={styles.userImageContainer}
                    />
                );
            }
            else{
                athleteImage = (
                    <Avatar
                        size={90}
                        rounded
                        source={require('../../../assets/user-account.png')}
                        containerStyle={styles.userImageContainer}
                    />
                )
            }

            content = (
                <Animatable.View animation={"fadeIn"}>
                    <ScrollView contentContainerStyle={{paddingHorizontal: 20, paddingTop: 20}}>
                        <View style={styles.header}>
                            <View style={{flex: 1, flexDirection: 'row'}}>
                                <View style={styles.headerImage}>
                                    {athleteImage}
                                </View>
                            </View>
                            <CustomText type={'bold'} style={styles.headerName}>{athlete.name}</CustomText>
                        </View>
                        <View style={styles.athleteContent}>
                            <View style={{width: '50%', alignItems: 'center'}}>
                                <CustomText type={'bold'} style={styles.athleteValue}>
                                    {athlete.squadNumber}
                                </CustomText>
                                <CustomText type={'bold'} style={styles.athleteTitle}>CAMISOLA</CustomText>
                            </View>
                            <View style={{width: '50%', alignItems: 'center'}}>
                                {
                                    athlete.echelon.includes('Sub') ?
                                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                                            <CustomText
                                                type={'bold'}
                                                style={[styles.athleteValue, {fontSize: 10, marginTop: 16, marginRight: 3}]}
                                            >SUB
                                            </CustomText>
                                            <CustomText type={'bold'} style={styles.athleteValue}>
                                                {
                                                    athlete.echelon.slice(4)
                                                }
                                            </CustomText>
                                        </View> :
                                        <CustomText type={'bold'} style={styles.athleteValue}>
                                            {athlete.echelon}
                                        </CustomText>
                                }
                                <CustomText type={'bold'} style={styles.athleteTitle}>ESCALÃO</CustomText>
                            </View>
                        </View>
                        <View style={styles.content}>
                            <View>
                                <CustomText type={'bold'} style={styles.contentTitle}>E-MAIL</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    {athlete.email}
                                </CustomText>
                            </View>
                            <View style={{marginTop: 15}}>
                                <CustomText type={'bold'} style={styles.contentTitle}>DATA DE NASCIMENTO</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    {
                                        athlete.age !== "Idade não definida" ?
                                            athlete.birthday + '  ( ' +  athlete.age + ' )' :
                                            athlete.birthday
                                    }
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.buttonContent}>
                            <Button
                                color={'#fff'}
                                mode="contained"
                                contentStyle={{height: 55}}
                                onPress={() =>
                                    this.props.navigation.navigate('AthleteInjuriesTypesScreen',
                                        {
                                            athleteId: this.state.athlete.id,
                                            athleteName: this.state.athlete.name,
                                            athleteImage: this.state.athlete.image
                                        }
                                    )
                                }
                            >
                                Lesões
                            </Button>
                        </View>
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
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteScreen);