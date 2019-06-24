import React, {Component} from 'react';
import {Alert, View} from 'react-native';
import {connect} from 'react-redux';
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import Loader from "../../screens/Loader";
import {
    resetGame,
    setAllInformation,
    setStartTime,
    setEchelon,
    setLocalID,
    setEndTime,
    setAthletes,
    addSecretary,
    addCoach,
    setSeasonID,
    setOpponentID,
    setHoursNotice,
    setCompetitionID
} from "../../../redux/actions/newOrEditGame";
import {
    fetchAllLocals,
    fetchAllCoaches,
    fetchAllSecretaries,
    fetchAllEchelons,
    fetchAllAthletes,
    fetchAllTeams,
    fetchAllCompetitions,
    fetchAllSeasons
} from "../fetchFunctionsNewGameTraining";
import Wizard from "../Wizard";
import Step1 from "./NewOrEditGameSteps/Step1";
import Step2 from "./NewOrEditGameSteps/Step2";
import Step3 from "./NewOrEditGameSteps/Step3";
import Step4 from "./NewOrEditGameSteps/Step4";
import Step5 from "./NewOrEditGameSteps/Step5";


class NewOrEditGame extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isToUpdate: false,
            stepID: 0,
            totalSteps: 5,
            disabledSteps: [true, true, true, false, true],
        }
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff',
            navigation.getParam('gameID') !== undefined ? 'EDITAR JOGO' : 'CRIAR JOGO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });

    componentWillMount() {

        // clean redux storage
        this.resetData();
    }

    async componentDidMount() {

        // check if is to edit training
        if(this.props.navigation.getParam('gameID') !== undefined) {

            await this.setState({isToUpdate: true});
            await this.getGameInformation(this.props.navigation.state.params.gameID);
        }

        // get all information needed for creating new training
        await this.fetchAllInformation();
        this.setState({isLoading: false});
    }

    getGameInformation = async (id) => {

        const params = {
            ids: [id],
            fields: [
                'id', 'start_datetime', 'stop_datetime',
                'atletas', 'treinador', 'seccionistas',
                'local', 'escalao', 'em_casa', 'epoca',
                'equipa_adversaria', 'competicao', 'antecedencia'
            ],
        };

        const response = await this.props.odoo.get('ges.jogo', params);
        if(response.success && response.data.length > 0) {

            const data = response.data[0];
            if(data.local)
                this.props.setLocalID(data.local[0]);
            if(data.escalao)
                this.props.setEchelon(data.escalao[0]);
            this.props.setAthletes(data.atletas);
            this.props.setStartTime(
                new Date(data.start_datetime.split(' ')[0] +
                    'T' + data.start_datetime.split(' ')[1]
                )
            );
            this.props.setEndTime(
                new Date(data.stop_datetime.split(' ')[0] +
                    'T' + data.stop_datetime.split(' ')[1])
            );

            if(data.epoca)
                this.props.setSeasonID(data.epoca[0]);
            if(data.equipa_adversaria)
                this.props.setOpponentID(data.equipa_adversaria[0]);
            if(data.antecedencia)
                this.props.setHoursNotice(data.antecedencia);
            if(data.competicao)
                this.props.setCompetitionID(data.competicao[0]);

            data.seccionistas.map(id =>
                this.props.addSecretary(id)
            );
            data.treinador.map(id =>
                this.props.addCoach(id)
            );
        }
    };

    increaseStep = () => {
        this.setState(state => ({stepID: state.stepID + 1}));
    };

    decreaseStep = () => {
        this.setState(state => ({stepID: state.stepID - 1}));
    };

    setStepDisabled = (disabled) => {

        this.setState(state => ({
                disabledSteps: state.disabledSteps.map((item, index) => {
                    if (index === state.stepID)
                        return disabled;
                    return item;
                })
            })
        );
    };

    /**
     * Clean redux store.
     */
    resetData = () => {
        this.props.resetGame();
    };

    /**
     * Get all information that is needed to create or edit a game.
     * @returns {Promise<void>}
     */
    fetchAllInformation = async () => {

        let error = false;

        let allLocals, allCoaches, allSecretaries,
            allEchelons, allAthletes, allTeams,
            allCompetitions, allSeasons;

        allLocals = await fetchAllLocals(this.props.odoo);
        if (allLocals.length > 0) {

            allCoaches = await fetchAllCoaches(this.props.odoo);
            if (allCoaches.length > 0) {

                allSecretaries = await fetchAllSecretaries(this.props.odoo);
                if (allSecretaries.length > 0) {

                    allEchelons = await fetchAllEchelons(this.props.odoo);
                    if (allEchelons.length > 0) {

                        allAthletes = await fetchAllAthletes(this.props.odoo);
                        if (allAthletes != null) {

                            allTeams = await fetchAllTeams(this.props.odoo);
                            if (allTeams.length > 0) {

                                allCompetitions = await fetchAllCompetitions(this.props.odoo);
                                if (allCompetitions.length > 0) {

                                    allSeasons = await fetchAllSeasons(this.props.odoo);
                                    if (allSeasons.length === 0)
                                        error = 'Não foi possível obter informações sobre as épocas.'
                                } else
                                    error = 'Não foi possível obter informações sobre as competições.'
                            } else
                                error = 'Não foi possível obter informações sobre as equipas adversárias.'
                        } else
                            error = 'Não foi possível obter informações sobre os atletas.'
                    } else
                        error = 'Não foi possível obter informações sobre os escalões.'
                } else
                    error = 'Não foi possível obter informações sobre os seccionistas.'
            } else
                error = 'Não foi possível obter informações sobre os treinadores.'
        } else
            error = 'Não foi possível obter informações sobre os locais.';

        if (error === false) {

            this.props.setAllInformation(
                allLocals, allCoaches, allSecretaries,
                allEchelons, allAthletes, allTeams,
                allCompetitions, allSeasons
            );
        } else {
            this.setState({
                'isLoading': false
            }, () => {
                Alert.alert(
                    'Impossível obter algumas informações',
                    error,
                    [
                        {text: 'Voltar', onPress: () => this.resetData()},
                    ],
                    {cancelable: false},
                );
            });
        }
    };

    /**
     * When user submit all values
     * @returns {Promise<void>}
     */
    onSubmitHandler = async () => {

        this.setState({isLoading: true});

        const startDate = this.props.newOrEditGame.rawStartTime.toISOString().split('T');
        const endDate = this.props.newOrEditGame.rawEndTime.toISOString().split('T');

        const newGame = {
            start: startDate[0] + ' ' + startDate[1].slice(0,8),
            stop: endDate[0] + ' ' + endDate[1].slice(0,8),
            antecedencia: this.props.newOrEditGame.rawHoursNotice,
            competicao: this.props.newOrEditGame.rawCompetitionID,
            equipa_adversaria: this.props.newOrEditGame.rawOpponentID,
            epoca: this.props.newOrEditGame.rawSeasonID,
            em_casa: this.props.newOrEditGame.rawHomeAdvantage,
            escalao: this.props.newOrEditGame.rawEchelonID,
            local: this.props.newOrEditGame.rawLocalID,
            treinador: [[6,0, this.props.newOrEditGame.rawCoachesIDs]],
            seccionistas: [[6,0, this.props.newOrEditGame.rawSecretariesIDs]],
            atletas: [[6,0, this.props.newOrEditGame.rawAthletesIDs]],
        };

        let alertMessage;
        let response;
        if(this.state.isToUpdate) {
            response = await this.props.odoo.update(
                'ges.jogo',
                [this.props.navigation.state.params.gameID],
                newGame
            );
        }
        else
            response = await this.props.odoo.create('ges.jogo', newGame);

        if(response.success) {

            if(this.state.isToUpdate) {
                Alert.alert(
                    'Sucesso',
                    'O jogo foi editado com sucesso.',
                    [
                        {text: 'OK', onPress: () => {
                                this.resetData();
                                this.props.navigation.state.params.reloadInfo();
                                this.props.navigation.goBack();
                            }},
                    ],
                    {cancelable: false},
                );
                await this.setState({isLoading: false});
                return;
            }
            else
                alertMessage = {
                    'title': 'Sucesso',
                    'message': 'O jogo foi criado com sucesso. As pessoas envolvidas serão notificadas.'
                };
        }
        else {
            if(this.state.isToUpdate) {
                alertMessage = {
                    'title': 'Erro',
                    'message': 'Ocorreu um erro editar este jogo.'
                };
            }
            else
                alertMessage = {
                    'title': 'Erro',
                    'message': 'Ocorreu um erro ao criar este jogo. Por favor, tente mais tarde.'
                };
        }

        await this.setState({isLoading: false});

        Alert.alert(
            alertMessage.title,
            alertMessage.message,
            [
                {text: 'OK', onPress: () => {
                        this.resetData();
                        this.props.navigation.goBack();
                    }},
            ],
            {cancelable: false},
        );
    };


    render() {

        const steps = [{
            component: (
                <Step1
                    key={'step1'}
                    setStepDisabled={(disabled) => this.setStepDisabled(disabled)}
                />
            )
        }, {
            component: (
                <Step2
                    key={'step2'}
                    setStepDisabled={(disabled) => this.setStepDisabled(disabled)}
                />
            )
        }, {
            component: (
                <Step3
                    key={'step3'}
                    setStepDisabled={(disabled) => this.setStepDisabled(disabled)}
                />
            )
        }, {
            component: (
                <Step4
                    key={'step4'}
                    setStepDisabled={(disabled) => this.setStepDisabled(disabled)}
                />
            )
        },{
            component: (
                <Step5
                    key={'step5'}
                    setStepDisabled={(disabled) => this.setStepDisabled(disabled)}
                    navigation={this.props.navigation}
                />
            )
        }];

        return (
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
                {
                    !this.state.isLoading &&
                    <Wizard
                        cancel={this.resetData.bind(this)}
                        totalSteps={this.state.totalSteps}
                        currentStep={this.state.stepID}
                        isNextDisabled={this.state.disabledSteps[this.state.stepID]}
                        onNextHandler={() => this.increaseStep()}
                        onPreviousHandler={() => this.decreaseStep()}
                        onSubmitHandler={() => this.onSubmitHandler()}
                    >
                        {
                            steps.map(item => item.component)
                        }
                    </Wizard>
                }
            </View>
        );
    }
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    newOrEditGame: state.newOrEditGame
});

const mapDispatchToProps = dispatch => ({
    resetGame: () => {
        dispatch(resetGame());
    },
    setAllInformation: (
        allLocals, allCoaches, allSecretaries,
        allEchelons, allAthletes, allTeams,
        allCompetitions, allSeasons
    ) => {
        dispatch(setAllInformation(
            allLocals, allCoaches, allSecretaries,
            allEchelons, allAthletes, allTeams,
            allCompetitions, allSeasons
        ));
    },
    setAthletes: (ids) => {
        dispatch(setAthletes(ids))
    },
    setStartTime: (date) => {
        dispatch(setStartTime(date))
    },
    setEndTime: (date) => {
        dispatch(setEndTime(date))
    },
    addCoach: (id) => {
        dispatch(addCoach(id))
    },
    addSecretary: (id) => {
        dispatch(addSecretary(id))
    },
    setEchelon: (id) => {
        dispatch(setEchelon(id))
    },
    setLocalID: (id) => {
        dispatch(setLocalID(id))
    },
    setSeasonID: (id) => {
        dispatch(setSeasonID(id))
    },
    setOpponentID: (id) => {
        dispatch(setOpponentID(id))
    },
    setHoursNotice: (hours) => {
        dispatch(setHoursNotice(hours))
    },
    setCompetitionID: (id) => {
        dispatch(setCompetitionID(id))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewOrEditGame);