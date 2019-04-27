import React, {Component} from 'react';

import {
    View,
    FlatList,
    ActivityIndicator
} from 'react-native';

import {
    ListItem,
    Avatar,
    SearchBar
} from 'react-native-elements';

import {connect} from 'react-redux';

import _ from 'lodash';

class ChannelsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channels: [],
            filteredChannels: [],
            isLoading: true,
            isRefreshing: false,
            filter: '',
        }
    }

    async componentDidMount() {
        
        this.getChannels();

    }

    async getLastMessage(channel_id){
        
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'mail.channel',
            method: 'channel_fetch_preview',
            args: [channel_id]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success){
            
            const aux = response.data[0];

            const regex = /(<([^>]+)>)/ig;

            let full_date = aux.last_message.date;
            let date = full_date.split(' ');
            let days = date[0].split('-');

            const msg = {
                body: aux.last_message.body.replace(regex, ''),
                author: aux.last_message.author_id[1],
                date: days[2] + '-' + days[1] + '-' + days[0] + ' ' + date[1]
            };

            return msg
        
        } else{
            
            return {}
        
        }
    }

    getChannels(){
        
        var params = {
            domain: [
                ['id', '>=', '0'],
            ],
            fields: [
                'id',
                'display_name',
                'description',
                'image'
            ],
        };

        this.props.odoo.search_read('mail.channel', params)
            .then(response => {
                
                if (response.success){
                    
                    const size = response.data.length;

                    for (let i = 0; i < size; i++) {

                        const aux = response.data[i];

                        this.getLastMessage(parseInt(aux.id))
                            .then(last_message => {

                                const channel = {
                                    id: aux.id,
                                    name: '#' + aux.display_name,
                                    description: aux.description,
                                    image: aux.image,
                                    last_message: last_message
                                };
        
                                this.setState({
                                    channels: [...this.state.channels, channel],
                                    filteredChannels: [...this.state.filteredChannels, channel]
                                })

                        })
                    
                    }

                }
            }).then(() => {
                this.setState({
                    isLoading: false,
                    isRefreshing: false
                });
            })
    }

    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.name}
                titleStyle={{fontWeight: 'bold'}}
                subtitle={item.last_message.author + ':' + item.last_message.body + '\n(' + item.last_message.date + ')'}
                leftAvatar={this.channelImage(item.image)}
                chevron
                onPress={() => (
                    this.props.navigation.navigate('ChannelScreen',{item})
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
            width: '95%',
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

        if(!this.state.isLoading) {
            return null;
        }

        return (
            <View style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#ced0ce'
            }}>
                <ActivityIndicator
                    size={'large'}
                    color={'#ced0ce'}
                />
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
        () => {
            this.getChannels()
        });
    };

    render() {

        return (
            <View>
                <FlatList
                    keyExtractor={item => item.id}
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

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChannelsScreen);