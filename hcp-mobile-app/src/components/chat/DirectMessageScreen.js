import React, {Component} from 'react';
import {
    View,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
    BackHandler
} from 'react-native';
import {
    ListItem,
    Avatar,
    SearchBar
} from 'react-native-elements';
import {connect} from 'react-redux';
import _ from 'lodash';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";

class DirectMessageScreen extends Component {

    constructor(props) {

        super(props);

        this.state = {
            filteredPartners: [],
            partners: [],
            isLoading: true,
            isRefreshing: false,
            filter: '',
        };
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle:<CustomText
                type={'bold'}
                children={'MENSAGEM DIRETA'}
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
                navigation.state.params.onNavigateBack();
                navigation.goBack()
            }}
        />
    });

    async componentDidMount() {
        
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.state.params.onNavigateBack();
        });

        await this.getPartners();

    }

    async componentWillMount(){

        BackHandler.removeEventListener('hardwareBackPress');

    }

    async getPartners(){

        const params = {
            domain: [
                ['id', '!=', this.props.user.id]
            ],
            fields: ['image', 'display_name', 'partner_id'],
            order: 'display_name',
        };

        response = await this.props.odoo.search_read('res.users', params)

        if (response.success){

            console.log(response.data.length)

            await this.setState({
                partners: response.data,
                filteredPartners: response.data,
                isLoading: false
            })

        }

    }

    async getDirectChannel(partner_id) {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_get',
            args: [ 
                partners_to=[partner_id]
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){

            const channel_id = response.data.id

            const params2 = {
                domain: [
                    ['id', '=', channel_id]
                ],
                fields: [
                    'id',
                    'display_name',
                    'description',
                    'image',
                    'uuid',
                    'channel_type'
                ]
            };

            const response2 = await this.props.odoo.search_read('mail.channel', params2);

            if (response2.success){

                const channelInfo = response2.data[0];

                const item = {
                    id: channelInfo.id,
                    name: '#' + channelInfo.display_name,
                    description: channelInfo.description,
                    image: channelInfo.image,
                    uuid: channelInfo.uuid,
                    type: channelInfo.channel_type
                };

                this.props.navigation.navigate('ConcreteChat',{
                    item,
                    originChannel: 2
                })

            } else {

                Alert.alert('Problema a estabelecer conexão. Tente mais tarde.')

            }

        } else {

            Alert.alert('Problema a estabelecer conexão. Tente mais tarde.')
        
        }
    }

    /**
     * Render item in list.
     * @param item
     * @returns {*}
     */
    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.display_name}
                titleStyle={{fontWeight: 'bold'}}
                leftAvatar={this.partnerImage(item.image)}
                chevron
                onPress={() => (
                    this.getDirectChannel(item.partner_id[0])
                )}
            />
        );

    };

    partnerImage = (image) => {

        let img;

        if (image) {
            img = (
                <Avatar
                    rounded
                    source={{
                        uri: `data:image/png;base64,${image}`,
                    }}
                    size="small"
                />
            );
        } else {
            img = (
                <Avatar
                    rounded
                    source={require('../../../assets/user-account.png')}
                    size="small"
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
            filteredPartners: this.state.partners
        });
        
    };

    contains = ({display_name}, text) => {
        
        // case insensitive
        return display_name.toUpperCase().includes(text.toUpperCase());
    };

    handleSearch = (text) => {

        const data = _.filter(this.state.partners, partner => {
            return this.contains(partner, text);
        });
        this.setState({
            filter: text,
            filteredPartners: data
        });
    };

    renderHeader = () => (
        <SearchBar
            placeholder={"Pesquisa o nome da pessoa"}
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
            partners: [],
            filteredPartners: [],
            isRefreshing: true,
            isLoading: false
        },
        async () => {
            await this.getPartners()
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.id + item.display_name}
                    data={this.state.filteredPartners}
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
    },
});

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DirectMessageScreen);