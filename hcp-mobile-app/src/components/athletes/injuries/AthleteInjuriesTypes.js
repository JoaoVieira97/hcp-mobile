import React, { Component } from 'react';

import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import {Ionicons} from "@expo/vector-icons/build/Icons";
import CustomText from "../../CustomText";
import {ListItem} from "react-native-elements/src/index";
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import AthleteInjuriesHeader from "./AthleteInjuriesHeader";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";



class AthleteInjuriesTypes extends Component {

    constructor(props) {
        super(props);

        this.state = {
            athleteId: "",
            athleteName: "",
            athleteImage: false,
            inDiagnosisCounter: 0,
            inTreatmentCounter: 0,
            treatedCounter: 0,
            inDiagnosis: [],
            inTreatment: [],
            treated: [],
            isLoading: true,
            isRefreshing: false
        }
    };

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'LESÕES'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
    });

    async componentWillMount() {

        await this.setState({
            athleteId: this.props.navigation.getParam('athleteId'),
            athleteName: this.props.navigation.getParam('athleteName'),
            athleteImage: this.props.navigation.getParam('athleteImage')
        });
    }

    async componentDidMount() {

        await this.setState({isLoading: true});

        await this.fetchAthleteInjuries();

        this.setState({isLoading: false});

        this.subscriptions = [

            this.props.navigation.addListener('willFocus', async () => {

                await this.fetchAthleteInjuries();
            })
        ];
    }

    componentWillUnmount() {

        this.subscriptions.forEach(sub => sub.remove());
    }

    async fetchAthleteInjuries () {

        const params = {
            fields: [
                'id',
                'ocorreu_num',
                'treino',
                'jogo',
                'outro',
                'create_date',
                'data_ocorrencia',
                'state',
                'tipo_lesao',
                'data_conclusao',
                'observacoes_ocor',
                'diagnostico',
                'data_diagnostico'
            ],
            domain: [['atleta', 'in', [this.state.athleteId]]]
        };

        const response = await this.props.odoo.search_read('ges.lesao', params);
        if(response.success && response.data.length > 0) {

            let inDiagnosisCounter = 0, inTreatmentCounter = 0, treatedCounter = 0;
            let inDiagnosis = [], inTreatment = [], treated = [];

            response.data.forEach(item => {

                const startDateAux = item.data_ocorrencia;
                let startDate;
                if(startDateAux)
                    startDate = startDateAux.slice(8,10) + '/' +
                             startDateAux.slice(5,7) + '/' +
                             startDateAux.slice(0,4);
                else
                    startDate = 'não definido';

                const endDateAux = item.data_conclusao;
                let endDate;
                if(endDateAux)
                    endDate = endDateAux.slice(8,10) + '/' +
                        endDateAux.slice(5,7) + '/' +
                        endDateAux.slice(0,4);
                else
                    endDate = 'não definido';

                const diagnosticDateAux = item.data_diagnostico;
                let diagnosticDate;
                if(diagnosticDateAux)
                    diagnosticDate = diagnosticDateAux.slice(8,10) + '/' +
                        diagnosticDateAux.slice(5,7) + '/' +
                        diagnosticDateAux.slice(0,4);
                else
                    diagnosticDate = 'não definido';


                const injury = {
                    id: item.id,
                    state: item.state,
                    occurredIn: item.ocorreu_num,
                    occurredInDate: startDate,
                    finishDate: endDate,
                    training: item.treino, //array or false
                    game: item.jogo, //array or false
                    other: item.outro, //... or false
                    injuryType: item.tipo_lesao,
                    observations: item.observacoes_ocor,
                    diagnostic: item.diagnostico,
                    diagnostic_date: diagnosticDate
                };

                if(item.state === 'diagnostico') {
                    inDiagnosisCounter += 1;
                    inDiagnosis.push(injury);
                }
                else if(item.state === 'tratamento') {
                    inTreatmentCounter += 1;
                    inTreatment.push(injury);
                }
                else {
                    treatedCounter += 1;
                    treated.push(injury);
                }
            });

            this.setState({
                inDiagnosisCounter: inDiagnosisCounter,
                inTreatmentCounter: inTreatmentCounter,
                treatedCounter: treatedCounter,
                inDiagnosis: inDiagnosis,
                inTreatment: inTreatment,
                treated: treated,
            });
        }
    }

    /**
     * Refresh screen.
     */
    handleRefresh = () => {
        this.setState({
                isRefreshing: true,
                isLoading: false
            },
            async () => {

                await this.fetchAthleteInjuries();

                this.setState({
                    isRefreshing: false
                });
            });
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 30,
                        width: 30
                    }}>
                        <Ionicons name={item.icon} size={27}/>
                    </View>
                }
                badge={item.value === 0 ? null : {
                    value: item.value,
                    badgeStyle: {
                        backgroundColor: colors.gradient1
                    }
                }}
                chevron={item.value > 0}
                disabled={item.value === 0}
                onPress={() => {

                    let injuriesList;
                    let type;
                    if(item.name === 'Em diagnóstico') {
                        injuriesList = this.state.inDiagnosis;
                        type = 'Em diagnóstico';
                    }
                    else if(item.name === 'Em tratamento') {
                        injuriesList = this.state.inTreatment;
                        type = 'Em tratamento';
                    }
                    else {
                        injuriesList = this.state.treated;
                        type = 'Tratadas';
                    }

                    if(this.props.navigation.state.routeName === 'ProfileInjuriesTypesScreen') {

                        this.props.navigation.navigate(
                            'ProfileInjuriesScreen',
                            {
                                athleteId: this.state.athleteId,
                                athleteName: this.state.athleteName,
                                athleteImage: this.state.athleteImage,
                                type: type,
                                injuries: injuriesList
                            }
                        );
                    }
                    else if(this.props.navigation.state.routeName === 'AthleteInjuriesTypesScreen') {

                        this.props.navigation.navigate(
                            'AthleteInjuriesScreen',
                            {
                                athleteId: this.state.athleteId,
                                athleteName: this.state.athleteName,
                                athleteImage: this.state.athleteImage,
                                type: type,
                                injuries: injuriesList
                            }
                        );
                    }
                    else
                        this.props.navigation.navigate(
                            'ChildInjuriesScreen',
                            {
                                athleteId: this.state.athleteId,
                                athleteName: this.state.athleteName,
                                athleteImage: this.state.athleteImage,
                                type: type,
                                injuries: injuriesList
                            }
                        );
                }}
            />
        );
    };

    render() {

        const list = [{
            name: 'Em diagnóstico',
            icon: 'md-eye',
            subtitle: 'Lesões registadas e à espera de diagnóstico.',
            value: this.state.inDiagnosisCounter,
            onPress: 'NewTraining'
        }, {
            name: 'Em tratamento',
            icon: 'md-hand',
            subtitle: 'Lesões em processo de tratamento.',
            value: this.state.inTreatmentCounter,
            onPress: 'OpenedTrainings'
        }, {
            name: 'Tratadas',
            icon: 'md-done-all',
            subtitle: 'Lesões que já foram registadas como tratadas.',
            value: this.state.treatedCounter,
            onPress: 'PendingTrainings'
        }];

        return (
            <View style={styles.container}>
                <Loader isLoading={this.state.isLoading} />
                <AthleteInjuriesHeader
                    athleteImage={this.state.athleteImage}
                    athleteName={this.state.athleteName}
                />
                <FlatList
                    keyExtractor={item => item.name}
                    data={list}
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

export default connect(mapStateToProps, mapDispatchToProps)(AthleteInjuriesTypes);