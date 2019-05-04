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

        /*
        const coachInfo = this.props.user.groups.filter(item => item.name === 'Treinador');
        const response = await this.props.odoo.create(
            'ges.treino',
            {
                start: '2019-05-10 19:30:00',
                stop: '2019-05-10 20:30:00',
                escalao: 8,
                treinador: [[6,0,[coachInfo[0].id]]],
                local: 3,
                seccionistas: [[6,0,[12]]],
                atletas: [[6,0,[60, 61, 63]]]
            }
        );
        */

        const startDate = this.props.newTraining.startDateTime.split('T');
        const endDate = this.props.newTraining.endDateTime.split('T');

        const newTraining = {
            start: startDate[0] + ' ' + startDate[1].slice(0,8),
            stop: endDate[0] + ' ' + endDate[1].slice(0,8),
            escalao: this.props.newTraining.echelonId,
            treinador: [[6,0,this.props.newTraining.coaches]],
            local: this.props.newTraining.localId,
            seccionistas: [[6,0,this.props.newTraining.athletes]],
            atletas: [[6,0,this.props.newTraining.secretaries]],
        };

        console.log(newTraining);

        const response = await this.props.odoo.create('ges.treino', newTraining);
        console.log(response);
        if(response.success) {
            Alert.alert(
                "Sucesso",
                "Treino de teste criado com sucesso. ID: " + response.data.toString(),
                [
                    {text: 'OK', onPress: () => this.props.navigation.cancelTraining()},
                ],
                {cancelable: false},
            );
        }
        else {
            Alert.alert(
                "Erro",
                "Treino de teste não foi criado.",
                [
                    {text: 'OK', onPress: () => this.props.navigation.cancelTraining()},
                ],
                {cancelable: false},
            );
        }
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
                            //isStepDisabled: false,
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