import React, {Component} from 'react';

import {View, Text, Image, ActivityIndicator} from 'react-native';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";



class AthleteScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            athlete: {}
        }
    }

    async componentDidMount() {

        await this.setState({
            athlete: this.props.navigation.getParam('athlete')
        });

        console.log(this.state.athlete)
    }

    static navigationOptions = ({navigation}) => {

        return ({
            headerTitle: navigation.getParam('athlete').name,
            headerLeft: null,
            headerRight: <Ionicons
                name="md-close"
                size={30}
                color="black"
                style={{paddingRight: 20}}
                onPress = {() => navigation.navigate('AthletesScreen')}
            />
        });
    };

    render() {

        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontWeight: '700', fontSize: 20}}>
                    {this.state.athlete.squad_number}
                </Text>
                <Text style={{fontWeight: '500', fontSize: 15}}>
                    {this.state.athlete.echelon}
                </Text>
                <Image style={{ width: 250, height: 250}}
                       source={{uri: `data:image/png;base64,${this.state.athlete.image}`}}/>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteScreen);
