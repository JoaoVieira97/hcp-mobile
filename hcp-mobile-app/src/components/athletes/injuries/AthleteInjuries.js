import React, {Component} from 'react';

import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons/build/Icons";
import {colors} from "../../../styles/index.style";
import {ListItem} from "react-native-elements/src/index";
import CustomText from "../../CustomText";
import _ from 'lodash';
import AthleteInjuriesHeader from "./AthleteInjuriesHeader";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";


class AthleteInjuries extends Component {

    constructor(props) {
        super(props);

        this.state = {
            injuries: [],
            type: "",
            athleteId: "",
            athleteName: "",
            athleteImage: false,
            isRefreshing: false,
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', navigation.getParam('type').toUpperCase()
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
    });

    async componentWillMount() {

        await this.setState({
            injuries: this.props.navigation.getParam('injuries'),
            type: this.props.navigation.getParam('type'),
            athleteId: this.props.navigation.getParam('athleteId'),
            athleteName: this.props.navigation.getParam('athleteName'),
            athleteImage: this.props.navigation.getParam('athleteImage'),
        });

    }

    /**
     * Fetch athlete injuries by type.
     * @param type
     * @returns {Promise<void>}
     */
    async fetchInjuriesByType(type) {

        const params = {
            fields: [
                'id',
                'ocorreu_num',
                'treino', 'jogo', 'outro',
                'create_date', 'data_ocorrencia',
                'state',
                'tipo_lesao',
                'data_conclusao'
            ],
            domain: [
                ['atleta', 'in', [this.state.athleteId]],
                ['state', '=', type]
            ]
        };

        const response = await this.props.odoo.search_read('ges.lesao', params);
        if(response.success && response.data.length > 0) {

            let injuries = [];
            response.data.forEach(item => {

                const startDateAux = item.data_ocorrencia;
                let startDate;
                if (startDateAux)
                    startDate = startDateAux.slice(8, 10) + '/' +
                        startDateAux.slice(5, 7) + '/' +
                        startDateAux.slice(0, 4);
                else
                    startDate = 'não definido';

                const endDateAux = item.data_conclusao;
                let endDate;
                if (endDateAux)
                    endDate = endDateAux.slice(8, 10) + '/' +
                        endDateAux.slice(5, 7) + '/' +
                        endDateAux.slice(0, 4);
                else
                    endDate = 'não definido';

                const injury = {
                    id: item.id,
                    state: item.state,
                    occurredIn: item.ocorreu_num,
                    occurredInDate: startDate,
                    finishDate: endDate,
                    training: item.treino, //array or false
                    game: item.jogo, //array or false
                    other: item.outro, //... or false
                    injuryType: item.tipo_lesao
                };

                injuries.push(injury);
            });

            this.setState({injuries: injuries});
        }
    }

    /**
     * When user refresh current screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        this.setState({isRefreshing: true});

        let type;
        if(this.state.type === 'Em diagnóstico')
            type = 'diagnostico';
        else if(this.state.type === 'Em tratamento')
            type = 'tratamento';
        else
            type = 'tratada';

        await this.fetchInjuriesByType(type);

        this.setState({isRefreshing: false});
    };

    /**
     * PureComponent used for rendering items of FlatList.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem = ({item, index}) => {

        let icon;
        if (this.state.type === 'Em diagnóstico')
            icon = 'md-eye';
        else if (this.state.type === 'Em tratamento')
            icon = 'md-hand';
        else
            icon = 'md-done-all';

        return (
            <ListItem
                title={(item.occurredIn !== 'outro' && item.occurredIn !== false) ?
                    'Lesão durante um ' + item.occurredIn :
                    'Lesão'
                }
                subtitle={
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'• Ocorreu a:  ' + item.occurredInDate}
                        </Text>
                        {(this.state.type === 'Em tratamento' || this.state.type === 'Tratadas') &&
                            <Text style={{color: colors.darkGrayColor}}>
                                {'• Data de diagnóstico:  ' + item.diagnostic_date}
                            </Text>
                        }
                        {(this.state.type === 'Tratadas') &&
                            <Text style={{color: colors.darkGrayColor}}>
                                {'• Data de conclusão:  ' + item.finishDate}
                            </Text>
                        }
                        {(item.training !== false) &&
                            <Text style={{color: colors.darkGrayColor}}>
                                {'• Treino:  \n' + item.training[1]}
                            </Text>
                        }
                        {(item.game !== false) &&
                            <Text style={{color: colors.darkGrayColor}}>
                                {'• Jogo:  \n' + item.game[1]}
                            </Text>
                        }
                        {(this.state.type === 'Em diagnóstico' || this.state.type === 'Em tratamento') &&
                            <Text style={{color: colors.darkGrayColor}}>
                                {(item.observations !== false) ?
                                    '• Observações:  \n' + item.observations :
                                    '• Observações:  não definido'
                                }
                            </Text>
                        }
                        {(this.state.type === 'Em tratamento' || this.state.type === 'Tratadas') &&
                            <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {(item.injuryType !== false) ?
                                '• Tipo de lesão:  ' + item.injuryType[1] :
                                '• Tipo de lesão:  não definido'
                            }
                            </Text>
                        }
                        {(this.state.type === 'Em tratamento' || this.state.type === 'Tratadas') &&
                            <Text style={{color: colors.darkGrayColor}}>
                            {(item.diagnostic !== false) ?
                                '• Diagnóstico:  \n' + item.diagnostic :
                                '• Diagnóstico:  não definido'
                            }
                            </Text>
                        }
                    </View>
                }
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
                //chevron={true}
                onPress={() => {

                    if(this.props.navigation.state.routeName === 'ProfileInjuriesScreen') {

                        this.props.navigation.navigate(
                            'ProfileInjuryScreen',
                            {
                                athleteId: this.state.athleteId,
                                athleteName: this.state.athleteName,
                                athleteImage: this.state.athleteImage,
                                type: this.state.type,
                                injury: item
                            }
                        );
                    }
                    else if(this.props.navigation.state.routeName === 'AthleteInjuriesScreen') {

                        this.props.navigation.navigate(
                            'AthleteInjuryScreen',
                            {
                                athleteId: this.state.athleteId,
                                athleteName: this.state.athleteName,
                                athleteImage: this.state.athleteImage,
                                type: this.state.type,
                                injury: item
                            }
                        );
                    }
                    else {
                        this.props.navigation.navigate(
                            'ChildInjuryScreen',
                            {
                                athleteId: this.state.athleteId,
                                athleteName: this.state.athleteName,
                                athleteImage: this.state.athleteImage,
                                type: this.state.type,
                                injury: item
                            }
                        );
                    }
                }}
            />
        );
    };

    render() {

        return (
            <View style={styles.container}>
                <AthleteInjuriesHeader
                    athleteImage={this.state.athleteImage}
                    athleteName={this.state.athleteName}
                />
                <FlatList
                    keyExtractor={item => item.id + item.state}
                    data={this.state.injuries}
                    renderItem={this.renderItem}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayColor,
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteInjuries);