import React from 'react';

import {
    ActivityIndicator,
    View,
    Text,
    Platform
} from 'react-native';

import {
    createAppContainer,
    createSwitchNavigator,
    createStackNavigator,
    createDrawerNavigator
} from 'react-navigation';

import {createMaterialBottomTabNavigator} from "react-navigation-material-bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

import {Font} from 'expo';
import LoginScreen from './src/components/authentication/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import OdooConnection from "./src/components/authentication/OdooConnection";
import OtherScreen from "./src/components/OtherScreen";





export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        }
    }

    async componentDidMount() {

        await Font.loadAsync({
            'Montserrat-Regular': require('./assets/fonts/Montserrat/Montserrat-Regular.ttf'),
            'Montserrat-Bold': require('./assets/fonts/Montserrat/Montserrat-Bold.ttf'),
            'Montserrat-ExtraLight': require('./assets/fonts/Montserrat/Montserrat-ExtraLight.ttf'),
        });

        this.setState({isLoading: true})
    }

    render() {

        return (
            /*
            paddingTop: Platform.OS === 'android' ? 25 : 0
             */
            <View style={{flex: 1, justifyContent: 'center'}}>
                {
                    this.state.isLoading ?
                        (<AppContainer/>) : <ActivityIndicator/>
                }
            </View>
        );
    }
}



const HomeNavigator = createMaterialBottomTabNavigator({
    Home: {screen: HomeScreen, navigationOptions:{
            title: 'Início',
            tabBarIcon: ({ tintColor }) => (
                <Icon name={"ios-home"} color={tintColor} size={26}/>
            ),
            tabBarColor: "#efefef"
        }},
    Calendar: {screen: OtherScreen, navigationOptions:{
            title: 'Calendário',
            tabBarIcon: ({ tintColor }) => (
                <Icon name={"ios-calendar"} color={tintColor} size={26}/>
            ),
            tabBarColor: "#efefef"
        }},
}, {
    initialRouteName: 'Home',
    order: ['Home', 'Calendar'],
    shifting: true,
    activeColor: '#ad2e53',
    inactiveColor: 'grey',
    navigationOptions: ({navigation}) => {
        const { routeName } = navigation.state.routes[navigation.state.index];

        let header = 'Início';
        if (routeName === 'Calendar')
            header = 'Calendário';

        return {
            headerTitle: header
        }
    }
});


const AppStackNavigator = createStackNavigator({
    HomeScreen: {screen: HomeNavigator}
}, {
    defaultNavigationOptions: ({navigation}) => {

        return {
            headerLeft: <Icon
                style={{paddingLeft: 10}}
                name={"ios-menu"}
                size={30}
                onPress = {() => navigation.openDrawer()}
            />
        }
    }
});


const AppDrawerNavigator = createDrawerNavigator({
    AppDrawer: {screen: AppStackNavigator}
});


// Application switch navigator
const AppSwitchNavigator = createSwitchNavigator({
    AuthLoading: {screen: OdooConnection},
    Auth: {screen: LoginScreen},
    AppStack: {screen: AppDrawerNavigator},
}, {
    initialRouteName: 'AuthLoading',
    /* transitionConfig: () => fromLeft(1000), */
});

// Application container
const AppContainer = createAppContainer(AppSwitchNavigator);
