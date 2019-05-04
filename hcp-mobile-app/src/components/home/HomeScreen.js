import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ScrollView, Text
} from 'react-native';
import {connect} from 'react-redux';
import {colors} from "../../styles/index.style";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";
import { Permissions, Notifications } from 'expo';
import {Avatar} from "react-native-paper";

class HomeScreen extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            entries: [{
                type: 2,
                title: 'Sem eventos'
            }],
            activeSlide: 0,
            token: {}
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            userAvatar: this.props.user.image
        });
    }

    async componentDidMount() {

        await this.fetchEvents();

        await this.registerForPushNotificationsAsync();
        await this.addUserToken();
    }

    /**
     * Define home navigator.
     */
    static navigationOptions = ({navigation}) => {

        const {params = {}} = navigation.state;

        return ({
            title: 'Treinos',
            headerRight: (
                <TouchableOpacity
                    onPress = {() => navigation.navigate('ProfileStack')}
                    style={{
                        width:42,
                        height:42,
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight: 10}}>
                    <View style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: '#fff',
                        justifyContent: 'center', alignItems: 'center',
                        // Shadow
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}>
                        <Avatar.Image
                            size={32}
                            color={'#fff'}
                            style={{backgroundColor: '#fff'}}
                            source={params.userAvatar ?
                                {uri: `data:image/png;base64,${params.userAvatar}`} :
                                require('../../../assets/user-account.png')
                            } />
                    </View>
                </TouchableOpacity>
            )
        });
    };

    /**
     * Fetch future events. All events are associated to the current user.
     * Display the first 5 events from now.
     * @returns {Promise<void>}
     */
    async fetchEvents() {

        // Create aux domain
        let auxDomain = [];
        for (let i = 0; i < this.props.user.groups.length; i++) {

            const group = this.props.user.groups[i];

            if(group.name === 'Atleta') {
                auxDomain = [...auxDomain, ['atletas', 'in', group.id]];
            }
            else if (group.name === 'Seccionista') {
                auxDomain = [...auxDomain, ['seccionistas', 'in', group.id]];
            }
            else if (group.name === 'Treinador') {
                auxDomain = [...auxDomain, ['treinador', 'in', group.id]];
            }
        }

        // Get today using "xxxx-xx-xx" format
        const now = new Date().toJSON().split('T');
        const nowDate = now[0] + ' ' + now[1].slice(0,8);

        // Define domain
        // (A and B) = & A B
        // (A and (B or C)) = & A or B C
        // (A and (B or C or D)) = & A or B or C D
        let domain = [];
        if (auxDomain.length === 0) {
            domain = [
                '&',
                ['start_datetime', '>=', nowDate],
                ['state', '=', 'convocatorias_fechadas']
            ];
        }
        else if (auxDomain.length === 1) {
            domain = [
                '&',
                '&',
                ['start_datetime', '>=', nowDate],
                ['state', '=', 'convocatorias_fechadas'],
                auxDomain[0]
            ];
        }
        else if (auxDomain.length === 2) {
            domain = [
                '&',
                '&',
                ['start_datetime', '>=', nowDate],
                ['state', '=', 'convocatorias_fechadas'],
                '|',
                auxDomain[0],
                auxDomain[1]
            ];
        }
        else if (auxDomain.length === 3) {
            domain = [
                '&',
                '&',
                ['start_datetime', '>=', nowDate],
                ['state', '=', 'convocatorias_fechadas'],
                '|',
                auxDomain[0],
                '|',
                auxDomain[1],
                auxDomain[2]
            ];
        }

        const params = {
            domain: domain,
            fields: ['evento_ref'],
            order: 'start_datetime ASC',
            limit: 6
        };

        const response = await this.props.odoo.search_read('ges.evento_desportivo', params);
        if (response.success) {

            let trainingsIds = [];
            let gamesIds = [];
            let eventsOrder = [];

            for (let i=0; i<response.data.length; i++) {

                const event = response.data[i].evento_ref.split(",");

                if (event[0] === 'ges.jogo')
                    gamesIds.push(parseInt(event[1]));
                else
                    trainingsIds.push(parseInt(event[1]));

                eventsOrder.push({type: event[0], id: event[1]})
            }

            if (trainingsIds.length > 0 || gamesIds.length > 0)
                await this.parseEvents(trainingsIds, gamesIds, eventsOrder);
        }
    }

    /**
     * Parsing events. Parsing trainings and games.
     * @param trainingsIds
     * @param gamesIds
     * @param eventsOrder
     * @returns {Promise<void>}
     */
    async parseEvents(trainingsIds, gamesIds, eventsOrder) {

        let trainings = [];
        let games = [];
        let finalEvents = [];
        let params = {
            ids: trainingsIds,
            fields: ['id','display_name','start_datetime','duracao','local', 'escalao'],
        };

        // Parsing trainings
        let response = await this.props.odoo.get('ges.treino', params);
        if(response.success && response.data.length > 0) {

            for (let i = 0; i < response.data.length; i++) {

                const training = response.data[i];
                const level = training.escalao[1];
                const date_hour = training.start_datetime.split(' ');
                const date =
                    date_hour[0].slice(8,10) + '/' +
                    date_hour[0].slice(5,7) + '/' +
                    date_hour[0].slice(0,4);
                const hour = date_hour[1].slice(0,5) + 'h';

                trainings = [...trainings, {
                    id: training.id,
                    type: 1,
                    title: 'Treino | ' + level,
                    date: date,
                    time: hour,
                    description: 'Duração: ' + training.duracao + ' min',
                    local: training.local[0],
                    localName: training.local[1],
                }];
            }
        }

        // Parsing games
        params = {
            ids: gamesIds,
            fields: ['id','start_datetime', 'escalao', 'equipa_adversaria', 'local']
        };
        response = await this.props.odoo.get('ges.jogo', params);
        if(response.success && response.data.length > 0) {

            for (let i = 0; i < response.data.length; i++) {

                const game = response.data[i];

                const level = game.escalao[1];
                const opponent = game.equipa_adversaria[1];
                const date_hour = game.start_datetime.split(' ');
                const date =
                    date_hour[0].slice(8,10) + '/' +
                    date_hour[0].slice(5,7) + '/' +
                    date_hour[0].slice(0,4);
                const hour = date_hour[1].slice(0,5) + 'h';
                const localId = game.local[0];
                const local_name = game.local[1];

                games = [...games, {
                    id: game.id,
                    type: 0,
                    title: 'Jogo | ' + level,
                    date: date,
                    time: hour,
                    description: 'Adversário: ' + opponent,
                    local: localId,
                    localName: local_name,
                }];
            }
        }

        eventsOrder.forEach(item => {
            if (item.type === 'ges.treino')
            {
                const training = trainings.find(training => training.id === parseInt(item.id));
                finalEvents.push(training);
            }
            else {
                const game = games.find(game => game.id === parseInt(item.id));
                finalEvents.push(game);
            }
        });

        this.setState({entries: finalEvents})
    }

    /**
     * Render carousel item.
     * @param item
     * @returns {*}
     */
    renderItem ({item}) {

        if(item.type < 2) {
            const backgroundColor = (item.type === 0) ? 'rgba(173, 46, 83, 0.15)' : 'rgba(47,45,59,0.38)';
            const textColor = (item.type === 0) ? colors.redColor : 'rgb(76,76,76)';
            return (
                <View style={styles.slide}>
                    <View style={styles.slideInnerContainer}>
                        <View style={{flex: 1}}>
                            <View style={{
                                height: '85%',
                                paddingLeft: 10,
                                paddingRight: 10,
                                backgroundColor: backgroundColor,
                                alignItems: 'center'
                            }}>
                                <Image
                                    source={require('../../../assets/hoquei-home-icon.png')}
                                    resizeMode={"contain"}
                                    style={{
                                        height: '50%',
                                        width: '50%',
                                        opacity: 0.7
                                    }}
                                />
                                <CustomText
                                    children={item.title}
                                    type={'bold'}
                                    style={{color: textColor, textAlign: 'center', fontSize: 17}}/>
                                <CustomText
                                    children={item.description}
                                    type={'regular'}
                                    style={{color: textColor, textAlign: 'center', marginTop: 6}}/>
                                <CustomText
                                    children={item.date}
                                    type={'regular'}
                                    style={{color: textColor, textAlign: 'center', marginTop: 6}}/>
                                <CustomText
                                    children={item.time}
                                    type={'regular'}
                                    style={{color: textColor, textAlign: 'center', marginTop: 6}}/>
                            </View>
                            <View style={{height: '15%'}}>
                                <TouchableOpacity style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    paddingHorizontal: 20}}
                                                  onPress={() => {
                                                      this.props.navigation.navigate('EventScreen',{item})
                                                  }}>
                                    <View style={{marginRight: 15}}>
                                        <CustomText
                                            children={'Detalhes'}
                                            type={'bold'}
                                            style={{
                                                fontSize: 14,
                                                color: colors.gradient2
                                            }}
                                        />
                                    </View>
                                    <View>
                                        <Ionicons name={"md-arrow-forward"} color={colors.gradient2} size={26}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }
        else {
            return (
                <View style={styles.slide}>
                    <View style={styles.slideInnerContainer}>
                        <View style={{
                            height: '100%',
                            opacity: 0.5,
                            backgroundColor: colors.gradient2,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image
                                source={require('../../../assets/hoquei-home-icon.png')}
                                resizeMode={"contain"}
                                style={{
                                    height: '60%',
                                    width: '60%',
                                }}
                            />
                            <CustomText children={item.title} type={'bold'} style={{color: '#000'}}/>
                        </View>
                    </View>
                </View>
            );
        }
    }

    get pagination () {
        const { entries, activeSlide } = this.state;
        return (
            <Pagination
                dotsLength={entries.length}
                activeDotIndex={activeSlide}
                containerStyle={{
                    height: 15,
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                    marginTop: 5
                }}
                dotStyle={{
                    width: 6,
                    height: 6,
                    borderRadius: 5,
                    marginHorizontal: 8,
                    backgroundColor: colors.gradient2
                }}
                inactiveDotStyle={{
                    backgroundColor: colors.gradient2
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
            />
        );
    };


    sendNotificationJS(){
        let title = "Nova convocatória (JS)"
        let body = "Foste convocado para o jogo deste fim-de-semana"
        fetch('https://exp.host/--/api/v2/push/send', {
            body: JSON.stringify({
                to: this.state.token,
                title: title,
                body: body,
                //data: { message: `${title} - ${body}` },
            }),
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
        });
    }

    async sendNotificationOdoo(){

        let userId = this.props.user.id.toString()

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.notificacao',
            method: 'sendNotification',
            args: [0, userId]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );
        console.log("Pedido de notificação realizado")
    }

    async addUserToken(){
        let userId = this.props.user.id.toString()
        let token = this.state.token.toString()

        console.log(userId)
        console.log(token)

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.notificacao',
            method: 'addUserToken',
            args: [0, userId, token]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );
    }

    async registerForPushNotificationsAsync() {
        const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

        let finalStatus = status;

        if (status !== 'granted'){
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status
        }

        if (finalStatus !== 'granted'){
            return;
        }
        console.log(finalStatus)

        await Notifications.getExpoPushTokenAsync().then( token => {
            this.setState({
                token: token
            })
        }).catch( err => {
            console.log('token err', err)
        })
    }

    render() {
        return (
            <ScrollView
                nestedScrollEnabled={true}
                style={{flex: 1, backgroundColor: colors.grayColor}}>
                <View style={{justifyContent: 'center', paddingTop: 10}}>
                    <CustomText
                        children={'EVENTOS FUTUROS'}
                        type={'bold'}
                        style={{
                            color: '#000',
                            fontSize: 18,
                            marginLeft: 20,
                            textAlign: 'center'
                        }}
                    />
                    { this.pagination }
                    <Carousel
                        enableMomentum={false}
                        decelerationRate={'fast'}
                        renderItem={this.renderItem.bind(this)}
                        sliderWidth={sliderWidth}
                        itemWidth={itemWidth}
                        data={this.state.entries}
                        onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                    />
                    {
                        /*
                        <View style={{marginBottom: 20}}>
                        <Button
                            title={'Enviar notificação Odoo'}
                            color={colors.gradient1}
                            onPress={() => this.sendNotificationOdoo()}
                            style={{marginBottom: 20}}
                        />
                    </View>
                    <View>
                        <Button
                            title={'Enviar notificação JavaScript'}
                            color={colors.gradient1}
                            onPress={() => this.sendNotificationJS()}
                        />
                    </View>
                         */
                    }
                </View>
            </ScrollView>
        );
    }
}


// Slider container width 100%
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
const sliderWidth = viewportWidth;

// Item container
// Inside Item Width
const slideWidth = Math.round(sliderWidth * 0.8);
// Inside Item Margin
// const itemHorizontalMargin = Math.round(sliderWidth * 0.15);
// Outside Item Width
const horizontalMargin = 30;
const itemWidth = slideWidth + horizontalMargin * 2;
// Outside Item Height
const itemHeight = viewportHeight * 0.40; //300
// Outside Border Radius
const entryBorderRadius = 15;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width: itemWidth,
        height: itemHeight,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 20,
        //backgroundColor: '#fff'
    },
    slideInnerContainer: {
        flex: 1,
        width: slideWidth,
        backgroundColor: '#fff', //'#9b6976'
        // border
        borderRadius: entryBorderRadius,
        overflow: 'hidden',
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    }
});


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
