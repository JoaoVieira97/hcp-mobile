import React from 'react';
import {View,} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";

class EditOpenedTraining extends React.Component {

    /**
     * Definir as opções da barra de navegação no topo.
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: 'Editar treino',
        headerLeft: <Ionicons
            name="md-arrow-back"
            size={28}
            color={'#ffffff'}
            style={{paddingLeft: 20}}
            onPress = {() => navigation.goBack()}
        />,
        headerRight: <Ionicons
            name="md-save"
            size={25}
            color={'#ffffff'}
            style={{paddingRight: 20}}
            //onPress = {() => navigation.navigate('EditOpenedTraining')}
        />
    });

    render() {
        return (
            <View/>
        );
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EditOpenedTraining);