import React, {Component} from 'react';

import {View, Text} from 'react-native';
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
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(GameInvitations);