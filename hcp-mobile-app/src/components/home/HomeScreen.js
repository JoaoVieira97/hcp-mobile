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
            entries: [{title: 'Title 1'}, {title: 'Title 2'}, {title: 'Title 3'}],
            activeSlide: 0,
        }
    }

    async componentDidMount() {

        this.setState({
            'name': this.props.user.name,
            'image': this.props.user.image,
            'roles': []
        });

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
                    {/*
                        <Image
                            source={require('../../../assets/test.png')}
                            style={{width: '100%', height: '60%', opacity: 0.8}}>
                        </Image>
                        <Text>
                            {item.title}
                        </Text>
                    */}
                    <View style={{flex: 1}}>
                        <View style={{
                            height: '70%',
                            opacity: 0.8,
                            backgroundColor: colors.gradient2}}>

                        </View>
                        <View style={{height: '30%'}}>
                            <TouchableOpacity style={{
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                paddingHorizontal: 20}}>
                                <View style={{marginRight: 15}}>
                                    <CustomText
                                        children={'Ver mais'}
                                        type={'bold'}
                                        style={{
                                            fontSize: 18,
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
                        children={'Eventos'}
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
                        renderItem={this._renderItem}
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
