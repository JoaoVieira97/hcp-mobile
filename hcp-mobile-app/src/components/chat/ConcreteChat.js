import React, {Component} from 'react';

import { GiftedChat, Bubble, Send } from "react-native-gifted-chat";

import KeyboardSpacer from 'react-native-keyboard-spacer';

import {connect} from 'react-redux';

import CustomText from "../CustomText";

import {Ionicons, SimpleLineIcons, Entypo, MaterialCommunityIcons} from "@expo/vector-icons";

import {colors} from "../../styles/index.style";

import {
    View,
    Platform,
    Text,
    ActivityIndicator,
    BackHandler,
    Alert
} from 'react-native';

import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

var listener = null;

class ConcreteChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: {},
            messages: [],
            messages_ids: [],
            last_message: null,
            loading: false
        }
    }

    _menu = null;

    setMenuRef = ref => {
        this._menu = ref;
    };

    hideMenu = () => {
        this._menu.hide();
    };

    showMenu = () => {
        this._menu.show();
    };

    leaveChannel = async () => {

        this.hideMenu()
        
        console.log('unfollowing')

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'action_unfollow',
            args: [
                this.state.channel.id
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){

            Alert.alert('Deixou de seguir o canal ' + this.state.channel.name + '.')
            
            clearInterval(listener);
            if (this.props.navigation.state.params.originChannel == 1) this.props.navigation.state.params.onNavigateBack();
            this.props.navigation.goBack();
        
        } else {
            
            Alert.alert('Ocorreu um problema. Tente de novo.')
        
        }

    }

    channelInfo = async () => {

        this.hideMenu()
        
        console.log('channel info')

        var params = {
            domain: [
                ['id', '=', this.state.channel.id],
            ],
            fields: [],
            limit: 5
        }; //params
        this.props.odoo.search_read('mail.channel', params)
            .then(response => {
                console.log(response)
            });

    }

    static navigationOptions = ({navigation}) => ({
        
        headerTitle:<CustomText
                type={'bold'}
                children={navigation.state.params.title}
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
            onPress = {() => {
                clearInterval(listener);
                if (navigation.state.params.originChannel == 1) navigation.state.params.onNavigateBack();
                navigation.goBack();
            }}
        />,
        headerRight: 
            <Menu
                ref={navigation.state.params.setMenuRef}
                button={<SimpleLineIcons
                    name="options-vertical"
                    size={22}
                    color={'#ffffff'}
                    style={{paddingRight: 10}}
                    onPress={navigation.state.params.showMenu} />}
            >
                <MenuItem onPress={navigation.state.params.leaveChannel} style={{width: 250, alignItems: 'center'}}>
                    <MaterialCommunityIcons
                        name="arrow-collapse-left"
                        size={20}
                        color={colors.gradient1}
                    />
                    <Text>   Deixar de seguir canal</Text>
                </MenuItem>
                <MenuDivider/>
                <MenuItem onPress={navigation.state.params.channelInfo} style={{width: 250, alignItems: 'center'}}>
                    <Entypo
                        name="info"
                        size={20}
                        color={colors.gradient1}
                    />
                    <Text>   Ver detalhes do canal</Text>
                </MenuItem>
            </Menu>
    });

    async componentDidMount(){

        await this.setState({
            channel: this.props.navigation.state.params.item
        });

        this.props.navigation.setParams({
            title: this.state.channel.name,
            showMenu: this.showMenu,
            setMenuRef: this.setMenuRef,
            leaveChannel: this.leaveChannel,
            channelInfo: this.channelInfo
        });

        BackHandler.addEventListener('hardwareBackPress', () => {
            clearInterval(listener);
            if (this.props.navigation.state.params.originChannel == 1) this.props.navigation.state.params.onNavigateBack();
        });

        this.getLastMessages();

        listener = setInterval(async () => { await this.getNewMessages() }, 3500);
    }

    async componentWillMount(){

        BackHandler.removeEventListener('hardwareBackPress');

    }

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

        console.log('last message id = ' + this.state.last_message)

        this.setState({
            loading: true
        })

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_message',
            args: [
                this.state.channel.id,
                last_id = (this.state.last_message) ? this.state.last_message : false,
                limit = 10
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){

            let messages = [];
            let ids_msgs = [];
            let last_msg = {};

            const regex = /(<([^>]+)>)/ig;

            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                let msg = response.data[i];

                let partner_image = await this.getPartnerImage(msg.author_id[0]);

                let message = {
                    _id: parseInt(msg.id),
                    text: msg.body.replace(regex, ''),
                    createdAt: msg.date,
                    user: {
                        _id: parseInt(msg.author_id[0]),
                        name: msg.author_id[1],
                        ...((parseInt(msg.author_id[0]) !== this.props.user.partner_id && partner_image) && {avatar: `data:image/png;base64,${partner_image}`}),
                    }
                }
                
                last_msg = msg.id

                messages.push(message);
                ids_msgs.push(parseInt(msg.id))
            
            }

            await this.setState({
                messages: [...this.state.messages, ...messages],
                messages_ids: [...this.state.messages_ids, ...ids_msgs],
                last_message: last_msg
            })

        }

        this.setState({
            loading: false
        })

    }

    async getNewMessages(){

        console.log('retrieving new messages...')

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_message',
            args: [
                this.state.channel.id,
                last_id = false,
                limit = 4
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );
        
        if (response.success){

            let messages = [];
            let ids_msgs = [];

            const regex = /(<([^>]+)>)/ig;

            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                let msg = response.data[i];

                if (!this.state.messages_ids.includes(parseInt(msg.id))){

                    let partner_image = await this.getPartnerImage(msg.author_id[0]);

                    let message = {
                        _id: parseInt(msg.id),
                        text: msg.body.replace(regex, ''),
                        createdAt: msg.date,
                        user: {
                            _id: parseInt(msg.author_id[0]),
                            name: msg.author_id[1],
                            ...((parseInt(msg.author_id[0]) !== this.props.user.partner_id && partner_image) && {avatar: `data:image/png;base64,${partner_image}`}),
                        }
                    }

                    messages.push(message);
                    ids_msgs.push(parseInt(msg.id))
                
                }
            
            }

            await this.setState({
                messages: [...messages, ...this.state.messages],
                messages_ids: [...ids_msgs, ...this.state.messages_ids],
            })

        }

    }

    async sendMessage(messages){
        //def message_post(self, body='', subject=None, message_type='notification', subtype=None, parent_id=False, attachments=None, content_subtype='html', **kwargs):
        
        //console.log(messages);

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

            clearInterval(listener)
            await this.getNewMessages()
            listener = setInterval(async () => { await this.getNewMessages() }, 3500);
            
        } else{
            console.log('error')
        }

        //setTimeout(async () => { await this.getNewMessages() }, 2000);
    }

    /*onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages)
        }));
    }*/

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

    renderLoad(){

        return(
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Ionicons
                    name="md-add-circle-outline"
                    size={37}
                    color={colors.gradient1}
                    onPress = {async () => this.getLastMessages()}
                />
                <Text style={{color: colors.gradient1}}>
                    Mostrar mensagens antigas
                </Text>
            </View>
        );
    }

    renderSend(props) {
        return (
            <Send
                {...props} 
                label={'Enviar'}
                textStyle={{ color: colors.gradient1 }}
            />    
        );
    }
    
    render() {
        return (
            <View style={{flex: 1}}>

                {this.state.loading &&
                    <View opacity={0.1} style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.gradient1
                    }}>
                        <ActivityIndicator size='large' color='black' />
                    </View>
                }

                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.sendMessage(messages)}
                    user={{
                        _id: this.props.user.partner_id
                    }}
                    placeholder='Escreva uma mensagem...'
                    renderBubble={this.renderBubble}
                    renderSend={this.renderSend}
                    loadEarlier
                    renderLoadEarlier={this.renderLoad.bind(this)}
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