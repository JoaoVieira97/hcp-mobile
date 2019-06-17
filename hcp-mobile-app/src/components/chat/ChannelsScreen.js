import React, {Component} from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    //TouchableOpacity
} from 'react-native';
import {
    ListItem,
    Avatar,
    SearchBar
} from 'react-native-elements';
import {connect} from 'react-redux';
import _ from 'lodash';
import {colors} from "../../styles/index.style";
import {AntDesign} from "@expo/vector-icons";
import ConvertTime from "../ConvertTime";
import BottomSheet from 'reanimated-bottom-sheet';
import CustomText from "../CustomText";
import {
    TouchableOpacity,
} from 'react-native-gesture-handler'; // NÃO INSTALAR OU COLOCAR NO PACKAGE JSON

class ChannelsScreen extends Component {

    constructor(props) {

        super(props);

        this.state = {
            channelsIDs: [],
            channels: [],
            filteredChannels: [],
            isRefreshing: false,
            filter: '',
        };
    }

    /**
     *
     * @param navigation
     * @returns {{headerRight: *}}
     */
    static navigationOptions = ({navigation}) => {

        const {params = {}} = navigation.state;
        return ({
            headerRight:
                <TouchableOpacity style={{
                    width: 50,
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 5}} onPress = {() => params.showBottomSheet()}>
                    <AntDesign
                        name="pluscircle"
                        size={28}
                        color={'#ffffff'}
                    />
                </TouchableOpacity>
        });
    };

    async componentDidMount() {

        this.props.navigation.setParams({
            showBottomSheet: this.showBottomSheet
        });

        this.subscriptions = [
            this.props.navigation.addListener('willFocus', async () => {

                this.setState({isRefreshing: true});
                await this.getChannels();
                this.setState({isRefreshing: false});

                this.interval = setInterval( async () => {

                    // TODO: improve this
                    await this.getChannels();

                }, 2500);
            }),
            this.props.navigation.addListener('willBlur', async () => {

                clearInterval(this.interval);
            }),
        ];
    }

    componentWillUnmount() {

        this.subscriptions.forEach(sub => sub.remove());
        clearInterval(this.interval);
    }

    /**
     * Get available channels.
     * @returns {Promise<void>}
     */
    async getChannels(){

        // reset channels IDS
        this.setState({channelsIDs: []});

        // get the new channels
        await this.getChannelsIDs();
        if(this.state.channelsIDs.length > 0) {

            await this.getChannelsInfo();
        }
        else {
            this.setState({channels: [], filteredChannels: []});
        }
    }

    /**
     * Get channels ids.
     * @returns {Promise<null>}
     */
    async getChannelsIDs() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_slot',
            args: []
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            const publicChannels = response.data.channel_channel;
            const directMessageChannels = response.data.channel_direct_message;
            const privateGroupChannels = response.data.channel_private_group;

            let channelsIDs = [];
            publicChannels.forEach(channel => channelsIDs.push(channel.id));
            directMessageChannels.forEach(channel => channelsIDs.push(channel.id));
            privateGroupChannels.forEach(channel => channelsIDs.push(channel.id));

            this.setState({channelsIDs: channelsIDs});
        }
    }

    /**
     * Get channels private information.
     * @returns {Promise<void>}
     */
    async getChannelsInfo() {

        const params = {
            domain: [
                ['id', 'in', this.state.channelsIDs]
            ],
            fields: [
                'id',
                'display_name',
                'description',
                'image',
                'uuid',
                'channel_type',
            ],
            order: 'display_name ASC',
        };

        const response = await this.props.odoo.search_read('mail.channel', params);
        if (response.success && response.data.length > 0) {

            let channelsList = [];
            for (let i=0; i<response.data.length; i++) {

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
    renderItem = ({ item, index }) => {

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
                containerStyle={{
                    backgroundColor: index % 2 === 0 ? colors.lightGrayColor : '#fff'
                }}
                onPress={() => (
                    this.props.navigation.navigate('ConcreteChat', {
                        channel: item,
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

    contains = ({name}, text) => {

        // case insensitive
        return name.toUpperCase().includes(text.toUpperCase());
    };

    renderHeader = () => {
        return (
            <SearchBar
                placeholder={"Pesquisar por nome"}
                lightTheme
                round
                onClear={this.handleSearchClear}
                onChangeText={this.handleSearch}
                value={this.state.filter}
            />
        )
    };

    handleSearchClear = () => {

        this.setState({
            filter: '',
            filteredChannels: this.state.channels
        });
        
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

    handleRefresh = () => {
        this.setState({
                channels: [],
                filteredChannels: [],
                isRefreshing: true
            },
            async () => {
                await this.getChannels();

                this.setState({isRefreshing: false});
            });
    };

    /**
     * Show bottom sheet when user press + button.
     */
    showBottomSheet = () => {

        this._bottomSheet.snapTo(0);
    };

    /**
     * Header of Bottom Sheet.
     * @returns {*}
     */
    bottomSheetHeader = () => {
        return (
            <View style={styles.bottomSheetHeaderContainer}>
                <View style={styles.bottomSheetHeaderButton}/>
            </View>
        )
    };

    /**
     * Inner content of Bottom Sheet.
     * @returns {*}
     */
    bottomSheetInner = () => {
        return (
            <View style={styles.panel}>
                <TouchableOpacity
                    style={styles.panelButton}
                    onPress={() => {this.props.navigation.navigate('DirectMessageScreen');}}
                >
                    <CustomText
                        type={'bold'}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        children={'MENSAGEM DIRETA'}
                        style={styles.panelButtonTitle}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.panelButton}
                    onPress={() => {this.props.navigation.navigate('JoinChannel')}}
                >
                    <CustomText
                        type={'bold'}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        children={'JUNTAR-ME A UM GRUPO'}
                        style={styles.panelButtonTitle}
                    />
                </TouchableOpacity>
            </View>
        )
    };


    render() {

        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.id + item.name}
                    data={this.state.filteredChannels}
                    renderItem={this.renderItem}
                    ListHeaderComponent={this.renderHeader}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                />
                <BottomSheet
                    ref={ref => this._bottomSheet = ref}
                    snapPoints={['45%', 0]}
                    renderContent={this.bottomSheetInner}
                    renderHeader={this.bottomSheetHeader}
                    enabledInnerScrolling={false}
                    initialSnap={1}
                />
            </View>
        );
    }

}

const bgColor = 'rgba(52, 52, 52, 0.8)';
const buttonColor = '#292929';


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bottomSheetHeaderContainer: {
        paddingTop: 15,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomSheetHeaderButton: {
        width: 40,
        height: 5,
        borderRadius: 20,
        backgroundColor: buttonColor
    },
    panel: {
        height: 700,
        padding: 20,
        backgroundColor: bgColor,
    },
    panelButton: {
        height: 55,
        borderRadius: 10,
        backgroundColor: buttonColor,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    panelButtonTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
});

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelsScreen);