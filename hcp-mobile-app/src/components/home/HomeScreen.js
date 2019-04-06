import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import {connect} from 'react-redux';
import {LinearGradient} from 'expo';
import {colors} from "../../styles/index.style";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";

class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: null,
            image: null,
            roles: [],
            // slider state
            entries: [],
            activeSlide: 0,
        }
    }

    async componentDidMount() {

        this.setState({
            'name': this.props.user.name,
            'image': this.props.user.image,
            'roles': []
        });

        await this.fetchEvents();
    }

    /**
     * Fetch future events. All events are associated to the current user id.
     * Display the first 5 events from now.
     * @returns {Promise<void>}
     */
    async fetchEvents() {

        // Get today using "xxxx-xx-xx" format
        const nowDate = new Date().toJSON().slice(0,10);

        const event_params = {
            domain: [
                //['atletas', '=', this.props.user.id],7
                ['treinador', '=', ''],
                ['start_datetime', '>=', nowDate],
            ],
            //fields: ['evento_ref'],
            order: 'start_datetime ASC',
            limit: 5
        };

        const response = await this.props.odoo.search_read('ges.evento_desportivo', event_params);
        //console.log(response);

        /*
        if (events.success) {

            const events_to_request = [];
            for (let i=0; i<events.data.length; i++){
                let event = events.data[i];
                let id_event = (event.evento_ref.split(","))[1];
                let type_event = (event.evento_ref.split(","))[0];

                events_to_request.push({
                    id: id_event,
                    type: type_event
                });
            }

            await this.parseEvents(events_to_request);
        }
        */
    }

    async parseEvents(events_to_request){

        let newEntries = [];
        for (let i=0; i<events_to_request.length; i++){
            let e = events_to_request[i];

            if (e.type === 'ges.jogo'){ //GAME
                const get_game = {
                    ids: [parseInt(e.id)],
                    fields: ['id', 'local', 'start_datetime', 'equipa_adversaria', 'description'],
                };
                let game = (await this.props.odoo.get('ges.jogo', get_game)).data[0];

                let description = game.description;
                let opponent = game.equipa_adversaria[1];
                let startTime = game.start_datetime;
                let startTimeDate = (startTime.split(" "))[0];
                let startTimeHour = (startTime.split(" "))[1];
                let localId = game.local[0];
                let local_name = game.local[1];

                newEntries.push({
                    type: 0,
                    title: description,
                    time: 'Início ' + startTimeHour,
                    description: 'Adversário: ' + opponent,
                    local: localId,
                    localName: local_name,
                    date: startTimeDate
                });
            }
            else { //TRAINING
                const get_training = {
                    ids: [parseInt(e.id)],
                    fields: ['id','display_name','start_datetime','description','duracao','local'],
                };
                let training = (await this.props.odoo.get('ges.treino', get_training)).data[0];

                let description = training.display_name;
                let duration = training.duracao;
                let startTime = training.start_datetime;
                let startTimeDate = (startTime.split(" "))[0];
                let startTimeHour = (startTime.split(" "))[1];
                let localId = training.local[0];
                let local_name = training.local[1];

                newEntries.push({
                    type: 1,
                    title: description,
                    time: 'Início: ' + startTimeHour.slice(0,5) + 'h',
                    description: 'Duração: ' + duration + ' min',
                    local: localId,
                    localName: local_name,
                    date: startTimeDate
                });
            }
        }
        this.setState({
            entries: newEntries
        })
    }

    _renderItem ({item, index}) {

        let titleColor = (item.type == 0) ? colors.gameColor : colors.trainingColor;
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
                                source={require('../img/hoquei-home-icon.png')}
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

    get pagination () {
        const { entries, activeSlide } = this.state;
        return (
            <Pagination
                dotsLength={entries.length}
                activeDotIndex={activeSlide}
                containerStyle={{
                    //backgroundColor: '#000',
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

    render() {

        const displayRoles = this.state.roles.map((data, index) => {
            return (
                <CustomText
                    key={data.key}
                    children={data.name}
                    type={'normal'}
                    style={{
                        color: '#fff',
                        marginBottom: 2
                    }}
                />
            );
        });

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
                        autoplay
                        autoplayDelay={2000}
                        autoplayInterval={2500}
                        // layout={'tinder'} // layout={'stack'}
                        // layoutCardOffset={18}
                        renderItem={this._renderItem.bind(this)}
                        sliderWidth={sliderWidth}
                        itemWidth={itemWidth}
                        data={this.state.entries}
                        onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                    />
                    <View>
                        {displayRoles}
                    </View>
                    <Image style={{ width: 150, height: 100, marginVertical: 20}}
                           source={{uri: `data:image/png;base64,${this.state.image}`}}/>
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
