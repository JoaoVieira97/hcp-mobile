import React, {Component} from 'react';

import { GiftedChat, Bubble } from "react-native-gifted-chat";

import KeyboardSpacer from 'react-native-keyboard-spacer';

import {connect} from 'react-redux';

import CustomText from "../CustomText";

import {Ionicons} from "@expo/vector-icons";

import {colors} from "../../styles/index.style";

import {
    View,
    Platform
} from 'react-native';

class ConcreteChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: {},
            messages: [],
            response: {}
        }
    }

    static navigationOptions = ({navigation}) => ({
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

    async componentDidMount(){

        console.log(this.props.user.partner_id)

        await this.setState({
            channel: this.props.navigation.state.params.item
        });

        this.getLastMessages();
    }
    
    /*async componentWillMount() {

        this.getLastMessages();

    }*/

    async getPartnerImage(partner_id){

        const params = {
            ids: [partner_id],
            fields: ['image'],
        };

        const response = await this.props.odoo.get('res.partner', params);

        if (response.success){

            let aux = response.data[0];
            let image = aux.image;

            if (image){
                return image;
            }
        }

        return false
    }

    async getLastMessages(){

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_message',
            args: [
                this.state.channel.id,
                last_id = false,
                limit = 10
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        await this.setState({
            response: response
        })

        if (response.success){

            let messages = [];

            const regex = /(<([^>]+)>)/ig;

            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                let msg = response.data[i];

                //Date(year, month, day, hours, minutes, seconds, milliseconds)
                //let date = msg.date.split(' ');
                //let days = date[0].split('-');
                //let hours = date[1].split(':');

                let partner_image = await this.getPartnerImage(msg.author_id[0]);

                let message = {
                    _id: parseInt(msg.id),
                    text: msg.body.replace(regex, ''),
                    //createdAt: new Date(parseInt(days[0]), parseInt(days[1]), parseInt(days[2]), parseInt(hours[0]), parseInt(hours[1]), parseInt(hours[2])),
                    createdAt: msg.date,
                    user: {
                        _id: parseInt(msg.author_id[0]),
                        name: msg.author_id[1],
                        ...(partner_image && {avatar: `data:image/png;base64,${partner_image}`}),
                    }
                }
                
                messages.push(message);
            
            }

            await this.setState({
                messages: messages
            })

        }
    }

    async sendMessage(messages){
        //def message_post(self, body='', subject=None, message_type='notification', subtype=None, parent_id=False, attachments=None, content_subtype='html', **kwargs):
        console.log(messages);

        let text = messages[0].text;
        
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'message_post',
            args: [
                this.state.channel.id, 
                body=text,
                subject='Comentário',
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
    }

    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }));
    }

    renderBubble (props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: 'rgba(173, 46, 83, 0.15)'
                    }
                }}
                textStyle={{
                    right: {
                        color: colors.gradient1,
                    }
                }}
            />
        )
    }
    
    render() {
        return (
            <View style={{flex: 1}}>
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.sendMessage(messages)}
                    user={{
                        _id: this.props.user.partner_id
                    }}
                    placeholder='Escreva uma mensagem...'
                    renderBubble={this.renderBubble}
                />
                {Platform.OS === 'android' ? <KeyboardSpacer /> : null }
            </View>
        );
    }

}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ConcreteChat);