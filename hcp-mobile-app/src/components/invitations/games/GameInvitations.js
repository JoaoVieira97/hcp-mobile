import React, {Component} from 'react';

import {View, Text} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {addTrainings, clearAllTrainings, setTrainings} from "../../../redux/actions/openedTrainings";
import {connect} from "react-redux";

// import styles from './styles';

class GameInvitations extends Component {

    static navigationOptions = {
        title: 'Jogos',
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

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    trainingsList: state.openedTrainings.trainingsList
});

const mapDispatchToProps = dispatch => ({

    setTrainings: (trainingsList) => {
        dispatch(setTrainings(trainingsList))
    },

    addTrainings: (trainingsList) => {
        dispatch(addTrainings(trainingsList))
    },

    clearAllTrainings: () => {
        dispatch(clearAllTrainings())
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(GameInvitations);