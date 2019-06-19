import React, {Component} from 'react';
import {connect} from 'react-redux';
import CustomText from "../CustomText";
import {Ionicons,} from "@expo/vector-icons";
import {
    View,
    Text,
    FlatList,
    ScrollView,
    StyleSheet,
    BackHandler
} from 'react-native';
import 'moment/locale/pt'
import ConvertTime from "../ConvertTime";
import Loader from "../screens/Loader";
import {Card} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import {
    ListItem,
    Avatar
} from 'react-native-elements';

import {headerTitle, closeButton} from "../navigation/HeaderComponents";



class ChatDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: {},
            partners: [],
            isLoading: true,
            isComplete: false,
            partner_ids: [],
            partners_fetched: [],
            loading: false
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff',
            navigation.state.params.channel_type === 'channel' ?
                "DETALHES DO CANAL" :
                "DETALHES DA CONVERSA"
        ),
        headerLeft:
            <Ionicons
                name="md-arrow-back"
                size={28}
                color={'#ffffff'}
                style={{paddingLeft: 20}}
                onPress = {() => {
                    navigation.state.params.onReturn();
                    navigation.goBack();
                }}
            />
        /*
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
         */
    });

    async componentDidMount(){

        let params = {
            domain: [
                ['id', '=', this.props.navigation.state.params.channel_id],
            ],
            fields: ['image', 'channel_partner_ids', 'description', 'write_date']
        };
        
        const response = await this.props.odoo.search_read('mail.channel', params);
        if (response.success && response.data.length > 0){
            
            const data = response.data[0];

            const image = data.image;
            const partner_ids = data.channel_partner_ids;
            const description = data.description;
            const created = data.write_date;

            const convertTime = new ConvertTime();
            convertTime.setDate(created);
            const date = convertTime.getTimeObject();

            const channel_info = {
                image: image,
                partner_ids: partner_ids,
                description: description,
                created: date.date + ' às ' + date.hour,
                type: this.props.navigation.state.params.channel_type,
                name: this.props.navigation.state.params.channel_name
            };

            await this.setState({
                channel: channel_info,
                partner_ids: partner_ids
            });

            await this.handlePartners()
        }

        await this.setState({
            isLoading: false
        })
    }

    async handlePartners() {

        if (!this.state.isComplete && !this.state.loading){

            console.log('fetching...');

            await this.setState({loading: true});

            const params = {
                domain: [
                    ['partner_id', 'in', this.state.partner_ids],
                    ['partner_id', 'not in', this.state.partners_fetched]
                ],
                fields: ['image', 'display_name', 'id', 'partner_id'],
                order: 'display_name ASC',
                limit: 20
            };

            const response = await this.props.odoo.search_read('res.users', params)
            if (response.success && response.data.length > 0){
                await this.setState(state => ({
                    partners: [
                        ...state.partners,
                        ...response.data
                    ],
                    partners_fetched: [
                        ...state.partners_fetched,
                        ...response.data.map(partner => {return partner.partner_id[0]})
                    ]
                }));
            } else {
                await this.setState({isComplete: true});
            }

            await this.setState({loading: false});
        }
    }

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        let partnerAvatar;
        if (item.image)
            partnerAvatar = (
                <Avatar
                    rounded
                    source={{
                        uri: `data:image/png;base64,${item.image}`,
                    }}
                    size="small"
                />
            );
        else
            partnerAvatar = (
                <Avatar
                    rounded
                    source={require('../../../assets/user-account.png')}
                    size="small"
                />
            );

        return (
            <ListItem
                title={item.display_name}
                leftAvatar={partnerAvatar}
            />
        );
    };
    
    render() {

        let img;
        if (this.state.channel.image) {
            img = (
                <Avatar
                    rounded
                    source={{
                        uri: `data:image/png;base64,${this.state.channel.image}`,
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
            <View style={styles.container}>
                <Loader isLoading={this.state.isLoading}/>
                <Animatable.View animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title={'   ' + this.state.channel.name}
                            subtitle={(this.state.channel.type === 'channel') ?
                                '    Canal de conversa de grupo' :
                                '    Canal de mensagens diretas'
                            }
                            left={() => img}
                        />
                        <Card.Content>
                            {this.state.channel.description &&
                                <View style={{marginTop: 10}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Descrição</Text>
                                    <View style={{
                                        borderRadius: 5,
                                        justifyContent: 'center'
                                    }}>
                                        <Text>{this.state.channel.description}</Text>
                                    </View>
                                </View>
                            }
                            <View style={{marginTop: 10}}>
                                <Text style={{fontSize: 18, fontWeight: '400'}}>Data de criação</Text>
                                <View style={{
                                    borderRadius: 5,
                                    justifyContent: 'center'
                                }}>
                                    <Text>{this.state.channel.created}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                    <View style={{marginTop: 10}}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionText}>
                                {'Utilizadores (' + this.state.partner_ids.length + ')'}
                            </Text>
                        </View>
                        <FlatList
                            keyExtractor={item => item.partner_id + item.display_name}
                            data={this.state.partners}
                            renderItem={this.renderItem}
                            onEndReached={async () => await this.handlePartners()}
                            onEndReachedThreshold={0.1}
                        />
                    </View>
                </Animatable.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#ad2e53',
        borderBottomWidth: 2,
        marginHorizontal: 20,
        padding: 5,
        marginBottom: 5
    },
    sectionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ad2e53',
    },
});

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChatDetails);