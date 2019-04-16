import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Button
} from 'react-native';
import {connect} from 'react-redux';
import {LinearGradient} from 'expo';
import {colors} from "../../styles/index.style";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";

import { Permissions, Notifications } from 'expo';

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

    async componentDidMount() {

        await this.fetchEvents();

        await this.registerForPushNotificationsAsync();
        await this.addUserToken();
    }

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
        const nowDate = new Date().toJSON().slice(0,10);

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

            for (let i=0; i<response.data.length; i++) {

                const event = response.data[i].evento_ref.split(",");

                if (event[0] === 'ges.jogo')
                    gamesIds.push(parseInt(event[1]));
                else
                    trainingsIds.push(parseInt(event[1]));
            }

            if (trainingsIds.length > 0 || gamesIds.length > 0)
                await this.parseEvents(trainingsIds, gamesIds);
        }
    }

    /**
     * Parsing events. Parsing trainings and games.
     * @param trainingsIds
     * @param gamesIds
     * @returns {Promise<void>}
     */
    async parseEvents(trainingsIds, gamesIds) {

        let events = [];
        let params = {
            ids: trainingsIds,
            fields: ['id','display_name','start_datetime','duracao','local'],
        };

        // Parsing trainings
        let response = await this.props.odoo.get('ges.treino', params);
        if(response.success && response.data.length > 0) {

            for (let i = 0; i < response.data.length; i++) {

                const training = response.data[i];
                events = [...events, {
                    type: 1,
                    title: training.display_name,
                    time: 'Início: ' + (training.start_datetime.split(" "))[1].slice(0,5) + 'h',
                    description: 'Duração: ' + training.duracao + ' min',
                    local: training.local[0],
                    localName: training.local[1],
                    date: (training.start_datetime.split(" "))[0]
                }];
            }
        }

        // Parsing games
        params = {
            ids: gamesIds,
            fields: ['id','start_datetime','equipa_adversaria','description','local']
        };
        response = await this.props.odoo.get('ges.jogo', params);
        if(response.success && response.data.length > 0) {

            for (let i = 0; i < response.data.length; i++) {

                const game = response.data[i];
                events = [...events, {
                    type: 0,
                    title: game.description,
                    time: 'Início ' + (game.start_datetime.split(" "))[1].slice(0,5) + 'h',
                    description: 'Adversário: ' + game.equipa_adversaria[1],
                    local: game.local[0],
                    localName: game.local[1],
                    date: (game.start_datetime.split(" "))[0]
                }];
            }
        }

        this.setState({entries: events})
    }

    /**
     * Render carousel item.
     * @param item
     * @returns {*}
     */
    renderItem ({item}) {

        if(item.type < 2) {
            let titleColor = (item.type === 0) ? colors.gameColor : colors.trainingColor;
            return (
                <View style={styles.slide}>
                    <View style={styles.slideInnerContainer}>
                        <View style={{flex: 1}}>
                            <View style={{
                                height: '85%',
                                opacity: 0.5,
                                backgroundColor: colors.gradient2,
                                alignItems: 'center'
                            }}>
                                <Image
                                    source={require('../../../assets/hoquei-home-icon.png')}
                                    resizeMode={"contain"}
                                    style={{
                                        height: '60%',
                                        width: '60%',
                                    }}
                                />
                                <CustomText children={item.title} type={'bold'} style={{color: titleColor}}/>
                                <CustomText children={item.date + ", " + item.time} style={{color: '#fff'}}/>
                                <CustomText children={item.description} style={{color: '#fff'}}/>
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
                    paddingHorizontal: 0
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

            <LinearGradient
                colors={[colors.gradient1, colors.gradient2]}
                style={styles.container}
                start={[0, 0.2]}
                end={[0, 0.7]}>
                <ScrollView contentContainerStyle={{alignItems: 'center'}}>
                    <CustomText
                        children={'Próximos Eventos'}
                        type={'semi-bold'}
                        style={{
                            color: '#fff',
                            marginBottom: 8
                        }}
                    />
                    { this.pagination }
                    <Carousel
                        /*
                        https://github.com/archriss/react-native-snap-carousel/blob/master/doc/PROPS_METHODS_AND_GETTERS.md
                         */
                        enableMomentum={false}
                        decelerationRate={'fast'}
                        //loop
                        //loopClonesPerSide={3}
                        //autoplay
                        //autoplayDelay={2000}
                        //autoplayInterval={2500}
                        // layout={'stack'}
                        // layoutCardOffset={18}
                        renderItem={this.renderItem.bind(this)}
                        sliderWidth={sliderWidth}
                        itemWidth={itemWidth}
                        data={this.state.entries}
                        onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                    />
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
                </ScrollView>
            </LinearGradient>
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
        backgroundColor: '#9b6976',
        // border
        borderRadius: entryBorderRadius,
        overflow: 'hidden',
        // shadow
        elevation: 7
    }
});


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
