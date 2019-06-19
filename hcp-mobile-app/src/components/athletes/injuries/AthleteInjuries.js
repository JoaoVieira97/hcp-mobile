import React, {Component} from 'react';

import {FlatList, StyleSheet, Text, View, ScrollView} from 'react-native';
import {Card} from "react-native-paper";
import {connect} from 'react-redux';
import {colors} from "../../../styles/index.style";
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
     * PureComponent used for rendering items of ScrollView.
     * @param item
     * @returns {*}
     */
    renderItem = (item) => {
        return (
            <View key={item.id + item.state} style={{maginHorizontal: 10, marginTop: 10}}>
            <Card elevation={6}>
                <Card.Title
                    title={(item.occurredIn !== 'outro' && item.occurredIn !== false) ?
                        'Lesão durante um ' + item.occurredIn :
                        'Lesão'
                    }
                />
                <Card.Content>
                    <View>
                        <Text style={{fontSize: 15}}>Ocorreu a:</Text>
                        <View style={{
                            borderRadius: 5,
                            justifyContent: 'center'
                        }}>
                            <Text style={{color: colors.darkGrayColor, fontSize: 13}}>{item.occurredInDate}</Text>
                        </View>
                    </View>
                    {(this.state.type === 'Em tratamento' || this.state.type === 'Tratadas') &&
                        <View>
                            <Text style={{fontSize: 15}}>Data de diagnóstico:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>{item.diagnostic_date}</Text>
                            </View>
                        </View>
                    }
                    {(this.state.type === 'Tratadas') &&
                        <View>
                            <Text style={{fontSize: 15}}>Data de conclusão:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>{item.finishDate}</Text>
                            </View>
                        </View>
                    }
                    {(item.training !== false) &&
                        <View>
                            <Text style={{fontSize: 15}}>Treino:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>{item.training[1]}</Text>
                            </View>
                        </View>
                    }
                    {(item.game !== false) &&
                        <View>
                            <Text style={{fontSize: 15}}>Jogo:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>{item.game[1]}</Text>
                            </View>
                        </View>
                    }
                    {(this.state.type === 'Em diagnóstico' || this.state.type === 'Em tratamento') &&
                        <View>
                            <Text style={{fontSize: 15}}>Observações:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>
                                    {(item.observations !== false) ?
                                        item.observations :
                                        'não definido'
                                    }
                                </Text>
                            </View>
                        </View>
                    }
                    {(this.state.type === 'Em tratamento' || this.state.type === 'Tratadas') &&
                        <View>
                            <Text style={{fontSize: 15}}>Tipo de lesão:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>
                                    {(item.injuryType !== false) ?
                                        item.injuryType[1] :
                                        'não definido'
                                    }
                                </Text>
                            </View>
                        </View>
                    }
                    {(this.state.type === 'Em tratamento' || this.state.type === 'Tratadas') &&
                        <View>
                            <Text style={{fontSize: 15}}>Diagnóstico:</Text>
                            <View style={{
                                borderRadius: 5,
                                justifyContent: 'center'
                            }}>
                                <Text style={{color: colors.darkGrayColor, fontSize: 13}}>
                                    {(item.diagnostic !== false) ?
                                        item.diagnostic :
                                        'não definido'
                                    }
                                </Text>
                            </View>
                        </View>
                    }
                </Card.Content>
            </Card>
            </View>
        )
    }

    render() {

        return (
            <View style={styles.container}>
                <AthleteInjuriesHeader
                    athleteImage={this.state.athleteImage}
                    athleteName={this.state.athleteName}
                />
                <ScrollView 
                    contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 20}}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                >
                    {this.state.injuries.map(item => this.renderItem(item))}
                </ScrollView>
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