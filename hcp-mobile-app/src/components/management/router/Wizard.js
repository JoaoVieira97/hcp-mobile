import React, { PureComponent } from 'react';
import { View, Alert } from 'react-native';

import Step from './Step';

export default class Wizard extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            index: 0
        }
    }

    static Step = Step;

    _nextStep = () => {
        if (this.state.index !== this.props.children.length - 1) {
            this.setState(prevState => ({
                index: prevState.index + 1,
            }));
        }
    };

    _prevStep = () => {
        if (this.state.index !== 0) {
            this.setState(prevState => ({
                index: prevState.index - 1,
            }));
        }
    };

    _onSubmit = () => {
        Alert.alert('Sucesso', "Treino criado com sucesso.");
    };

    render() {

        return (
            <View style={{ flex: 1 }}>
                {React.Children.map(this.props.children, (el, index) => {
                    if (index === this.state.index) {
                        return React.cloneElement(el, {
                            totalIndex: this.props.children.length,
                            currentIndex: this.state.index,
                            nextStep: this._nextStep,
                            prevStep: this._prevStep,
                            isLast: this.state.index === this.props.children.length - 1,
                            onSubmit: this._onSubmit,
                        });
                    }

                    return null;
                })}
            </View>
        );
    }
}
