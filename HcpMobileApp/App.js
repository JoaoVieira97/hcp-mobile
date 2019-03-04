import React from 'react';

import {
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';

import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator
} from 'react-navigation';

import { fromLeft } from 'react-navigation-transitions';
import { Font } from 'expo';
import AuthLoadingScreen from './src/components/authentication/AuthLoadingScreen';
import LoginScreen from './src/components/authentication/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import OtherScreen from './src/components/OtherScreen';


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

// Application switch navigator
const SwitchNavigator = createSwitchNavigator({
  AuthLoading: AuthLoadingScreen,
  Auth: AuthStack,
  App: AppStack,
}, {
  initialRouteName: 'AuthLoading',
});

// Application container
const AppContainer = createAppContainer(SwitchNavigator);


/*
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
 */
