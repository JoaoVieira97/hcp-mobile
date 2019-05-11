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

class ChatDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel: {},
            partners: [],
            isLoading: true,
        }
    }

    static navigationOptions = ({navigation}) => ({
        
        headerTitle:<CustomText
                type={'bold'}
                children={(navigation.state.params.channel_type == 'channel') ? 
                        "Detalhes do canal" : 
                        "Detalhes da conversa"}
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
                navigation.state.params.onReturn();
                navigation.goBack();
            }}
        />
    });

    async componentDidMount(){

        BackHandler.addEventListener('hardwareBackPress', () => {
            this.props.navigation.state.params.onReturn();
            this.props.navigation.goBack();
            return true;
        });

        var params = {
            domain: [
                ['id', '=', this.props.navigation.state.params.channel_id],
            ],
            fields: ['image', 'channel_partner_ids', 'description', 'write_date']
        };
        
        const response = await this.props.odoo.search_read('mail.channel', params)

        if (response.success){
            
            const data = response.data[0]

            const image = data.image
            const partner_ids = data.channel_partner_ids
            const description = data.description
            const created = data.write_date

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
            }

            await this.setState({
                channel: channel_info
            })

            var params2 = {
                domain: [
                    ['partner_id', 'in', partner_ids]
                ],
                fields: ['image', 'display_name', 'id'],
                order: 'display_name'
            };

            const response2 = await this.props.odoo.search_read('res.users', params2)

            if (response2.success){

                await this.setState({
                    partners: response2.data
                })

            }
        }

        await this.setState({
            isLoading: false
        })

    }

    async componentWillMount(){

        BackHandler.removeEventListener('hardwareBackPress');

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
                            subtitle={(this.state.channel.type == 'channel') ?
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
                            <View style={{maxHeight: 300, marginTop: 20}}>
                                <Text style={{fontSize: 18, fontWeight: '400'}}>
                                    Utilizadores participantes ({this.state.partners.length})
                                </Text>
                                <ScrollView>
                                    <FlatList
                                        keyExtractor={item => item.id + item.display_name}
                                        data={this.state.partners}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Sem participantes.</Text>
                                        )}
                                    />
                                </ScrollView>
                            </View>
                        </Card.Content>
                    </Card>
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
});

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChatDetails);