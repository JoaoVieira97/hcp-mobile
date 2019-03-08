import React, { Component } from 'react';

import {Text, View} from 'react-native';


export default class ProfileScreen extends Component {

    static navigationOptions = {
        headerTitle: 'Perfil',
    };

    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>
                    ProfileScreen
                </Text>
            </View>
        );
    }
}