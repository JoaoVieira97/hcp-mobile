import React, {Component} from 'react';

import {View, Text} from 'react-native';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";

class AthleteScreen extends Component {

    constructor(props) {
        super(props);
    }

    static navigationOptions = ({navigation}) => {

        return ({
            headerTitle: navigation.getParam('name', 'Atletas'),
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
            <View>
                <Text>
                    AthleteScreen
                </Text>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteScreen);
