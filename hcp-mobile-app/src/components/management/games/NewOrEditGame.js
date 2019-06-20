import React, {Component} from 'react';
import {Alert, TouchableOpacity, View, Text} from 'react-native';
import {connect} from 'react-redux';
import {headerTitle} from "../../navigation/HeaderComponents";
import {Ionicons} from "@expo/vector-icons";
import Loader from "../../screens/Loader";
import {
    resetGame,
    setAllInformation
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
            stepID: 0,
            totalSteps: 5,
            disabledSteps: [true, true, true, true, true],
        }
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'CRIAR JOGO'
        ),
        headerLeft:
            <TouchableOpacity
                style={{
                    width: 42,
                    height: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 5
                }}
                //onPress = {() => navigation.cancelTraining()}
            >
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'}/>
            </TouchableOpacity>,
    });

    async componentDidMount() {

        // Define go back function
        // Used to cancel training
        this.props.navigation.cancelGame = () => this.cancelGame();

        // get all information needed for creating new game
        await this.fetchAllInformation();
        this.setState({isLoading: false});
    }

    cancelGame = () => {

        this.props.navigation.goBack();
        this.props.resetGame();
    };

    increaseStep = () => {
        this.setState(state => ({stepID: state.stepID + 1}));
        console.log(this.props.newOrEditGame);
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
                        {text: 'Voltar', onPress: () => this.cancelGame()},
                    ],
                    {cancelable: false},
                );
            });
        }
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
        }, {
            component: (<Step5 key={'step5'}/>)
        }
        ];

        return (
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
                <Wizard
                    cancel={this.cancelGame.bind(this)}
                    totalSteps={this.state.totalSteps}
                    currentStep={this.state.stepID}
                    isNextDisabled={this.state.disabledSteps[this.state.stepID]}
                    onNextHandler={() => this.increaseStep()}
                    onPreviousHandler={() => this.decreaseStep()}
                    onSubmitHandler={() => console.log("Submit")}
                >
                    {
                        steps.map(item => item.component)
                    }
                </Wizard>
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
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewOrEditGame);