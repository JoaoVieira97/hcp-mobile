import React, {Component} from 'react';

import {View, Text} from 'react-native';

// import styles from './styles';

export default class GameScreen extends Component {
    render() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>
                    GameScreen
                </Text>
            </View>
        );
    }
}
