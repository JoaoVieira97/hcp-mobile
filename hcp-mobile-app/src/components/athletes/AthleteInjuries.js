import React, { Component } from 'react';

import {FlatList, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";
import {ListItem} from "react-native-elements";
import CustomText from "../CustomText";
import _ from 'lodash';


class AthleteInjuries extends Component {

    constructor(props) {
        super(props);

        this.state = {
            injuries: [],
            type: "",
            athleteId: "",
            isRefreshing: false,
        }
    }

    /**
     * Define navigation properties.
     * @param navigation
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={_.upperCase(navigation.getParam('type'))}
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

    async componentWillMount() {

        await this.setState({
            injuries: this.props.navigation.getParam('injuries'),
            type: this.props.navigation.getParam('type'),
            athleteId: this.props.navigation.getParam('athleteId'),
        });
    }

    async componentDidMount() {

    }

    /**
     * When user refresh current screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        this.setState({isRefreshing: true});


        this.setState({isRefreshing: false});
    };

    /**
     * PureComponent used for rendering items of FlatList.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem = ({ item, index }) => {

        let icon;
        if (this.state.type === 'Em diagnóstico')
            icon = 'md-eye';
        else if (this.state.type === 'Em tratamento')
            icon = 'md-hand';
        else
            icon = 'md-done-all';

        return (
            <ListItem
                title={'Lesão num treino'}
                subtitle={'Registada a 10-10-2020'}
                leftAvatar={
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 30,
                        width: 30
                    }}>
                        <Ionicons name={icon} size={27}/>
                    </View>
                }
                chevron={true}
            />
        );
    };

    render() {
        return (
            <FlatList
                keyExtractor={item => item.id + item.state}
                data={this.state.injuries}
                renderItem={this.renderItem}
                //refreshing={this.state.isRefreshing}
                //onRefresh={this.handleRefresh}
            />
        );
  }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteInjuries);