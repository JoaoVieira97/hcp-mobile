import React, { PureComponent } from 'react';
import { View, Alert } from 'react-native';

import Step from './Step';
import {connect} from "react-redux";
import {decreaseStep, increaseStep, resetTraining, setStep} from "../../../../../redux/actions/newTraining";

class Wizard extends PureComponent {

    constructor(props) {
        super(props);
    }

    static Step = Step;

    /**
     * When user press next.
     * @private
     */
    _nextStep = () => {
        if (this.props.newTraining.stepId !== this.props.children.length - 1) {

            if(this.props.newTraining.addSecretaryFlag !== undefined) {
                if (this.props.newTraining.addSecretaryFlag)
                    this.props.increaseStep();
                else
                    this.props.setStep(3);
            }
            else
                this.props.increaseStep();
        }
    };

    /**
     * When user press previous.
     * @private
     */
    _prevStep = () => {

        if (this.props.newTraining.stepId !== 0) {

            if(this.props.newTraining.stepId === 3) {
                if(this.props.newTraining.addSecretaryFlag !== undefined) {
                    if (this.props.newTraining.addSecretaryFlag)
                        this.props.decreaseStep();
                    else
                        this.props.setStep(1);
                }
                else
                    this.props.decreaseStep();
            }
            else
                this.props.decreaseStep();
        }
    };

    /**
     * When user press submit.
     * @private
     */
    _onSubmit = async () => {

        const startDate = this.props.newTraining.startDateTime.split('T');
        const endDate = this.props.newTraining.endDateTime.split('T');

        const newTraining = {
            start: startDate[0] + ' ' + startDate[1].slice(0,8),
            stop: endDate[0] + ' ' + endDate[1].slice(0,8),
            escalao: this.props.newTraining.echelonId,
            treinador: [[6,0,this.props.newTraining.coaches]],
            local: this.props.newTraining.localId,
            seccionistas: [[6,0,this.props.newTraining.secretaries]],
            atletas: [[6,0,this.props.newTraining.athletes]],
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

        Alert.alert(
            alertMessage.title,
            alertMessage.message,
            [
                {text: 'OK', onPress: () => {this.props.navigation.cancelTraining()}},
            ],
            {cancelable: false},
        );
    };

    render() {

        return (
            <View style={{ flex: 1 }}>
                {React.Children.map(this.props.children, (el, index) => {
                    if (index === this.props.newTraining.stepId) {
                        return React.cloneElement(el, {
                            totalIndex: this.props.children.length,
                            currentIndex: this.props.newTraining.stepId,
                            nextStep: this._nextStep,
                            prevStep: this._prevStep,
                            isStepDisabled: this.props.newTraining.isStepReady[this.props.newTraining.stepId] ?
                                !this.props.newTraining.isStepReady[this.props.newTraining.stepId] :
                                true
                            ,
                            isLast: this.props.newTraining.stepId === this.props.children.length - 1,
                            onSubmit: this._onSubmit,
                        });
                    }

                    return null;
                })}
            </View>
        );
    }
}


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user,
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({
    resetTraining: () => {
        dispatch(resetTraining())
    },
    setStep: (id) => {
        dispatch(setStep(id))
    },
    increaseStep: () => {
        dispatch(increaseStep())
    },
    decreaseStep: () => {
        dispatch(decreaseStep())
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Wizard);