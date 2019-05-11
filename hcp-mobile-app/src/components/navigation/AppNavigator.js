import React from 'react';
import {
    Dimensions,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    AsyncStorage,
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
import { Ionicons, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo';

import {colors} from "../../styles/index.style";

import AuthenticationLoading from "../authentication/AuthenticationLoading";
import LoginScreen from '../authentication/LoginScreen';
import HomeScreen from '../home/HomeScreen';
import CalendarScreen from '../calendar/CalendarScreen';
import ProfileScreen from '../profile/ProfileScreen';
import TrainingScreen from "../management/trainings/TrainingScreen";
import GameScreen from "../management/games/GameScreen";
import AthletesScreen from "../athletes/AthletesScreen";
import AthleteScreen from '../athletes/AthleteScreen';
import NewTraining from '../management/trainings/NewTraining';
import OpenedTrainings from "../management/trainings/OpenedTrainings";
import EventScreen from "../calendar/EventScreen";
import PendingTrainings from "../management/trainings/PendingTrainings";
import OpenedTraining from "../management/trainings/OpenedTraining";
import EditOpenedTraining from "../management/trainings/EditOpenedTraining";
import CustomText from "../CustomText";
import ResetPassword from "../profile/ResetPassword";
import ChannelsScreen from "../chat/ChannelsScreen";
import ConcreteChat from "../chat/ConcreteChat";
import DirectMessageScreen from "../chat/DirectMessageScreen";
import JoinChannel from "../chat/JoinChannel";
import EchelonsScreen from "../athletes/EchelonsScreen";
import TrainingInvitations from "../invitations/trainings/TrainingInvitations";
import GameInvitations from "../invitations/games/GameInvitations";
import OpenedTrainingInvitations from "../invitations/trainings/OpenedTrainingInvitations";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e2e2e2'
    },
    header:{
        height: 150,
    },
    headerLogo: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 35,
    },
    imgView: {
        flex: 1,
        paddingLeft: 15
    },
    img: {
        height: 100,
        width: 100
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
                        <View style={{marginRight: 15}}>
                            <TouchableOpacity style={{
                                width: 60,
                                height: 50,
                                alignItems: 'flex-end',
                            }} onPress = {() => props.navigation.closeDrawer()}>
                                <Ionicons
                                    name="md-close"
                                    size={30}
                                    color={colors.greyText}/>
                            </TouchableOpacity>
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
                <CustomText type={'semi-bold'} children={'Logout'} style={styles.logoutText} />
                <Ionicons name="md-exit" size={30} style={styles.logoutIcon}/>
            </TouchableOpacity>
        </View>
    )
};




// HOME STACK
const HomeStackNavigator = createStackNavigator({
    HomeScreen: {screen: HomeScreen},
    EventScreen: {screen: EventScreen}
}, {
    initialRouteName: 'HomeScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerStyle: {
                elevation: 0, // remove shadow on Android
                shadowOpacity: 0, // remove shadow on iOS
                backgroundColor: colors.grayColor
            },
            headerTitle: (
                <CustomText
                    type={'bold'}
                    children={'INÍCIO'}
                    style={{
                        color: colors.redColor,
                        fontSize: 16
                    }}
                />
            ),
            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={colors.redColor}/>
                </TouchableOpacity>
            )
        }
    }
});

// CALENDAR STACK
const CalendarStackNavigator = createStackNavigator({
    CalendarScreen: {screen: CalendarScreen},
    EventScreen: { screen: EventScreen },
}, {
    initialRouteName: 'CalendarScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle:
                <CustomText
                    type={'bold'}
                    children={'CALENDÁRIO'}
                    style={{
                        color: '#ffffff',
                        
                        fontSize: 16
                    }}
                />,
            headerBackground: (
                <LinearGradient
                    colors={[colors.gradient1, colors.gradient2]}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),

            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#ffffff'}/>
                </TouchableOpacity>
            )
        }
    }
});


// INVITATIONS NAVIGATOR
const InvitationsNavigator = createMaterialTopTabNavigator({
    TrainingInvitations: { screen: TrainingInvitations },
    GameInvitations: { screen: GameInvitations },
}, {
    initialRouteName: 'TrainingInvitations',
    order: ['TrainingInvitations', 'GameInvitations'],
    tabBarOptions: {
        activeTintColor: colors.redColor,
        inactiveTintColor: '#5f5f5f',
        pressColor: '#551726',
        showIcon: false,
        style: {
            backgroundColor: colors.lightRedColor,
        },
        indicatorStyle: {
            backgroundColor: colors.redColor,
        },
    }
});

// INVITATIONS STACK
const InvitationsStackNavigator = createStackNavigator({
    InvitationsNavigator: {screen: InvitationsNavigator},
    OpenedTrainingInvitations: {screen: OpenedTrainingInvitations},
    EventScreen: {screen: EventScreen},
}, {
    initialRouteName: 'InvitationsNavigator',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle:
                <CustomText
                    type={'bold'}
                    children={'CONVOCATÓRIAS'}
                    style={{
                        color: '#ffffff',
                        fontSize: 16
                    }}
                />,
            headerBackground: (
                <LinearGradient
                    colors={[colors.gradient1, colors.gradient2]}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),

            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#ffffff'}/>
                </TouchableOpacity>
            )
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
        activeTintColor: colors.redColor,
        inactiveTintColor: '#5f5f5f',
        pressColor: '#551726',
        showIcon: false,
        style: {
            backgroundColor: colors.lightRedColor,
        },
        indicatorStyle: {
            backgroundColor: colors.redColor,
        },
    }
});

// MANAGEMENT STACK
const ManagementStackNavigator = createStackNavigator({
    ManagementNavigator: {screen: ManagementNavigator},
    NewTraining: {screen: NewTraining},
    OpenedTrainings: {screen: OpenedTrainings},
    OpenedTraining: {screen: OpenedTraining},
    EditOpenedTraining: {screen: EditOpenedTraining},
    PendingTrainings: {screen: PendingTrainings}
}, {
    initialRouteName: 'ManagementNavigator',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle:
                <CustomText
                    type={'bold'}
                    children={'GESTÃO'}
                    style={{
                        color: '#ffffff',
                        fontSize: 16
                    }}
                />,
            headerBackground: (
                <LinearGradient
                    colors={[colors.gradient1, colors.gradient2]}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),

            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#ffffff'}/>
                </TouchableOpacity>
            )
        }
    }
});

// ATHLETES STACK
const AthletesStackNavigator = createStackNavigator({
    EchelonsScreen: {screen: EchelonsScreen},
    AthletesScreen: {screen: AthletesScreen},
    AthleteScreen: {screen: AthleteScreen}
}, {
    initialRouteName: 'EchelonsScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerStyle: {
                //elevation: 0, // remove shadow on Android
                //shadowOpacity: 0, // remove shadow on iOS
                backgroundColor: colors.grayColor
            },
            headerTitle:
                <CustomText
                    type={'bold'}
                    children={'ATLETAS'}
                    style={{
                        color: '#ffffff',
                        fontSize: 16
                    }}
                />,
            headerBackground: (
                <LinearGradient
                    colors={[colors.gradient1, colors.gradient2]}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),

            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#ffffff'}/>
                </TouchableOpacity>
            )
        }
    }
});

// PROFILE STACK
const ProfileStackNavigator = createStackNavigator({
    ProfileScreen: {screen: ProfileScreen},
    ResetPassword: {screen: ResetPassword},
}, {
    initialRouteName: 'ProfileScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerStyle: {
                //elevation: 0, // remove shadow on Android
                //shadowOpacity: 0, // remove shadow on iOS
                backgroundColor: colors.grayColor
            },
            headerTitle: (
                <CustomText
                    type={'bold'}
                    children={'PERFIL'}
                    style={{
                        color: '#fff',
                        fontSize: 16
                    }}
                />
            ),
            headerTitleStyle: {
                color: '#ffffff',
            },
            headerBackground: (
                <LinearGradient
                    colors={[colors.gradient1, colors.gradient2]}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#ffffff'}/>
                </TouchableOpacity>
            )
        }
    }
});

// CHAT STACK
const ChatStackNavigator = createStackNavigator({
    ChannelsScreen: {screen: ChannelsScreen},
    ConcreteChat: {screen: ConcreteChat},
    DirectMessageScreen: {screen: DirectMessageScreen},
    JoinChannel: {screen: JoinChannel}
}, {
    initialRouteName: 'ChannelsScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerStyle: {
                //elevation: 0, // remove shadow on Android
                //shadowOpacity: 0, // remove shadow on iOS
                backgroundColor: colors.gradient2
            },
            headerTitle:
                <CustomText
                    type={'bold'}
                    children={'CHAT'}
                    style={{
                        color: '#ffffff',
                        fontSize: 16
                    }}
                />,
            headerTitleStyle: {
                color: '#ffffff',
            },
            headerBackground: (
                <LinearGradient
                    colors={[colors.gradient1, colors.gradient2]}
                    style={{ flex: 1 }}
                    start={[0, 0]}
                    end={[0.8, 0]}
                />
            ),
            headerLeft: (
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginLeft: 10}} onPress = {() => navigation.openDrawer()}>
                    <Ionicons
                        name="md-menu"
                        size={30}
                        color={'#ffffff'}/>
                </TouchableOpacity>
            )
        }
    }
});





// ---------------------------------------------------------------------
// DRAWER NAVIGATOR SETTINGS
// ---------------------------------------------------------------------
const drawerNavigatorFullStacks = {
    HomeStack: {
        screen: HomeStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Início'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-home"
                size={28}
                color={'#000000'}
            />
        })
    },
    CalendarStack: {
        screen: CalendarStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Calendário'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-calendar"
                size={28}
                color={'#000000'}
            />
        })
    },
    InvitationsStack: {
        screen: InvitationsStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Convocatórias'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={28}
                color={'#000000'}
            />
        })
    },
    ManagementStack: {
        screen: ManagementStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Gestão'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={28}
                color={'#000000'}
            />
        })
    },
    AthletesStack: {
        screen: AthletesStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Atletas'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-people"
                size={29}
                color={'#000000'}
            />
        })
    },
    ProfileStack: {
        screen: ProfileStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Perfil'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-person"
                size={27}
                color={'#000000'}
            />
        })
    },
    ChatStack: {
        screen: ChatStackNavigator,
        navigationOptions: ({
            drawerLabel:
                <View style={{marginVertical: 15}}>
                    <CustomText
                        type={'bold'}
                        children={'Chat'}
                        style={{
                            fontSize: 16
                        }}
                    />
                </View>,
            drawerIcon: <Ionicons
                name="md-chatboxes"
                size={27}
                color={'#000000'}
            />
        })
    }
};

const drawerNavigatorDefaultSettings = {

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
    }
};


const AppDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    InvitationsStack: drawerNavigatorFullStacks['InvitationsStack'],
    ManagementStack: drawerNavigatorFullStacks['ManagementStack'],
    AthletesStack: drawerNavigatorFullStacks['AthletesStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'InvitationsStack', 'ManagementStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
});

const AthleteDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    InvitationsStack: drawerNavigatorFullStacks['InvitationsStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'InvitationsStack', 'ProfileStack', 'ChatStack'],
});

const CoachAndSecretaryDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    ManagementStack: drawerNavigatorFullStacks['ManagementStack'],
    AthletesStack: drawerNavigatorFullStacks['AthletesStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
});

const FatherDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ProfileStack', 'ChatStack'],
});

const AthleteAndCoachOrSecretaryDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    ManagementStack: drawerNavigatorFullStacks['ManagementStack'],
    InvitationsStack: drawerNavigatorFullStacks['InvitationsStack'],
    AthletesStack: drawerNavigatorFullStacks['AthletesStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'InvitationsStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
});

const AthleteAndFatherDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    InvitationsStack: drawerNavigatorFullStacks['InvitationsStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'InvitationsStack', 'ProfileStack', 'ChatStack'],
});
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------


// APPLICATION
const AppSwitchNavigator = createSwitchNavigator({
    AuthenticationLoading: {screen: AuthenticationLoading},
    Authentication: {screen: LoginScreen},
    AppStack: {screen: AppDrawerNavigator},
    AthleteStack: {screen: AthleteDrawerNavigator},
    CoachAndSecretaryStack: {screen: CoachAndSecretaryDrawerNavigator},
    FatherStack: {screen: FatherDrawerNavigator},
    AthleteAndCoachOrSecretaryStack: {screen: AthleteAndCoachOrSecretaryDrawerNavigator},
    AthleteAndFatherStack: {screen: AthleteAndFatherDrawerNavigator}
}, {
    initialRouteName: 'AuthenticationLoading',
});

export default createAppContainer(AppSwitchNavigator);
