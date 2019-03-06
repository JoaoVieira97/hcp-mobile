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
} from 'react-navigation';

import {createMaterialBottomTabNavigator} from "react-navigation-material-bottom-tabs";
import Icon from 'react-native-vector-icons/MaterialIcons';

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
                <Icon name={"home"} color={tintColor} size={24}/>
            ),
            tabBarColor: "#efefef"
        }},
    OtherScreen: {screen: OtherScreen, navigationOptions:{
            title: 'Perfil',
            tabBarIcon: ({ tintColor }) => (
                <Icon name={"person"} color={tintColor} size={24}/>
            ),
            tabBarColor: "#efefef"
        }},
}, {
    initialRouteName: 'Home',
    order: ['Home', 'OtherScreen'],
    shifting: true,
    activeColor: '#ad2e53',
    inactiveColor: 'grey',
    navigationOptions: ({navigation}) => {
        const { routeName } = navigation.state.routes[navigation.state.index];
        return {
            headerTitle: routeName
        }
    }
    /*
    tabBarPosition: 'bottom',
    tabBarOptions: {
        activeTintColor: 'orange',
        inactiveTintColor: 'grey',
        style: {
            backgroundColor: '#f2f2f2'
        },
        indicatorStyle: {
            height: 0
        },
        showIcon: true,
    }
    */
});


const AppStackNavigator = createStackNavigator({
    HomeScreen: {screen: HomeNavigator}
}, {
    defaultNavigationOptions: ({navigation}) => {

        return {
            headerLeft: <Icon style={{paddingLeft: 10}} name={"menu"} size={32}/>
        }
    }
});


// Application switch navigator
const AppSwitchNavigator = createSwitchNavigator({
    AuthLoading: {screen: OdooConnection},
    Auth: {screen: LoginScreen},
    AppStack: {screen: AppStackNavigator},
}, {
    initialRouteName: 'AuthLoading',
    /* transitionConfig: () => fromLeft(1000), */
});

// Application container
const AppContainer = createAppContainer(AppSwitchNavigator);
