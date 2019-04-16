import React, { PureComponent } from 'react';
import { View, Alert } from 'react-native';

import Step from './Step';
import {connect} from "react-redux";
import {decreaseStep, increaseStep, setStep} from "../../../../../redux/actions/newTraining";

class Wizard extends PureComponent {

    constructor(props) {
        super(props);
    }

    static Step = Step;

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

    _onSubmit = () => {
        Alert.alert('Sucesso', "Treino criado com sucesso.");
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

    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({

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