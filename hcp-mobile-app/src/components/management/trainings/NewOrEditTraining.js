import React, {Component} from 'react';
import {Alert, View} from 'react-native';
import {connect} from 'react-redux';
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import Loader from "../../screens/Loader";
import {
    resetTraining,
    setAllInformation
} from "../../../redux/actions/newOrEditTraining";
import {
    fetchAllLocals,
    fetchAllCoaches,
    fetchAllSecretaries,
    fetchAllEchelons,
    fetchAllAthletes
} from "../fetchFunctionsNewGameTraining";
import Wizard from "../Wizard";
import Step1 from "./NewOrEditTrainingSteps/Step1";
import Step2 from "./NewOrEditTrainingSteps/Step2";
import Step3 from "./NewOrEditTrainingSteps/Step3";
import Step4 from "./NewOrEditTrainingSteps/Step4";



class NewOrEditTraining extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            stepID: 0,
            totalSteps: 4,
            disabledSteps: [true, true, false, true],
        }
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'CRIAR TREINO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });
    
    componentWillMount() {

        this.resetData();
    }

    async componentDidMount() {

        // get all information needed for creating new training
        await this.fetchAllInformation();
        this.setState({isLoading: false});
    }

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
        this.props.resetTraining();
    };

    /**
     * Get all information that is needed to create or edit a training.
     * @returns {Promise<void>}
     */
    fetchAllInformation = async () => {

        let error = false;

        let allLocals, allCoaches, allSecretaries,
            allEchelons, allAthletes;

        allLocals = await fetchAllLocals(this.props.odoo);
        if (allLocals.length > 0) {

            allCoaches = await fetchAllCoaches(this.props.odoo);
            if (allCoaches.length > 0) {

                allSecretaries = await fetchAllSecretaries(this.props.odoo);
                if (allSecretaries.length > 0) {

                    allEchelons = await fetchAllEchelons(this.props.odoo);
                    if (allEchelons.length > 0) {

                        allAthletes = await fetchAllAthletes(this.props.odoo);
                        if (allAthletes === null)
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
                allEchelons, allAthletes
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

        const startDate = this.props.newOrEditTraining.rawStartTime.toISOString().split('T');
        const endDate = this.props.newOrEditTraining.rawEndTime.toISOString().split('T');

        const newTraining = {
            start: startDate[0] + ' ' + startDate[1].slice(0,8),
            stop: endDate[0] + ' ' + endDate[1].slice(0,8),
            epoca: this.props.newOrEditTraining.rawSeasonID,
            escalao: this.props.newOrEditTraining.rawEchelonID,
            local: this.props.newOrEditTraining.rawLocalID,
            treinador: [[6,0, this.props.newOrEditTraining.rawCoachesIDs]],
            seccionistas: [[6,0, this.props.newOrEditTraining.rawSecretariesIDs]],
            atletas: [[6,0, this.props.newOrEditTraining.rawAthletesIDs]],
        };

        let alertMessage;
        const response = await this.props.odoo.create('ges.treino', newTraining);
        if(response.success) {

            alertMessage = {
                'title': 'Sucesso',
                'message': 'O treino foi criado com sucesso. As pessoas envolvidas serão notificadas.'
            };
        }
        else {
            alertMessage = {
                'title': 'Erro',
                'message': 'Ocorreu um erro ao criar este treino. Por favor, tente mais tarde.'
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
        }];

        return (
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
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
            </View>
        );
    }
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    newOrEditTraining: state.newOrEditTraining
});

const mapDispatchToProps = dispatch => ({
    resetTraining: () => {
        dispatch(resetTraining());
    },
    setAllInformation: (
        allLocals, allCoaches, allSecretaries,
        allEchelons, allAthletes
    ) => {
        dispatch(setAllInformation(
            allLocals, allCoaches, allSecretaries,
            allEchelons, allAthletes
        ));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewOrEditTraining);