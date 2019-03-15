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
import { LinearGradient } from 'expo';

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
import OpenedTraining from "../management/trainings/OpenedTraining";
import EditOpenedTraining from "../management/trainings/EditOpenedTraining";

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
            headerTitle: 'Início',
            headerBackground: (
                <LinearGradient
                    colors={['#ad2e53', '#2f2d3b']}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerTitleStyle: {
                color: '#ffffff',
                fontWeight: '500',
            },
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color={'#ffffff'}
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
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
            headerTitle: 'Calendário',
            headerBackground: (
                <LinearGradient
                    colors={['#ad2e53', '#2f2d3b']}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerTitleStyle: {
                color: '#ffffff',
                fontWeight: '500',
            },
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color={'#ffffff'}
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
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


// MANAGEMENT STACK
const ManagementStackNavigator = createStackNavigator({
    ManagementNavigator: {screen: ManagementNavigator},
    OpenedTrainings: {screen: OpenedTrainings},
    OpenedTraining: {screen: OpenedTraining},
    EditOpenedTraining: {screen: EditOpenedTraining},
    PendingTrainings: {screen: PendingTrainings}
}, {
    initialRouteName: 'ManagementNavigator',
    //transitionConfig: () => fromRight(350),
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle: 'Gestão',
            headerBackground: (
                <LinearGradient
                    colors={['#ad2e53', '#2f2d3b']}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerTitleStyle: {
                color: '#ffffff',
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
                        color={'#ffffff'}
                        onPress = {() => navigation.openDrawer()}/>
                </View>
            )
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
            headerTitle: 'Atletas',
            headerBackground: (
                <LinearGradient
                    colors={['#ad2e53', '#2f2d3b']}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerTitleStyle: {
                color: '#ffffff',
                fontWeight: '500',
            },
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color={'#ffffff'}
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
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
            headerTitle: 'Perfil',
            headerBackground: (
                <LinearGradient
                    colors={['#ad2e53', '#2f2d3b']}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerTitleStyle: {
                color: '#ffffff',
                fontWeight: '500',
            },
            headerLeft: <Ionicons
                name="md-menu"
                size={30}
                color={'#ffffff'}
                style={{paddingLeft: 20}}
                onPress = {() => navigation.openDrawer()}/>
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
    HomeStack: {
        screen: HomeStackNavigator,
        navigationOptions: ({
            title: 'Início',
            drawerIcon: <Ionicons
                name="md-home"
                size={30}
                color={'#000000'}
            />
        })
    },
    CalendarStack: {
        screen: CalendarStackNavigator,
        navigationOptions: ({
            title: 'Calendário',
            drawerIcon: <Ionicons
                name="md-calendar"
                size={30}
                color={'#000000'}
            />
        })
    },
    ManagementStack: {
        screen: ManagementStackNavigator,
        navigationOptions: ({
            title: 'Gestão',
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={30}
                color={'#000000'}
            />
        })
    },
    AthletesStack: {
        screen: AthletesStackNavigator,
        navigationOptions: ({
            title: 'Atletas',
            drawerIcon: <Ionicons
                name="md-people"
                size={30}
                color={'#000000'}
            />
        })
    },
    ProfileStack: {
        screen: ProfileStackNavigator,
        navigationOptions: ({
            title: 'Perfil',
            drawerIcon: <Ionicons
                name="md-person"
                size={30}
                color={'#000000'}
            />
        })
    }
}, {
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack'],
    drawerWidth: WIDTH*0.7,
    contentComponent: CustomDrawerContentComponent,
    contentOptions: {
        activeTintColor: '#000000',
        activeBackgroundColor: '#b3b3b3',
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
