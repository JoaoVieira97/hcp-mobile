import React from 'react';

import {
    ActivityIndicator,
    View,
    StyleSheet
} from 'react-native';

import {Font} from 'expo';
import AppNavigator from './src/components/navigation/AppNavigator';

// provide data/store to all nested components
import {Provider} from 'react-redux';
// main store
import store  from './src/redux/store';



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
            <Provider store={store}>
                <View style={styles.container}>
                    {
                        /* <Text type={'bold'}>OLA</Text>*/
                        this.state.isLoading ?
                            (<AppNavigator />) : <ActivityIndicator/>
                    }
                </View>
            </Provider>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    }
});


/*
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
    AuthLoading: {screen: AuthenticationLoading},
    Auth: {screen: LoginScreen},
    AppStack: {screen: AppDrawerNavigator},
}, {
    initialRouteName: 'AuthLoading',
});

// Application container
const AppContainer = createAppContainer(AppSwitchNavigator);
*/