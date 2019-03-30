import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Image
} from 'react-native';

export default class LoadingScreen extends Component {
  
    componentWillMount() {
        this.animatedValue = new Animated.Value(0);
    }
  
    componentDidMount() {
        Animated.loop(Animated.timing(this.animatedValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true
        })).start()
    }
  
    render() {
        const interpolateRotation = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        })
        const animatedStyle = {
            transform: [
                { rotate: interpolateRotation }
            ]
        }
        return (
            <View style={styles.container}>
                <Animated.View style={[styles.image_container, animatedStyle]}>
                    <Image source={require('../img/logo-bw.png')}/>
                </Animated.View>
                <Text style={{marginTop: 30, color: 'gray'}}>A carregar...</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image_container: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center'
  }
});