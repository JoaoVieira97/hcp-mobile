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
import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import { 
    LinearGradient,
    Constants
} from 'expo';
import store from '../../redux/store';

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
import ChatDetails from "../chat/ChatDetails";
import EchelonsScreen from "../athletes/EchelonsScreen";
import TrainingInvitations from "../invitations/trainings/TrainingInvitations";
import GameInvitations from "../invitations/games/GameInvitations";
import OpenedTrainingInvitations from "../invitations/trainings/OpenedTrainingInvitations";
import ChildesScreen from "../father/ChildesScreen";
import ChildScreen from "../father/ChildScreen";
import AthleteInjuriesTypes from "../athletes/injuries/AthleteInjuriesTypes";
import AthleteInjuries from "../athletes/injuries/AthleteInjuries";
import AthleteInjury from "../athletes/injuries/AthleteInjury";
import OpenedGames from "../management/games/OpenedGames";
import OpenedGame from "../management/games/OpenedGame";
import PendingGames from "../management/games/PendingGames";
import PendingTraining from "../management/trainings/PendingTraining";
import ChangeAthletesAvailabilities from "../management/ChangeAthletesAvailabilities";
import ClosedTrainings from "../management/trainings/ClosedTrainings";
import ChangeAthletesPresences from "../management/ChangeAthletesPresences";
import ChangeLateAthletes from "../management/ChangeLateAthletes";

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

        const device = Constants.deviceName;
        const params = {
            kwargs: {
                context: store.getState().odoo.odoo.context,
            },
            model: 'res.users',
            method: 'remove_token',
            args: [store.getState().user.id, device]
        };

        await store.getState().odoo.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

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

// ---------------------------------------------------------------------
// HEADER SETTINGS
// ---------------------------------------------------------------------

const linearGradientHeader = () => {
    return (
        <LinearGradient
            colors={[colors.gradient1, colors.gradient2]}
            style={{ flex: 1 }}
            start={[0, 0]}
            end={[0.8, 0]}
        />
    );
};

const openDrawerButton = (color, navigation) => {
    return (
        <TouchableOpacity style={{
            width: 50,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 10}} onPress = {() => navigation.openDrawer()}>
            <Ionicons
                name="md-menu"
                size={28}
                color={color}/>
        </TouchableOpacity>
    );
};

const headerTitle = (color, title) => {
    return (
        <CustomText
            type={'bold'}
            numberOfLines={1}
            ellipsizeMode='tail'
            children={title}
            style={{
                color: color,
                fontSize: 16
            }}
        />
    );
};




// ---------------------------------------------------------------------
// STACKS
// ---------------------------------------------------------------------

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
            headerTitle: headerTitle(colors.redColor,'INÍCIO'),
            headerLeft: openDrawerButton(colors.redColor, navigation)
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
            headerTitle: headerTitle('#fff', 'CALENDÁRIO'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
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
            headerTitle: headerTitle('#fff', 'CONVOCATÓRIAS'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
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
    PendingTrainings: {screen: PendingTrainings},
    PendingTraining: {screen: PendingTraining},
    OpenedGames: {screen: OpenedGames},
    OpenedGame: {screen: OpenedGame},
    PendingGames: {screen: PendingGames},
    ClosedTrainings: {screen: ClosedTrainings},
    ChangeAthletesAvailabilities: {screen: ChangeAthletesAvailabilities},
    ChangeAthletesPresences: {screen: ChangeAthletesPresences},
    ChangeLateAthletes: {screen: ChangeLateAthletes}
}, {
    initialRouteName: 'ManagementNavigator',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle: headerTitle('#fff', 'GESTÃO'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
        }
    }
});

// ATHLETES STACK
const AthletesStackNavigator = createStackNavigator({
    EchelonsScreen: {screen: EchelonsScreen},
    AthletesScreen: {screen: AthletesScreen},
    AthleteScreen: {screen: AthleteScreen},
    AthleteInjuriesTypesScreen: {screen: AthleteInjuriesTypes},
    AthleteInjuriesScreen:  {screen: AthleteInjuries},
    AthleteInjuryScreen: {screen: AthleteInjury}
}, {
    initialRouteName: 'EchelonsScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle: headerTitle('#fff', 'ATLETAS'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
        }
    }
});

// PROFILE STACK
const ProfileStackNavigator = createStackNavigator({
    ProfileScreen: {screen: ProfileScreen},
    ResetPassword: {screen: ResetPassword},
    ProfileInjuriesTypesScreen: {screen: AthleteInjuriesTypes},
    ProfileInjuriesScreen:  {screen: AthleteInjuries},
    ProfileInjuryScreen: {screen: AthleteInjury}
}, {
    initialRouteName: 'ProfileScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle: headerTitle('#fff', 'PERFIL'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
        }
    }
});

// CHAT STACK
const ChatStackNavigator = createStackNavigator({
    ChannelsScreen: {screen: ChannelsScreen},
    ConcreteChat: {screen: ConcreteChat},
    DirectMessageScreen: {screen: DirectMessageScreen},
    JoinChannel: {screen: JoinChannel},
    ChatDetails: {screen: ChatDetails}
}, {
    initialRouteName: 'ChannelsScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle: headerTitle('#fff', 'CHAT'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
        }
    }
});

// CHILDREN STACK
const ChildrenStackNavigator = createStackNavigator({
    ChildesScreen: {screen: ChildesScreen},
    ChildScreen: {screen: ChildScreen},
    ChildInjuriesTypesScreen: {screen: AthleteInjuriesTypes},
    ChildInjuriesScreen:  {screen: AthleteInjuries},
    ChildInjuryScreen: {screen: AthleteInjury}
}, {
    initialRouteName: 'ChildesScreen',
    defaultNavigationOptions: ({navigation}) => {
        return {
            headerTitle: headerTitle('#fff', 'FILHOS'),
            headerBackground: linearGradientHeader(),
            headerLeft: openDrawerButton('#fff', navigation)
        }
    }
});



// ---------------------------------------------------------------------
// DRAWER NAVIGATOR SETTINGS
// ---------------------------------------------------------------------

const drawerTitle = (title) => {
    return (
        <View style={{marginVertical: 15}}>
            <CustomText
                type={'bold'}
                children={title}
                style={{
                    fontSize: 16
                }}
            />
        </View>
    );
};

const drawerNavigatorFullStacks = {
    HomeStack: {
        screen: HomeStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Início'),
            drawerIcon: <Entypo
                name="home"
                size={25}
                color={'#000'}
            />
        })
    },
    CalendarStack: {
        screen: CalendarStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Calendário'),
            drawerIcon: <Ionicons
                name="md-calendar"
                size={28}
                color={'#000'}
            />
        })
    },
    InvitationsStack: {
        screen: InvitationsStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Convocatórias'),
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={28}
                color={'#000'}
            />
        })
    },
    ManagementStack: {
        screen: ManagementStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Gestão'),
            drawerIcon: <Ionicons
                name="md-clipboard"
                size={28}
                color={'#000'}
            />
        })
    },
    AthletesStack: {
        screen: AthletesStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Atletas'),
            drawerIcon: <Ionicons
                name="md-people"
                size={29}
                color={'#000'}
            />
        })
    },
    ProfileStack: {
        screen: ProfileStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Perfil'),
            drawerIcon: <Ionicons
                name="md-person"
                size={27}
                color={'#000'}
            />
        })
    },
    ChatStack: {
        screen: ChatStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Chat'),
            drawerIcon: <Ionicons
                name="md-chatboxes"
                size={27}
                color={'#000'}
            />
        })
    },
    ChildesStack: {
        screen: ChildrenStackNavigator,
        navigationOptions: ({
            drawerLabel: drawerTitle('Filhos'),
            drawerIcon: <FontAwesome
                name="child"
                size={27}
                color={'#000'}
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
    ChildesStack: drawerNavigatorFullStacks['ChildesStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'ChildesStack', 'CalendarStack', 'ProfileStack', 'ChatStack'],
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
    ChildesStack: drawerNavigatorFullStacks['ChildesStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'CalendarStack', 'InvitationsStack', 'ProfileStack', 'ChildesStack', 'ChatStack'],
});

const FatherAndCoachOrSecretaryDrawerNavigator = createDrawerNavigator({
    HomeStack: drawerNavigatorFullStacks['HomeStack'],
    ChildesStack: drawerNavigatorFullStacks['ChildesStack'],
    CalendarStack: drawerNavigatorFullStacks['CalendarStack'],
    ManagementStack: drawerNavigatorFullStacks['ManagementStack'],
    AthletesStack: drawerNavigatorFullStacks['AthletesStack'],
    ProfileStack: drawerNavigatorFullStacks['ProfileStack'],
    ChatStack: drawerNavigatorFullStacks['ChatStack']
}, {
    ...drawerNavigatorDefaultSettings,
    initialRouteName: 'HomeStack',
    order: ['HomeStack', 'ChildesStack', 'CalendarStack', 'ManagementStack', 'AthletesStack', 'ProfileStack', 'ChatStack'],
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
    AthleteAndFatherStack: {screen: AthleteAndFatherDrawerNavigator},
    FatherAndCoachOrSecretaryStack: {screen: FatherAndCoachOrSecretaryDrawerNavigator}
}, {
    initialRouteName: 'AuthenticationLoading',
});

export default createAppContainer(AppSwitchNavigator);
