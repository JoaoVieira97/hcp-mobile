import React, { Component } from 'react';

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";
import {Avatar} from "react-native-elements";
import * as Animatable from "react-native-animatable";
import {Button} from "react-native-paper";


class ChildScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            child: {},
            isLoading: true
        }
    };

    async componentDidMount() {

        await this.setState({
            child: this.props.navigation.getParam('child'),
        });

        this.setState({isLoading: false});
    }

    /**
     * Define navigation properties.
     * @param navigation
     */
    static navigationOptions = ({navigation}) => ({
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



    render() {

        let content;
        if (this.state.isLoading) {
            content = (
                <View />
            );
            /* <Loader isLoading={this.state.isLoading}/> */
        }
        else {

            const child = this.state.child;
            let childImage;
            if(child.image !== false) {
                childImage = (
                    <Avatar
                        size={90}
                        rounded
                        source={{uri: `data:image/png;base64,${child.image}`}}
                        containerStyle={styles.userImageContainer}
                    />
                );
            }
            else{
                childImage = (
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
                                    {childImage}
                                </View>
                            </View>
                            <CustomText type={'bold'} style={styles.headerName}>{child.name}</CustomText>
                        </View>
                        <View style={styles.athleteContent}>
                            <View style={{width: '50%', alignItems: 'center'}}>
                                <CustomText type={'bold'} style={styles.athleteValue}>
                                    {child.squadNumber}
                                </CustomText>
                                <CustomText type={'bold'} style={styles.athleteTitle}>CAMISOLA</CustomText>
                            </View>
                            <View style={{width: '50%', alignItems: 'center'}}>
                                {
                                    child.echelon.includes('Sub') ?
                                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                                        <CustomText
                                            type={'bold'}
                                            style={[styles.athleteValue, {fontSize: 10, marginTop: 16, marginRight: 3}]}
                                        >SUB
                                        </CustomText>
                                        <CustomText type={'bold'} style={styles.athleteValue}>
                                            {
                                                child.echelon.slice(4)
                                            }
                                        </CustomText>
                                    </View> :
                                    <CustomText type={'bold'} style={styles.athleteValue}>
                                        {child.echelon}
                                    </CustomText>
                                }
                                <CustomText type={'bold'} style={styles.athleteTitle}>ESCALÃO</CustomText>
                            </View>
                        </View>
                        <View style={styles.content}>
                            <View>
                                <CustomText type={'bold'} style={styles.contentTitle}>E-MAIL</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    {child.email}
                                </CustomText>
                            </View>
                            <View style={{marginTop: 15}}>
                                <CustomText type={'bold'} style={styles.contentTitle}>DATA DE NASCIMENTO</CustomText>
                                <CustomText type={'normal'} style={styles.contentValue}>
                                    {
                                        child.age !== "Idade não definida" ?
                                        child.birthday + '  ( ' +  child.age + ' )' :
                                        child.birthday
                                    }
                                </CustomText>
                            </View>
                        </View>
                        <View style={styles.buttonContent}>
                            <Button
                                color={'#fff'}
                                mode="contained"
                                contentStyle={{height: 55}}
                                onPress={() => this.props.navigation.navigate('ChildInvitationsScreen', {child: this.state.child})}
                            >
                                Convocatórias
                            </Button>
                        </View>
                        <View style={styles.buttonContent}>
                            <Button
                                color={'#fff'}
                                mode="contained"
                                contentStyle={{height: 55}}
                                onPress={() =>
                                    this.props.navigation.navigate('ChildInjuriesTypesScreen',
                                        {
                                            athleteId: this.state.child.id,
                                            athleteName: this.state.child.name,
                                            athleteImage: this.state.child.image
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

export default connect(mapStateToProps, mapDispatchToProps)(ChildScreen);