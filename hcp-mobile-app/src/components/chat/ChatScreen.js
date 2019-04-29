import React, {Component} from 'react';

import {
    View,
    Text,
    Button,
    FlatList
} from 'react-native';

import {connect} from 'react-redux';

import {colors} from "../../styles/index.style";

class ChatScreen extends Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

    }

    async getChannels(){
        var params = {
            domain: [
                ['id', '>=', '0'],
            ],
            fields: [],
            limit: 5
        }; //params
        this.props.odoo.search_read('mail.channel', params)
            .then(response => {
                console.log(response)
            });
    }

    async getLastMessage(){
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_preview',
            args: [1]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){
            console.log(response)
        } else{
            console.log('error')
        }
    }

    async getLastMessages(){
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_message',
            args: [1]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){
            console.log(response)
        } else{
            console.log('error')
        }
    }

    async sendMessage(){
        //def message_post(self, body='', subject=None, message_type='notification', subtype=None, parent_id=False, attachments=None, content_subtype='html', **kwargs):
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'message_post',
            args: [
                1, 
                body='Teste',
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

    async getMessages(){
        var params = {
            domain: [
                ['id', '=', ['10694', '10708']],
            ],
            fields: [],
            limit: 5
        }; //params
        this.props.odoo.search_read('mail.message', params)
            .then(response => {
                console.log(response)
            });
    }

    async createChannel(){
        console.log('ok')

        let channel = {
            channel_partner_ids: [(4, 101), (4, 29)],
            public: 'public',
            channel_type: 'chat',
            email_send: false,
            name: 'channelTesting'
        }

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'create',
            args: [ 
                vals=channel
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        console.log(response)
    }

    // Create public channel and invite partners 128 and 30
    async createPublicChannel(){

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_create',
            args: [ 
                name='PUBLIC CHANNEL'
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        console.log(response)

        if (response.success){

            const channel_id = response.data.id;
            console.log('channel id = ' + channel_id)

            const params2 = {
                kwargs: {
                    context: this.props.odoo.context,
                },
                model: 'mail.channel',
                method: 'channel_invite',
                args: [ 
                    channel_id,
                    partner_ids=[129, 101]
                ]
            };
    
            const response2 = await this.props.odoo.rpc_call(
                '/web/dataset/call_kw',
                params2
            );
    
            console.log(response2)
        }
    }

    // create direct message chat with partner 101
    async getDirectMessage(){
        
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_get',
            args: [ 
                partners_to=[101]
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        console.log(response)
    }

    // Create private channel and invite partners 128 and 30
    async createPrivateChannel(){

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_create',
            args: [ 
                name='PRIVATE CHANNEL',
                privacy='private'
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        console.log(response)

        if (response.success){

            const channel_id = response.data.id;
            console.log('channel id = ' + channel_id)

            const params2 = {
                kwargs: {
                    context: this.props.odoo.context,
                },
                model: 'mail.channel',
                method: 'channel_invite',
                args: [ 
                    channel_id,
                    partner_ids=[129, 101]
                ]
            };
    
            const response2 = await this.props.odoo.rpc_call(
                '/web/dataset/call_kw',
                params2
            );
    
            console.log(response2)
        }
    }

    render() {

        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{
                    fontWeight: '700',
                    color: colors.gradient1,
                    fontSize: 20
                }}>
                    CHAT TESTING
                </Text>
                <Button
                    title={'Página de conversas'}
                    color={colors.gradient1}
                    onPress={() => this.props.navigation.navigate('ChannelsScreen')}
                    style={{marginBottom: 20}}
                />
                <Text>Channels Info</Text>
                <Button
                    title={'Obter canais do chat'}
                    color={colors.gradient1}
                    onPress={() => this.getChannels()}
                    style={{marginBottom: 20}}
                />
                <Button
                    title={'Obter última msg do canal geral'}
                    color={colors.gradient1}
                    onPress={() => this.getLastMessage()}
                    style={{marginBottom: 20}}
                />
                <Button
                    title={'Obter últimas 20 msgs do canal geral'}
                    color={colors.gradient1}
                    onPress={() => this.getLastMessages()}
                    style={{marginBottom: 20}}
                />
                <Button
                    title={'Enviar mensagem para o geral'}
                    color={colors.gradient1}
                    onPress={() => this.sendMessage()}
                    style={{marginBottom: 20}}
                />
                {/*
                <Button
                    title={'Message'}
                    color={colors.gradient1}
                    onPress={() => this.getMessages()}
                    style={{marginBottom: 20}}
                />
                <Button
                    title={'Create channel'}
                    color={colors.gradient1}
                    onPress={() => this.createChannel()}
                    style={{marginBottom: 20}}
                />
                */}
                <Text>Channels Creation</Text>
                <Button
                    title={'Create public channel'}
                    color={colors.gradient1}
                    onPress={() => this.createPublicChannel()}
                    style={{marginBottom: 20}}
                />
                <Button
                    title={'Create direct private chat'}
                    color={colors.gradient1}
                    onPress={() => this.getDirectMessage()}
                    style={{marginBottom: 20}}
                />
                <Button
                    title={'Create private channel'}
                    color={colors.gradient1}
                    onPress={() => this.createPrivateChannel()}
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);