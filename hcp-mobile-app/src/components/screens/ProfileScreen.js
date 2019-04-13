import React, { Component } from 'react';

import {Text, View, Button} from 'react-native';
import {connect} from "react-redux";
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserGroups, setUserImage} from "../../redux/actions/user";
import CustomText from "../home/HomeScreen";

class ProfileScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isPressed: false,
            birthdate: null,
            company: null,
            dados_antropometricos: [],
            email: null,
            escalao: null,
            numero_socio: null,
            name: null,
            numero_camisola: null,
            phone: null,
            posicao: null,
            groups: []
        }
    };

    async getInformations(){
        this.setState({
            isPressed: true
        });

        const params = {
            ids: [this.props.user.groups[0].id], //atleta
            fields: ['birthdate','company_id','dados_antropometricos',
                'email','escalao','numero_socio','name','numerocamisola','phone','posicao'],
        };


        let response = await this.props.odoo.get('ges.atleta', params);

        if (response.success) {

            this.setState({
                birthdate: response.data[0].birthdate,
                company: response.data[0].company_id[1],
                dados_antropometricos: response.data[0].dados_antropometricos,
                email: response.data[0].email,
                escalao: response.data[0].escalao[1],
                numero_socio: response.data[0].numero_socio,
                name: response.data[0].name,
                numero_camisola: response.data[0].numerocamisola,
                phone: response.data[0].phone,
                posicao: response.data[0].posicao,
                groups: this.props.user.groups
            });
        }

        console.log(this.props.user)
        console.log(this.state.groups)
    }

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

}

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