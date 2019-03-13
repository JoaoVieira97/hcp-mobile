import React, { Component } from 'react';

import {
    View,
    Button,
    Alert
} from 'react-native';

import getDirections from 'react-native-google-maps-directions';


export default class EventScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            location: { // University of Minho
                latitude: 41.55938888888888,
                longitude: -8.398416666666666,
            }
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
    }

    render() {
      return (
        <View>
          <Button onPress={this.handleGetDirections} title="Obter direções" />
        </View>
      );
    }
}

