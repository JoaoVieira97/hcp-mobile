import React from 'react';

import {ActivityIndicator, View} from 'react-native';
import {Provider} from 'react-redux';
import store  from './src/redux/store';
import {Font} from 'expo';
import AppNavigator from './src/components/navigation/AppNavigator';

import Loader from './src/components/screens/Loader';


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        }
    }

    async componentDidMount() {

        await Font.loadAsync({
            'Montserrat-Regular': require('./assets/fonts/Montserrat/Montserrat-Regular.ttf'),
            'Montserrat-Bold': require('./assets/fonts/Montserrat/Montserrat-Bold.ttf'),
            'Montserrat-SemiBold': require('./assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
            'Montserrat-ExtraLight': require('./assets/fonts/Montserrat/Montserrat-ExtraLight.ttf'),
        });

        await this.setState({isLoading: false});
    }

    render() {
        return (
            <Provider store={store}>
                <View style={{flex: 1}}>
                    <Loader isLoading={this.state.isLoading}/>
                    {
                        !this.state.isLoading && <AppNavigator />
                    }
                </View>
            </Provider>
        );
    }
}
