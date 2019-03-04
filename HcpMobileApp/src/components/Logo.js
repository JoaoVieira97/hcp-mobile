import React from 'react';
import {StyleSheet, View, Image} from 'react-native';

export default class Logo extends React.Component {

    render() {

        let image;
        if(this.props.size === 'big') {
            image =  <Image
                style={styles.bigLogo}
                source={require('../img/logo.png')}
            />;
        } else {
            image =  <Image
                style={styles.smallLogo}
                source={require('../img/logo.png')}
            />;
        }

        return (
            <View>{image}</View>
        );
    }
}


const styles = StyleSheet.create({
    smallLogo: {
        width: 90,
        height: 90,
    },
    bigLogo: {
        width: 130,
        height: 130,
    },
});