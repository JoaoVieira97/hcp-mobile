import React, {Component} from 'react';
import { GiftedChat, Bubble, Send } from "react-native-gifted-chat";
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";
import {
    View,
    Platform,
    Text
} from 'react-native';

import moment from 'moment';
import 'moment/locale/pt'
import ConvertTime from "../ConvertTime";
import {headerTitle, closeButton} from "../navigation/HeaderComponents";
import Loader from "../screens/Loader";



class ConcreteChat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: {},
            messages: [],
            messagesIDs: [],
            lastMessageID: false,
            isLoading: false
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', (navigation.state.params.title ? navigation.state.params.title : 'CHAT')
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
        /*
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
                    {(navigation.state.params.channel_type === 'channel') ?
                        "Deixar o canal" :
                        "Desmarcar conversa"}
                </MenuItem>
                <MenuDivider/>
                <MenuItem onPress={navigation.state.params.channelInfo} style={{width: 250, alignItems: 'center'}}>
                    {(navigation.state.params.channel_type === 'channel') ?
                        "Ver detalhes do canal" :
                        "Ver detalhes da conversa"}
                </MenuItem>
            </Menu>

         */
    });

    async componentDidMount(){

        await this.setState({channel: this.props.navigation.state.params.channel});

        this.props.navigation.setParams({
            title: this.state.channel.name
        });

        /*
        this.props.navigation.setParams({
            title: this.state.channel.name,
            showMenu: this.showMenu,
            setMenuRef: this.setMenuRef,
            leaveChannel: this.leaveChannel,
            channelInfo: this.channelInfo,
            channel_type: this.state.channel.type
        });
         */

        this.setState({isLoading: true});
        await this.getChannelMessages();
        this.setState({isLoading: false});

        this.interval = setInterval( async () => {

            await this.getNewMessages();

        }, 1500);

        this.subscriptions = [
            this.props.navigation.addListener('willBlur', () => {

                clearInterval(this.interval);
            }),
        ];
    }

    componentWillUnmount() {

        this.subscriptions.forEach(sub => sub.remove());
        clearInterval(this.interval);
    }

    /**
     * Get messages from channel.
     * @returns {Promise<void>}
     */
    async getChannelMessages() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_message',
            args: [this.state.channel.id, this.state.lastMessageID, 10]
        };
        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success && response.data.length > 0) {

            let messages = [];
            let messagesIDs = [];
            let lastMessageID;

            const regex = /(<([^>]+)>)/ig;
            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                const message = response.data[i];

                const convertTime = new ConvertTime();
                convertTime.setDate(message.date);
                const date = convertTime.getDate();

                messages.push({
                    _id: parseInt(message.id),
                    text: message.body.replace(regex, ''),
                    createdAt: date,
                    user: {
                        _id: parseInt(message.author_id[0]),
                        name: message.author_id[1],
                        /*
                        ...((parseInt(msg.author_id[0]) !== this.props.user.partner_id && partner_image) && {avatar: `data:image/png;base64,${partner_image}`}),
                         */
                    }
                });
                messagesIDs.push(message.id);
                lastMessageID = message.id;
            }

            await this.setState(state => ({
                messages: [...state.messages, ...messages],
                messagesIDs: [...state.messagesIDs, ...messagesIDs],
                lastMessageID: lastMessageID
            }));
        }
    }

    /**
     * Get new messages.
     * @returns {Promise<void>}
     */
    async getNewMessages() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_message',
            args: [this.state.channel.id, false, 10]
        };
        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success && response.data.length > 0) {

            let messages = [];
            let messagesIDs = [];

            const regex = /(<([^>]+)>)/ig;
            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                const message = response.data[i];

                if(!this.state.messagesIDs.includes(message.id)) {

                    const convertTime = new ConvertTime();
                    convertTime.setDate(message.date);
                    const date = convertTime.getDate();

                    messages.push({
                        _id: parseInt(message.id),
                        text: message.body.replace(regex, ''),
                        createdAt: date,
                        user: {
                            _id: parseInt(message.author_id[0]),
                            name: message.author_id[1],
                        }
                    });
                    messagesIDs.push(message.id);
                }
            }

            await this.setState(state => ({
                messages: [...messages, ...state.messages],
                messagesIDs: [...messagesIDs, ...state.messagesIDs],
            }));
        }
    }

    /**
     * Send a new message.
     * @param message
     * @returns {Promise<void>}
     */
    async sendMessage(message){

        const dateArray = message[0].createdAt.toISOString().split('T');
        const dateText = dateArray[0].slice(0,10) + ' ' + dateArray[1].slice(0,8);

        const msg = message[0].text;
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'message_post',
            args: [this.state.channel.id, msg, 'Comentário', 'comment', 'mail.mt_comment']
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success){

            // message ID generated
            const messageID = response.data;

            const convertTime = new ConvertTime();
            convertTime.setDate(dateText);
            const date = convertTime.getDate();

            // set state
            this.setState(state => ({
                messagesIDs: [...state.messagesIDs, messageID],
                messages: [{
                    _id: messageID,
                    text: msg,
                    createdAt: date,
                    user: {
                        _id: this.props.user.partner_id
                    }
                }, ...state.messages]
            }));
        }
    }

    /*
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
     */


    /*
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

        if (this.state.channel.type == 'channel') {
            
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

                Alert.alert('Sucesso', 'Deixou o canal ' + this.state.channel.name + '.')
                
                clearInterval(listener);
                //if (this.props.navigation.state.params.originChannel == 1) this.props.navigation.state.params.onNavigateBack();
                this.props.navigation.goBack();
            
            } else {
                
                Alert.alert('Erro', 'Ocorreu um problema. Tente de novo.')
            
            }

        } else {
            
            const params = {
                kwargs: {
                    context: this.props.odoo.context,
                },
                model: 'mail.channel',
                method: 'channel_pin',
                args: [
                    uuid=this.state.channel.uuid,
                    pinned=false
                ]
            };
    
            const response = await this.props.odoo.rpc_call(
                '/web/dataset/call_kw',
                params
            );
    
            if (response.success){

                Alert.alert('Sucesso', 'Desmarcou a conversa ' + this.state.channel.name + '.')
                
                clearInterval(listener);
                //if (this.props.navigation.state.params.originChannel == 1) this.props.navigation.state.params.onNavigateBack();
                this.props.navigation.goBack();
            
            } else {
                
                Alert.alert('Erro', 'Ocorreu um problema. Tente de novo.')
            
            }
        }

    }

    channelInfo = async () => {

        this.hideMenu()

        this.props.navigation.navigate('ChatDetails', {
            channel_id: this.state.channel.id,
            channel_type: this.state.channel.type,
            channel_name: this.state.channel.name,
            onReturn: this.onReturn
        })

    }

    onReturn = () => {
        console.log('return')
        
        clearInterval(listener)
        listener = setInterval(async () => { await this.getNewMessages() }, 3500);
    }
    */


    /**
     * Load mode past messages.
     * @returns {null|*}
     */
    renderLoad(){

        if (this.state.messages.length >= 10) return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Ionicons
                    name="md-add-circle-outline"
                    size={37}
                    color={colors.gradient1}
                    onPress = {async () => {
                        this.setState({isLoading: true});
                        await this.getChannelMessages();
                        this.setState({isLoading: false});
                    }}
                />
                <Text style={{color: colors.gradient1}}>
                    Mostrar mensagens antigas
                </Text>
            </View>
        );
        else return null;
    }

    static renderBubble (props) {
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

    static renderSend(props) {
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
                <Loader isLoading={this.state.isLoading} />
                <GiftedChat
                    messages={this.state.messages}
                    onSend={messages => this.sendMessage(messages)}
                    user={{_id: this.props.user.partner_id}}
                    minInputToolbarHeight={60}
                    placeholder='Escreva uma mensagem...'
                    renderBubble={ConcreteChat.renderBubble}
                    renderSend={ConcreteChat.renderSend}
                    renderUsernameOnMessage={true}
                    loadEarlier={!this.state.isLoading}
                    renderLoadEarlier={this.renderLoad.bind(this)}
                    locale={moment.locale('pt')}
                    timeFormat={'LT'}
                    dateFormat={'LL'}
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