import React from 'react';
import {
    StyleSheet,
    View
    } from 'react-native';

import Logo from '../components/Logo';


export default class OtherScreen extends React.Component {

    render() {

        return (
            <View style={styles.container}>
                <Logo size={"big"}/>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#fea484"
    }
});