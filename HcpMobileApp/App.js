import React from 'react';

import {
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';

import {
  createAppContainer,
  createSwitchNavigator,
} from 'react-navigation';


import { Font } from 'expo';
import LoginScreen from './src/components/authentication/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import OdooConnection from "./src/components/authentication/OdooConnection";


export default class App extends React.Component {

  constructor() {
    super();
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
      <View style={styles.container}>
      {
        this.state.isLoading ?
            (<AppContainer />) : <ActivityIndicator />
      }
      </View>
    );
  }
}

// Page styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});




/*
// Authentication stack navigator
const AuthStack = createSwitchNavigator({
  Login: LoginScreen
}, {
  initialRouteName: 'Login',
  transitionConfig: () => fromLeft(1000),
});

// Application stack navigator
const AppStack = createStackNavigator({
  Home: HomeScreen,
  Other: OtherScreen
}, {
  initialRouteName: 'Home',
  transitionConfig: () => fromLeft(1000),
});


class Feed extends React.Component {
  render() {
    return (
        <View>
          <Text>Feed</Text>
        </View>
    );
  }
}

class Profile extends React.Component {
  render() {
    return (
        <View>
          <Text>Profile</Text>
        </View>
    );
  }
}

class Settings extends React.Component {
  render() {
    return (
        <View>
          <Text>Settings</Text>
        </View>
    );
  }
}


const DashboardTabNavigator = createBottomTabNavigator({
  Feed,
  Profile,
  Settings
});

const DashboardTabNavigator2 = createBottomTabNavigator({
  Feed,
  Settings
});

const AppDrawerNavigator = createDrawerNavigator({
  Dashboard: {
    screen: HomeScreen
  },
  Other: {
    screen: OtherScreen
  }
});

*/



// Application switch navigator
const AppSwitchNavigator = createSwitchNavigator({
  AuthLoading: { screen: OdooConnection},
  Auth: { screen: LoginScreen },
  Home: { screen: HomeScreen },
}, {
  initialRouteName: 'AuthLoading',
});

// Application container
const AppContainer = createAppContainer(AppSwitchNavigator);
