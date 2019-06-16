import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";

class EditOpenedTraining extends React.Component {

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'EDITAR TREINO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
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
            <View>
                <Text>Editar treino</Text>
            </View>
        );
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(EditOpenedTraining);