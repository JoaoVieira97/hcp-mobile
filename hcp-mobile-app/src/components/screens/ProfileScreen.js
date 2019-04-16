import React, { Component } from 'react';


import {
    ScrollView,
    Text,
    View,
    Image,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import { Button } from 'react-native-paper';


import {connect} from "react-redux";
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserGroups, setUserImage} from "../../redux/actions/user";

import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";

class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            birthdate: null,
            email: null,
            phone: null,
        }
    };

    async componentDidMount() {
        /*
        const params = {
            ids: [this.props.user.groups[0].id], //atleta
            fields: ['birthdate', 'company_id', 'dados_antropometricos',
                'email', 'escalao', 'numero_socio', 'name', 'numerocamisola', 'phone', 'posicao'],
        };*/

        const params = {
            ids: [this.props.user.groups[0].id], //atleta
            fields: ['birthdate', 'phone', 'email'],
        };


        let response = await this.props.odoo.get('ges.atleta', params);

        if (response.success && response.data.length > 0) {

            this.setState({
                birthdate: response.data[0].birthdate,
                email: response.data[0].email,
                phone: response.data[0].phone
            });
        }
    }

    /*

    render() {
        const displayRoles = this.state.groups.map((data,index) => {
            return (
                <View key={index}><Text>{data.name}</Text></View>
            )
        });

        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20}}>
                <Button onPress={this.getInformations.bind(this)}
                        title='GET DATA'
                />
                {this.state.isPressed &&
                <View>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Data de nascimento: {this.state.birthdate} </Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Equipa: {this.state.company}</Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Dados antropometricos: {this.state.dados_antropometricos}</Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Email: {this.state.email}</Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Escalão: {this.state.escalao}</Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Nº sócio: {this.state.numero_socio}</Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Nome: {this.state.name} </Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Nº camisola: {this.state.numero_camisola} </Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Nº telemóvel: {this.state.phone} </Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Posição: {this.state.posicao} </Text>
                    <Text style={{fontWeight: "bold", fontSize: 20}}> Grupos: </Text>
                    <View>
                            {displayRoles}
                    </View>
                </View>

                }
            </View>
        );
    }
*/

    resetPassword(){


    }

    render() {
        let image;

        if(this.props.user.image !== false){
            image =(
                 <Image style={styles.avatar} source={{uri: `data:image/png;base64,${this.props.user.image}`}}/>
            )
        }

        else{
            image = (
                <Image style={styles.avatar} source={require('../../../assets/user-account.png')}/>
            )
        }
        /*const displayRoles = this.props.user.groups.map((data,index) => {
            return (
                <View key={index}>
                    <Text>{data.name} / </Text>
                </View>
            )
        });*/

        const displayRoles = this.props.user.groups.map((data, index) => {
            return (
                <CustomText
                    key={index}
                    children={data.name + ' | '}
                    type={'normal'}
                />
            );
        });

        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}></View>
                {image}
                <View style={styles.body}>
                    <View style={styles.bodyContent}>
                        <CustomText style={styles.name}>{this.props.user.name}</CustomText>
                        <View style={styles.groups}>
                            {displayRoles}
                        </View>
                        <CustomText> Data de nascimento: {this.state.birthdate}</CustomText>
                        <CustomText> Email: {this.state.email}</CustomText>
                        <CustomText> Nº telemóvel: {this.state.phone}</CustomText>

                        <Button style={styles.buttonContainer}>
                            <CustomText>Estatísticas</CustomText>
                        </Button>
                        <Button style={styles.buttonContainer}>
                            <CustomText>Dados antropométricos</CustomText>
                        </Button>
                        <Button style={styles.buttonContainer} onPress={this.resetPassword}>
                            <CustomText>Reset password</CustomText>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
    header:{
        backgroundColor: colors.background1,
        height:200,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "white",
        marginBottom:10,
        alignSelf:'center',
        position: 'absolute',
        marginTop:130,
    },
    name:{
        fontSize:22,
        color:"#0d0d0d",
        fontWeight:'600',
    },
    body:{
        marginTop:40,
    },
    bodyContent: {
        flex: 1,
        alignItems: 'center',
        padding:30,
    },
    groups:{
        width:'100%',
        fontSize:20,
        color: "#0d0d0d",
        marginTop:10,
        marginBottom:50,
    },
    buttonContainer: {
        marginTop:10,
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:5,
        width:250,
        borderRadius:30,
        backgroundColor: colors.background1,
    },
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