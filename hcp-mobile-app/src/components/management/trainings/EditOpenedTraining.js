import React from 'react';
import {TouchableOpacity, View,} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";

class EditOpenedTraining extends React.Component {

    /**
     * Definir as opções da barra de navegação no topo.
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: 'Editar treino',
        headerLeft:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginLeft: 10}} onPress = {() => navigation.goBack()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'} />
            </TouchableOpacity>,
        headerRight:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginRight: 10}}>
                <Ionicons
                    name="md-save"
                    size={28}
                    color={'#ffffff'} />
            </TouchableOpacity>,
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