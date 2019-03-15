import React from 'react';
import {
    Dimensions,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    AsyncStorage,
    Text,
    StyleSheet
} from 'react-native';

import {
    createDrawerNavigator,
    createAppContainer,
    createStackNavigator,
    createSwitchNavigator,
    createMaterialTopTabNavigator,
    DrawerItems
} from 'react-navigation';

import { fromRight, fromBottom } from 'react-navigation-transitions';
import { Ionicons } from '@expo/vector-icons';

import AuthenticationLoading from "../authentication/AuthenticationLoading";
import LoginScreen from '../authentication/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrainingScreen from "../management/trainings/TrainingScreen";
import GameScreen from "../management/games/GameScreen";
import AthletesScreen from "../screens/AthletesScreen";
import AthleteScreen from '../screens/AthleteScreen';
import OpenedTrainings from "../management/trainings/OpenedTrainings";
import EventScreen from "../screens/EventScreen";
import PendingTrainings from "../management/trainings/PendingTrainings";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e2e2e2'
    },
    header:{
        height: 150,
        //backgroundColor: '#fff',
    },
    headerLogo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 25,
        //borderBottomWidth: 1,
        //borderBottomColor: '#777777',
    },
    imgView: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 20,
    },
    img: {
        height: 100,
        width: 100,
        //borderRadius: 50,
    },
    textView: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    text: {
        fontSize: 15,
        textAlign: 'left',
    },
    content: {
        flex: 1,
        paddingTop: 5,
        paddingBottom: 250,
    },
    footer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',

    },
    logoutText: {
        flex: 1,
        textAlign: 'left',
        marginLeft: 20,
        marginRight: 15,
        fontSize: 16,
        color: '#777777'
    },
    logoutIcon: {
        flex: 1,
        textAlign: 'right',
        marginRight: 20,
        color: '#777777'
    },
});


const WIDTH = Dimensions.get('window').width;


// HOME STACK
const HomeStackNavigator = createStackNavigator({
    HomeScreen: {screen: HomeScreen},
}, {
    transitionConfig: () => fromRight(600),
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color="black"
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
        }
    },
    navigationOptions: ({navigation}) => {

        return {
            title: 'Início',
            drawerIcon: <Ionicons
                name="md-home"
                size={30}
                color={'#000000'}
            />
        }
    }
});

// CALENDAR STACK
const CalendarStackNavigator = createStackNavigator({
    CalendarScreen: {screen: CalendarScreen},
    EventScreen: { screen: EventScreen },
}, {
    transitionConfig: () => fromRight(600),
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color="black"
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
        }
    },
    navigationOptions: ({navigation}) => {

        return {
            title: 'Calendário',
            drawerIcon: <Ionicons
                name="md-calendar"
                size={30}
                color={'#000000'}
            />
        }
    }
});

// MANAGEMENT NAVIGATOR
const ManagementNavigator = createMaterialTopTabNavigator({
    TrainingScreen: { screen: TrainingScreen },
    GameScreen: { screen: GameScreen },
}, {
    initialRouteName: 'TrainingScreen',
    order: ['TrainingScreen', 'GameScreen'],
    tabBarOptions: {
        activeTintColor: '#ad2e53',
        inactiveTintColor: '#5f5f5f',
        pressColor: '#551726',
        showIcon: false,
        style: {
            backgroundColor: '#debec8'
        },
        indicatorStyle: {
            backgroundColor: '#ad2e53'
        }
    }
});


const ManagementSwitchNavigator = createSwitchNavigator({
    ManagementNavigator: {screen: ManagementNavigator},
    OpenedTrainings: {screen: OpenedTrainings},
    PendingTrainings: {screen: PendingTrainings}
}, {
    initialRouteName: 'ManagementNavigator',
    navigationOptions: ({navigation}) => {

        const { routeName } = navigation.state.routes[navigation.state.index];

        switch (routeName) {

            case 'OpenedTrainings':
            {
                return {
                    headerStyle: {
                        backgroundColor: '#232323',
                    },
                    headerTitleStyle: {
                        color: '#cacaca',
                        fontWeight: '500',
                    },
                    headerTitle: 'Convocatórias em aberto',
                    headerLeft: <Ionicons
                        name="md-arrow-back"
                        size={28}
                        color={'#cacaca'}
                        style={{paddingLeft: 20}}
                        onPress = {() => navigation.navigate('ManagementNavigator')}
                    />
                }
            }
            case 'PendingTrainings':
            {
                return {
                    headerStyle: {
                        backgroundColor: '#232323',
                    },
                    headerTitleStyle: {
                        color: '#cacaca',
                        fontWeight: '500',
                    },
                    headerTitle: 'Convocatórias fechadas',
                    headerLeft: <Ionicons
                        name="md-arrow-back"
                        size={28}
                        color={'#cacaca'}
                        style={{paddingLeft: 20}}
                        onPress = {() => navigation.navigate('ManagementNavigator')}
                    />
                }
            }
            default:
                return {
                    headerTitle: 'Gestão'
                }
        }
    }
});

// MANAGEMENT STACK
const ManagementStackNavigator = createStackNavigator({
    ManagementSwitchNavigator: {screen: ManagementSwitchNavigator}
}, {
    initialRouteName: 'ManagementSwitchNavigator',

    transitionConfig: () => fromRight(600),
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerStyle: {
                backgroundColor: '#232323',
            },
            headerTitleStyle: {
                color: '#cacaca',
                fontWeight: '500',
            },
            headerLeft: (
                <View style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    //borderRadius:50,
                    //backgroundColor: '#3e3e3e',
                    marginLeft: 10}}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#cacaca'}
                        onPress = {() => navigation.openDrawer()}/>
                </View>
            )
        }
    },
    navigationOptions: ({navigation}) => {

        return {
            title: 'Gestão',
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={30}
                color={'#000000'}
            />
        }
    }
});

// PROFILE STACK
const AthletesStackNavigator = createStackNavigator({
    AthletesScreen: {screen: AthletesScreen},
    AthleteScreen: {screen: AthleteScreen}
}, {
    initialRouteName: 'AthletesScreen',
    transitionConfig: () => fromBottom(600),
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color="black"
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
        }
    },
    navigationOptions: ({navigation}) => {

        return {
            title: 'Atletas',
            drawerIcon: <Ionicons
                name="md-people"
                size={30}
                color={'#000000'}
            />
        }
    }
});


// PROFILE STACK
const ProfileStackNavigator = createStackNavigator({
    ProfileScreen: {screen: ProfileScreen},
}, {
    transitionConfig: () => fromRight(600),
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color="black"
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
        }
    },
    navigationOptions: ({navigation}) => {

        return {
            title: 'Perfil',
            drawerIcon: <Ionicons
                name="md-person"
                size={30}
                color={'#000000'}
            />
        }
    }
});


const CustomDrawerContentComponent = (props) => {

    async function _logout() {
        await AsyncStorage.clear();
        props.navigation.navigate('Authentication');
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{flex: 1}}>
                <View style={styles.header}>
                    <View style={styles.headerLogo}>
                        <View style={styles.imgView}>
                            <Image style={styles.img} source={require('../../../assets/logo.png')} />
                        </View>
                    </View>
                </View>
                <View style={styles.content}>
                    <DrawerItems {...props} />
                </View>
            </ScrollView>
            <TouchableOpacity
                style={styles.footer}
                onPress={_logout}>
                <Text style={styles.logoutText}>Logout</Text>
                <Ionicons name="md-exit" size={30} style={styles.logoutIcon}
                />
            </TouchableOpacity>
        </View>
    )
};



const AppDrawerNavigator = createDrawerNavigator({
    HomeStack: { screen: HomeStackNavigator },
    CalendarStack: {screen: CalendarStackNavigator},
    ManagementStack: {screen: ManagementStackNavigator},
    ProfileStack: {screen: ProfileStackNavigator},
    AthletesStack: {screen: AthletesStackNavigator}
}, {
    initialRouteName: 'ManagementStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack'],
    //drawerBackgroundColor: '#c9ff59',
    drawerWidth: WIDTH*0.7,
    contentComponent: CustomDrawerContentComponent,
    contentOptions: {
        activeTintColor: '#000000',
        activeBackgroundColor: '#b3b3b3',
        //inactiveTintColor: '#31e930',
        //inactiveBackgroundColor: '#62e9cc',
        itemsContainerStyle: {
            marginVertical: 0,
        },
        iconContainerStyle: {
            opacity: 1,
        },
        labelStyle:{
            fontSize: 16,
            marginLeft: 5
        }
    },
});

// Application switch navigator
const AppSwitchNavigator = createSwitchNavigator({
    AuthenticationLoading: {screen: AuthenticationLoading},
    Authentication: {screen: LoginScreen},
    AppStack: {screen: AppDrawerNavigator},
}, {
    initialRouteName: 'AuthenticationLoading',
});

export default createAppContainer(AppSwitchNavigator);
