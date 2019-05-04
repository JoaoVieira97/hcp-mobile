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
import { Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
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

const userAvatar = (
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
            size={30}
            color={'#fff'}
            style={{backgroundColor: '#fff'}}
            source={require('../../../assets/user-account.png')} />
    </View>
);

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
            ),
            headerRight: (
                <TouchableOpacity
                    onPress = {() => navigation.navigate('ProfileStack')}
                    style={{
                        width:42,
                        height:42,
                        alignItems:'center',
                        justifyContent:'center',
                        marginRight: 10}}>
                    {userAvatar}
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
        activeTintColor: '#ad2e53',
        inactiveTintColor: '#5f5f5f',
        pressColor: '#551726',
        showIcon: false,
        style: {
            backgroundColor: '#debec8',
            //shadowRadius: 0,
            //elevation: 0
        },
        indicatorStyle: {
            backgroundColor: '#ad2e53',
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
        activeTintColor: '#ad2e53',
        inactiveTintColor: '#5f5f5f',
        pressColor: '#551726',
        showIcon: false,
        style: {
            backgroundColor: '#debec8',
            //shadowRadius: 0,
            //elevation: 0
        },
        indicatorStyle: {
            backgroundColor: '#ad2e53',
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
    DirectMessageScreen: {screen: DirectMessageScreen}
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

// FULL - DRAWER NAVIGATOR
const AppDrawerNavigator = createDrawerNavigator({
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
}, {
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'InvitationsStack' ,'ManagementStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
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

// ATHLETE - DRAWER NAVIGATOR
const AthleteDrawerNavigator = createDrawerNavigator({
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
}, {
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'InvitationsStack', 'ProfileStack', 'ChatStack'],
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

// COACH - DRAWER NAVIGATOR
const CoachDrawerNavigator = createDrawerNavigator({
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
}, {
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
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

// SECRETARY - DRAWER NAVIGATOR
const SecretaryDrawerNavigator = createDrawerNavigator({
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
}, {
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
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

// FATHER - DRAWER NAVIGATOR
const FatherDrawerNavigator = createDrawerNavigator({
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
}, {
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'ProfileStack', 'ChatStack'],
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


// APPLICATION
const AppSwitchNavigator = createSwitchNavigator({
    AuthenticationLoading: {screen: AuthenticationLoading},
    Authentication: {screen: LoginScreen},
    AppStack: {screen: AppDrawerNavigator},
    AthleteStack: {screen: AthleteDrawerNavigator},
    CoachStack: {screen: CoachDrawerNavigator},
    SecretaryStack: {screen: SecretaryDrawerNavigator},
    FatherStack: {screen: FatherDrawerNavigator},
}, {
    initialRouteName: 'AuthenticationLoading',
});

export default createAppContainer(AppSwitchNavigator);
