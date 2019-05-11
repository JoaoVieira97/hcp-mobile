import React, {Component} from 'react';
import {
    View,
    FlatList,
    ActivityIndicator, StyleSheet, Text, Alert, Button
} from 'react-native';
import {
    ListItem,
    Avatar,
    SearchBar
} from 'react-native-elements';
import {connect} from 'react-redux';
import _ from 'lodash';
import {colors} from "../../styles/index.style";
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { AntDesign } from "@expo/vector-icons";
import ConvertTime from "../ConvertTime";

class ChannelsScreen extends Component {

    constructor(props) {

        super(props);

        this.state = {
            channels: [],
            filteredChannels: [],
            isLoading: true,
            isRefreshing: false,
            filter: '',
        };
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

    menuDirectMessage = () => {
        this.hideMenu();
        this.props.navigation.navigate('DirectMessageScreen',{
            onNavigateBack: this.handleRefresh
        })
    };

    menuJoinChannel = () => {
        this.hideMenu();
        this.props.navigation.navigate('JoinChannel',{
            onNavigateBack: this.handleRefresh
        })
    };

    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;

        return ({
            headerRight: 
                <Menu
                    ref={params.setMenuRef}
                    button={<AntDesign
                        name="pluscircle"
                        size={28}
                        color={'#ffffff'}
                        style={{paddingRight: 10}}
                        onPress={params.showMenu} 
                    />}
                >
                    <MenuItem onPress={params.menuDirectMessage} style={{width: 250, alignItems: 'center'}}>
                        Mensagem direta
                    </MenuItem>
                    <MenuDivider/>
                    <MenuItem onPress={params.menuJoinChannel} style={{width: 250, alignItems: 'center'}}>
                        Juntar-me a grupo
                    </MenuItem>
                </Menu>
        });
    }

    async componentDidMount() {

        this.props.navigation.setParams({
            showMenu: this.showMenu,
            setMenuRef: this.setMenuRef,
            menuDirectMessage: this.menuDirectMessage,
            menuJoinChannel: this.menuJoinChannel,
        });

        await this.getChannels();

    }

    /**
     * Get available channels.
     * @returns {Promise<void>}
     */
    async getChannels(){

        const c_params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_slot',
            args: []
        };

        const c_response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            c_params
        );

        if (c_response.success){

            const public_channels = c_response.data.channel_channel
            const direct_channels = c_response.data.channel_direct_message
            const private_channels = c_response.data.channel_private_group

            const channels = []

            for (let i = 0; i < public_channels.length; i++) channels.push(public_channels[i].id)
            for (let i = 0; i < direct_channels.length; i++) channels.push(direct_channels[i].id)
            for (let i = 0; i < private_channels.length; i++) channels.push(private_channels[i].id)

            const params = {
                domain: [
                    ['id', 'in', channels]
                ],
                fields: [
                    'id',
                    'display_name',
                    'description',
                    'image',
                    'uuid',
                    'channel_type',
                ],
                order:  'display_name ASC',
            };
    
            const response = await this.props.odoo.search_read('mail.channel', params);
            if (response.success && response.data.length > 0) {
    
                let channelsList = [];
                const size = response.data.length;
    
                // Parsing channels and get last message for each one
                for (let i = 0; i < size; i++) {
    
                    const channelInfo = response.data[i];
    
                    const lastMessage = await this.getLastMessage(channelInfo.id);
                    const channel = {
                        id: channelInfo.id,
                        name: '#' + channelInfo.display_name,
                        description: channelInfo.description,
                        image: channelInfo.image,
                        lastMessage: lastMessage,
                        uuid: channelInfo.uuid,
                        type: channelInfo.channel_type
                    };
                    channelsList.push(channel);
                }
    
                this.setState({
                    channels: channelsList,
                    filteredChannels: channelsList,
                });
            }

        }

        this.setState({
            isLoading: false,
            isRefreshing: false
        });
    }

    /**
     * Get last message for a specific channel.
     * @param id
     */
    async getLastMessage(id) {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
                //fields: ['id', 'last_message'],
            },
            model: 'mail.channel',
            method: 'channel_fetch_preview',
            args: [id],
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success && response.data.length > 0) {

            const messageInfo = response.data[0];

            const convertTime = new ConvertTime();
            convertTime.setDate(messageInfo.last_message.date);
            const date = convertTime.getTimeObject();

            const regex = /(<([^>]+)>)/ig;

            return {
                author: messageInfo.last_message.author_id[1],
                timestamp: '(' + date.date + ' às ' + date.hour + ')',
                //body: messageInfo.last_message.body.slice(3, messageInfo.last_message.body.length - 4)
                body: messageInfo.last_message.body.replace(regex, '')
            };

        } else
            return null;
    }

    /**
     * Render item in list.
     * @param item
     * @returns {*}
     */
    renderItem = ({ item }) => {

        let subtitle;
        if (item.lastMessage)
            subtitle = (
                <View  style={{flex: 1, flexDirection: 'column'}}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {item.lastMessage.author + ': '}
                        </Text>
                        <Text
                            ellipsizeMode='tail' numberOfLines={1}
                            style={{flex: 1, color: colors.darkGrayColor, fontStyle: 'italic'}}>
                            {item.lastMessage.body}
                        </Text>
                    </View>
                    <Text
                        ellipsizeMode='tail' numberOfLines={1}
                        style={{flex: 1, color: colors.darkGrayColor}}>
                        {item.lastMessage.timestamp}
                    </Text>
                </View>
            );
        else
            subtitle = (
                <View  style={{flex: 1, flexDirection: 'column'}}>
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {"Sem mensagens..."}
                        </Text>
                    </View>
                </View>
            );

        return (
            <ListItem
                title={item.name}
                titleStyle={{fontWeight: 'bold'}}
                subtitle={subtitle}
                leftAvatar={this.channelImage(item.image)}
                chevron
                onPress={() => (
                    this.props.navigation.navigate('ConcreteChat',{
                        item,
                        onNavigateBack: this.handleRefresh,
                        originChannel: 1
                    })
                )}
            />
        );
    };

    channelImage = (image) => {

        let img;

        if (image) {
            img = (
                <Avatar
                    rounded
                    source={{
                        uri: `data:image/png;base64,${image}`,
                    }}
                    size="medium"
                />
            );
        } else {
            img = (
                <Avatar
                    rounded
                    source={require('../../../assets/user-account.png')}
                    size="medium"
                />
            );
        }

        return (
            <View>
                {img}
            </View>
        );
    };

    renderSeparator = () => (
        <View style={{
            height: 1,
            width: '100%',
            backgroundColor: '#ced0ce',
        }}/>
    );

    handleSearchClear = () => {

        this.setState({
            filter: '',
            filteredChannels: this.state.channels
        });
        
    };

    contains = ({name}, text) => {

        // case insensitive
        return name.toUpperCase().includes(text.toUpperCase());
    };

    handleSearch = (text) => {
        const data = _.filter(this.state.channels, channel => {
            return this.contains(channel, text);
        });
        this.setState({
            filter: text,
            filteredChannels: data
        });
    };

    renderHeader = () => (
        <SearchBar
            placeholder={"Pesquisar por nome"}
            lightTheme
            round
            onClear={this.handleSearchClear}
            onChangeText={this.handleSearch}
            value={this.state.filter}
        />
    );

    renderFooter = () => {

        return (
            <View style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#ced0ce'
            }}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={'#ced0ce'}
                    />
                }
            </View>
        );
    };

    handleRefresh = () => {
        this.setState({
            channels: [],
            filteredChannels: [],
            isRefreshing: true,
            isLoading: false
        },
        async () => {
            await this.getChannels()
        });
    };

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

    menuDirectMessage = () => {
        this.hideMenu();
        this.props.navigation.navigate('DirectMessageScreen',{
            onNavigateBack: this.handleRefresh
        })
    };

    menuJoinChannel = () => {
        this.hideMenu();
        this.props.navigation.navigate('JoinChannel',{
            onNavigateBack: this.handleRefresh
        })
    };

    render() {

        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.id + item.name}
                    data={this.state.filteredChannels}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter.bind(this)}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelsScreen);