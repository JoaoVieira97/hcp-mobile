import React, { Component } from 'react';

import {View} from 'react-native';
import { connect } from 'react-redux';
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";



class OpenedGame extends Component {

    constructor(props) {
        super(props);
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'JOGO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });

    componentDidMount() {

    }

    render() {
        return (
            <View />
        );
  }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedGame);