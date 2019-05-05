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
    SearchBar,
} from 'react-native-elements';
import {connect} from 'react-redux';
import _ from 'lodash';
import CustomText from "../CustomText";
import {Ionicons, FontAwesome, AntDesign} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";

class JoinChannel extends Component {

    constructor(props) {

        super(props);

        this.state = {
            filteredChannels: [],
            channels: [],
            isLoading: true,
            isRefreshing: false,
            filter: '',
        };
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle:<CustomText
                type={'bold'}
                children={'JUNTAR-ME A CANAL'}
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

        await this.getChannels();

    }

    async componentWillMount(){

        BackHandler.removeEventListener('hardwareBackPress');

    }

    async getChannels(){

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_search_to_join',
            args: []
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){

            const channels = response.data
            const c = []

            for (let i = 0; i < channels.length; i++){

                const ch = channels[i]

                const channel = {
                    id: ch.id,
                    name: '#' + ch.name
                } 

                c.push(channel)
            }

            await this.setState({
                channels: c,
                filteredChannels: c,
                isLoading: false,
                isRefreshing: false
            })

        }

    }

    async joinChannel (channel_id){

        console.log(channel_id)

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_join_and_get_info',
            args: [
                channel_id
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        console.log(response)

        if (response.success){

            Alert.alert('Sucesso', 'Foi adicionado ao canal com sucesso.')
            this.props.navigation.state.params.onNavigateBack();
            this.props.navigation.goBack();

        } else {

            Alert.alert('Erro', 'Ocorreu um problema. Tente de novo.')
            
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
                title={item.name}
                titleStyle={{fontWeight: 'bold'}}
                leftAvatar={<FontAwesome
                    name="group"
                    size={37}
                    color={colors.darkGrayColor}
                />}
                chevron={<AntDesign
                    name="adduser"
                    size={25}
                    color={colors.gradient1}
                />}
                onPress={() => (
                    this.joinChannel(item.id)
                )}
            />
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
            placeholder={"Pesquisa um grupo"}
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

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.id + item.name}
                    data={this.state.filteredChannels}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={this.renderSeparator}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
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

export default connect(mapStateToProps, mapDispatchToProps)(JoinChannel);