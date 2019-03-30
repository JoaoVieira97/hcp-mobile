import React, {Component} from 'react';

import {View, Text} from 'react-native';
import {Ionicons} from "@expo/vector-icons";

// import styles from './styles';

export default class GameScreen extends Component {

    static navigationOptions = {
        title: 'Jogos',
        tabBarIcon: ({ tintColor }) => (
            <Ionicons name={"md-trophy"} color={tintColor} size={26}/>
        ),
        tabBarColor: "#efefef"
    };

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
