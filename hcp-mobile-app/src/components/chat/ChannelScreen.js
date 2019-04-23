import React, {Component} from 'react';

import {
    View,
    Text,
    Button
} from 'react-native';

import {TextInput} from 'react-native-paper';

import {Ionicons} from "@expo/vector-icons";

import CustomText from "../CustomText";

import {connect} from 'react-redux';

import {colors} from "../../styles/index.style";


class ChannelScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: {},
            text: ''
        }
    }

    async componentDidMount(){
        await this.setState({
            channel: this.props.navigation.state.params.item
        });
    }

    static navigationOptions = ({navigation}) => ({
        //headerTitle: 'Detalhes do Evento',

        headerTitle:<CustomText
                type={'bold'}
                children={'DETALHES DA CONVERSA'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft: <Ionicons
            name="md-arrow-back"
            size={28}
            color={'#ffffff'}
            style={{paddingLeft: 20}}
            onPress = {() => navigation.goBack()}
        />
    });

    async handleMessage(){

        if (this.state.text !== ''){
            
            const params = {
                kwargs: {
                    context: this.props.odoo.context,
                },
                model: 'mail.channel',
                method: 'message_post',
                args: [
                    this.state.channel.id, 
                    body=this.state.text,
                    subject='',
                    message_type='comment',
                    subtype='mail.mt_comment'
                ]
            };

            const response = await this.props.odoo.rpc_call(
                '/web/dataset/call_kw',
                params
            );

            if (response.success){
                console.log(response)
            } else{
                console.log(response)
            }

            this.setState({
                text: ''
            })

        }

    }

    render() {

        return (
            <View>
                <Text>Channel Screen of conversation {this.state.channel.name}</Text>
                <TextInput
                    label='Mensagem a enviar'
                    value={this.state.text}
                    onChangeText={text => this.setState({ text: text })}
                />
                <Button
                    title={'Enviar'}
                    color={colors.gradient1}
                    onPress={() => this.handleMessage()}
                    style={{marginBottom: 20}}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelScreen);