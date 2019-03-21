import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    Text,
    Dimensions,
} from 'react-native';
import {connect} from 'react-redux';
import {LinearGradient} from 'expo';
import {colors} from "../../styles/index.style";
import Carousel, { Pagination } from 'react-native-snap-carousel';
import CustomText from "../CustomText";

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
                    <Image
                        source={require('../../../assets/test.png')}
                        style={{width: '100%', height: '60%', opacity: 0.8}}>
                    </Image>
                    <Text>
                        {item.title}
                    </Text>
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
                <View>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        {
                            /*
                        <Image
                            resizeMode={'cover'}
                            style={{ height: 80, width: 80}}
                               source={require('../../../assets/logo.png')}/>
                        */
                        }
                        <CustomText
                            children={'Eventos'}
                            type={'semi-bold'}
                            style={{
                                color: '#fff',
                                marginBottom: 8
                            }}
                        />
                    </View>
                    { this.pagination }
                    <Carousel
                        layout={'tinder'} // layout={'stack'}
                        layoutCardOffset={18}
                        renderItem={this._renderItem}
                        sliderWidth={sliderWidth}
                        itemWidth={itemWidth}
                        data={this.state.entries}
                        onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                    />
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        {displayRoles}
                    </View>
                </View>
            </LinearGradient>
            /*
                <View style={styles.container}>
                    <Text style={{fontWeight: '700', fontSize: 20}}>{this.state.name}</Text>
                    <Image style={{ width: 150, height: 100, marginVertical: 20}}
                           source={{uri: `data:image/png;base64,${this.state.image}`}}/>
                </View>
            */
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
const itemHeight = viewportHeight * 0.45; //300
// Outside Border Radius
const entryBorderRadius = 15;


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width: itemWidth,
        height: itemHeight,
        //paddingLeft: horizontalMargin,
        //paddingRight: 30,
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 50,
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
