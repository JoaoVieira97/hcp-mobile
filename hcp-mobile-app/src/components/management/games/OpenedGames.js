import React, { Component } from 'react';
import {TouchableOpacity, View} from 'react-native';
import { connect } from 'react-redux';
import CustomText from "../../CustomText";
import {Ionicons} from "@expo/vector-icons";


class OpenedGames extends Component {

    constructor(props) {
        super(props);

    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                numberOfLines={1}
                ellipsizeMode='tail'
                children={'CONVOCATÓRIAS EM ABERTO'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
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
            </TouchableOpacity>
    });


    render() {
        return (
            <View />
        );
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedGames);