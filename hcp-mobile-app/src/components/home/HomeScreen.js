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
            entries: [{title:'JOGO 1'}, {title: 'JOGO 2'}, {title: 'JOGO 3'}],
            activeSlide: 0,
        }
    }

    async componentDidMount() {

        this.setState({
            'name': this.props.user.name,
            'image': this.props.user.image,
            'roles': []
        });

        const games_params = {
            domain: [],
            fields: ['id', 'local', 'start_datetime', 'equipa_adversaria', 'description'],
            order: 'start_datetime DESC',
            limit: 5
        };

        const games = await this.props.odoo.search_read('ges.jogo', games_params);

        let newEntries = [];
        for (let i=0; i<games.data.length; i++){

            let game = games.data[i];

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
        this.setState({
            entries: newEntries
        })

        const params = {
            ids: this.props.user.roles,
            fields: ['id', 'full_name'],
        };

        const userRoles = await this.props.odoo.get(
            'res.groups',
            params
        );

        for (let i = 0; i < userRoles.data.length; i++) {

            const info = userRoles.data[i].full_name.split(" / ");

            this.setState({
                roles: [...this.state.roles, {key: i, name: info[1]}]
            });
        }
    }

    _renderItem ({item, index}) {
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
                            <CustomText children={item.title} type={'bold'} style={{color: colors.gameColor}}/>
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
