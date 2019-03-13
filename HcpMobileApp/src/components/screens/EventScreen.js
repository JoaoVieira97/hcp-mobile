import React, { Component } from 'react';

import {
    View,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Text,
    Image
} from 'react-native';

import getDirections from 'react-native-google-maps-directions';


export default class EventScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            location: { // University of Minho
                latitude: 41.55938888888888,
                longitude: -8.398416666666666,
            },
            item: {}
        };
    }
    
    handleGetDirections = () => {

        //console.log(this.state.location)

        const data = {
            source: {
                latitude: this.state.location.latitude,
                longitude: this.state.location.longitude
            },
            destination: { // Braga center
                latitude: 41.5518,
                longitude: -8.4229
            },
            params: [
                {
                    key: "travelmode",
                    value: "driving" // value = [driving, walking, bicycling, transit]
                },
                {
                    key: "dir_action",
                    value: "navigate" // instantly initializes navigation using the given travel mode 
                }
            ]
        }
        getDirections(data)
    }

    async componentDidMount(){

        this.setState({
            item: this.props.navigation.state.params.item
        });

        //console.log(this.state.location)
        await navigator.geolocation.getCurrentPosition(
            position => {
                this.setState({
                    location: { latitude: position.coords.latitude, longitude: position.coords.longitude }
                });
            },
            error => Alert.alert(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
        //console.log(this.state.location)
        console.log(this.state.item)
    }

    render() {
      
        let colorText = (this.state.item.type === 0)? '#fab1a0' : '#81ecec';
        
        return (
            <View style={styles.container}>
                <Text style={[styles.title,{color: colorText}]}>
                    {(this.state.item.type === 0)? 'Jogo' : 'Treino'}
                </Text>
                <Image
                    source={require('../img/hoquei-icon-black.png')}
                    style={{padding: 1, margin: 10}}
                />
                <View style={{marginBottom: 40}}>
                    <Text style={[styles.lines, {fontSize: 20, textAlign: 'center', textShadowColor: colorText}]}>{this.state.item.title}</Text>
                    <Text style={[styles.lines, {fontSize: 15, textAlign: 'center', textShadowColor: colorText}]}>{this.state.item.time}</Text>
                    <Text style={[styles.lines, {fontSize: 15, textAlign: 'center', textShadowColor: colorText}]}>{this.state.item.title}</Text>
                </View>
                <TouchableOpacity onPress={this.handleGetDirections} style={[styles.buttonContainer, {borderColor: colorText}]}>
                    <Text style={[styles.buttonText,{textShadowColor: colorText}]}>Obter direções</Text>
                </TouchableOpacity>
                <Image
                source={require('../img/map-icon.png')}
                style={{padding: 1, margin: 5, width: 45, height: 45}}
                />
            </View>
        );
    }
}

//<Button onPress={this.handleGetDirections} title="Obter direções" style={{color: colorText}}/>

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 25,
        paddingRight: 25,
        backgroundColor: '#e4e4e4'
    },
    title:{
        fontWeight: '700',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -2, height: 2},
        textShadowRadius: 15,
        fontSize: 40
    },
    lines:{
        fontWeight: '700',
        textShadowOffset: {width: -2, height: 2},
        textShadowRadius: 15,
    },
    buttonContainer: {
        backgroundColor: '#576574',
        borderWidth: 3,
        borderRadius: 10,
        paddingVertical: 10,
        paddingLeft:12,
        paddingRight:12
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textShadowOffset: {width: -2, height: 2},
        textShadowRadius: 15,
    }
});