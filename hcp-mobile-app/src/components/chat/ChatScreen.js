import React, {Component} from 'react';

import {
    View,
    Text,
    Button
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

    async SendMessage(){
        //def message_post(self, body='', subject=None, message_type='notification', subtype=None, parent_id=False, attachments=None, content_subtype='html', **kwargs):
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'message_post',
            args: [1,'<p>sim,sim,sim</p>', null, 'comment', null, false, null, 'html']
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

    render() {

        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontWeight: '700', fontSize: 20}}>
                    CHAT TESTING
                </Text>
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
                    title={'Enviar mensagem para o geral (not working)'}
                    color={colors.gradient1}
                    onPress={() => this.sendMessage()}
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