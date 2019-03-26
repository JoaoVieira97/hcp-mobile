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

import {Ionicons} from "@expo/vector-icons";
import {MaterialCommunityIcons} from "@expo/vector-icons";

import CustomText from "../CustomText";
import {colors} from "../../styles/index.style";

export default class EventScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            item: {},
        };
    }
    
    handleGetDirections = () => {
        if (this.state.item.coordinates){

            navigator.geolocation.getCurrentPosition(
                position => {
                    const data = {
                        source: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        },
                        destination: {
                            latitude: this.state.item.coordinates.latitude,
                            longitude: this.state.item.coordinates.longitude
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
                    console.log(data)
                    getDirections(data)
                },
                error => Alert.alert('Não foi possível obter a sua localização. Tente de novo.'),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );

        }
        else{
            Alert.alert('Coordenadas do local não estão definidas. Pedimos desculpa.')
        }
    }

    async componentDidMount(){
        this.setState({
            item: this.props.navigation.state.params.item
        });
    }

    static navigationOptions = ({navigation}) => ({
        //headerTitle: 'Detalhes do Evento',

        headerTitle:<CustomText
                type={'bold'}
                children={'DETALHES DO EVENTO'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft: <Ionicons
            name="md-arrow-back"
            size={28}
            color={'#ffffff'}
            style={{paddingLeft: 20}}
            onPress = {() => navigation.goBack()}
        />
    });

    render() {
      
        let colorText = (this.state.item.type === 0)? colors.gameColor : colors.trainingColor;
        
        return (
            <View style={styles.container}>
                <Text style={[styles.title,{color: colorText}]}>
                    {(this.state.item.type === 0)? 'Jogo' : 'Treino'}
                </Text>

                <MaterialCommunityIcons
                    name={'hockey-sticks'}
                    size={150}
                    color={'#000000'}
                    style={{ marginTop: 35, marginBottom: -20 }}
                />
                <MaterialCommunityIcons
                    name={'hockey-puck'}
                    size={50}
                    color={'#000000'}
                    style={{ marginBottom: 30 }}
                />

                <View style={{marginBottom: 40}}>
                    <Text style={[styles.lines, {fontSize: 20, textAlign: 'center', textShadowColor: colorText}]}>{this.state.item.title}</Text>
                    <Text style={[styles.lines, {fontSize: 15, textAlign: 'center', textShadowColor: colorText}]}>{this.state.item.time}</Text>
                    <Text style={[styles.lines, {fontSize: 15, textAlign: 'center', textShadowColor: colorText}]}>{this.state.item.description}</Text>
                </View>
                <TouchableOpacity onPress={this.handleGetDirections} style={[styles.buttonContainer, {borderColor: colorText}]}>
                    <Text style={[styles.buttonText,{textShadowColor: colorText}]}>Obter direções</Text>
                </TouchableOpacity>

                <MaterialCommunityIcons
                    name={'map-marker-radius'}
                    size={50}
                    color={'#000000'}
                />
                <Text>{this.state.item.local}</Text>
            </View>
        );
    }
}
//Image Hockey (old)
/*<Image
    source={require('../img/hoquei-icon-black.png')}
    style={{padding: 1, margin: 10}}
/>*/
//Image Map (old)
/*<Image
    source={require('../img/map-icon.png')}
    style={{padding: 1, margin: 5, width: 45, height: 45}}
/>*/

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
    },
});