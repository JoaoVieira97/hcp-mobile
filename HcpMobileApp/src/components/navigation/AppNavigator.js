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
import TrainingScreen from "../screens/TrainingScreen";
import GameScreen from "../screens/GameScreen";
import AthletesScreen from "../screens/AthletesScreen";
import AthleteScreen from '../screens/AthleteScreen';
import OpenedTrainings from "../screens/Trainings/OpenedTrainings";
import EventScreen from "../screens/EventScreen";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e4e4e4'
        //backgroundColor: '#d7e8ff'
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
        paddingLeft: 20,
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
        color: '#ad2e53',
        textAlign: 'left',
    },
    content: {
        flex: 1,
        paddingTop: 10,
        paddingBottom: 250,
    },
    footer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        //backgroundColor: '#e2e2e2',
        //borderTopWidth: 1,
        //borderTopColor: '#777777'

    },
    logoutText: {
        flex: 1,
        textAlign: 'left',
        marginLeft: 20,
        marginRight: 15,
        fontSize: 16,
        color: '#7a7a7a'
    },
    logoutIcon: {
        flex: 1,
        textAlign: 'right',
        marginRight: 20,
        color: '#7a7a7a'
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
                color="black"
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
                color="black"
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
    OpenedTrainings: {screen: OpenedTrainings}
}, {
    initialRouteName: 'ManagementNavigator',
    navigationOptions: ({navigation}) => {

        const { routeName } = navigation.state.routes[navigation.state.index];

        switch (routeName) {

            case 'ManagementNavigator':
            {
                return {
                    headerTitle: 'Gestão'
                }
            }
            case 'OpenedTrainings':
            {
                return {
                    headerTitle: 'Treinos em aberto',
                    headerLeft: <Ionicons
                        name="md-arrow-back"
                        size={30}
                        color="black"
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
            title: 'Gestão',
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={30}
                color="black"
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
                color="black"
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
                color="black"
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
                        {
                            /*
                            <View style={styles.textView}>
                                <Text style={styles.text}>Username</Text>
                            </View>
                             */
                        }
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
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack'],
    //drawerBackgroundColor: '#c9ff59',
    drawerWidth: WIDTH*0.75,
    contentComponent: CustomDrawerContentComponent,
    contentOptions: {
        activeTintColor: '#ad2e53',
        activeBackgroundColor: '#debec8',
        //inactiveTintColor: '#31e930',
        //inactiveBackgroundColor: '#62e9cc',
        itemsContainerStyle: {
            marginVertical: 0,
        },
        iconContainerStyle: {
            opacity: 1
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
