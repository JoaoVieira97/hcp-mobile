import React, {Component} from 'react';
import {View, ScrollView, StyleSheet, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import {Button, ProgressBar} from "react-native-paper";
import {colors} from "../../styles/index.style";


export default class Wizard extends Component {
    render() {
        return (
            <View style={styles.container}>
                <ScrollView style={styles.stepsContainer}>
                    {
                        React.Children.map(this.props.children, (el, index) => {
                            if (index === this.props.currentStep)
                                return el;
                            return null;
                        })
                    }
                </ScrollView>
                <View style={styles.footerContainer}>
                    <View style={styles.footerProgressBar}>
                        <ProgressBar
                            progress={(this.props.currentStep + 1) / this.props.totalSteps}
                            color={colors.redColor}
                        />
                    </View>
                    <View style={styles.footerButtons}>
                        <View style={{flex: 1}}>
                            <Button
                                color={colors.darkGrayColor}
                                mode="contained"
                                contentStyle={styles.buttonInside}
                                style={styles.buttonOutside}
                                disabled={this.props.currentStep === 0}
                                onPress={this.props.onPreviousHandler}
                            >
                                Voltar
                            </Button>
                        </View>
                        <View style={{flex: 1}}>
                            {this.props.totalSteps === this.props.currentStep + 1 ? (
                                <Button
                                    color={colors.redColor}
                                    mode="contained"
                                    contentStyle={styles.buttonInside}
                                    style={styles.buttonOutside}
                                    onPress={this.props.onSubmitHandler}
                                    disabled={this.props.isNextDisabled}
                                >
                                    Concluir
                                </Button>
                            ) : (
                                <Button
                                    color={colors.redColor}
                                    mode="contained"
                                    contentStyle={styles.buttonInside}
                                    style={styles.buttonOutside}
                                    onPress={this.props.onNextHandler}
                                    disabled={this.props.isNextDisabled}
                                >
                                    Avançar
                                </Button>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const footerHeight = 90;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    stepsContainer: {
        flex: 1,
        backgroundColor: colors.grayColor,
        marginBottom: footerHeight
    },
    footerContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        paddingBottom: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#fff',
        height: footerHeight,
    },
    footerProgressBar: {
        width: Dimensions.get('window').width / 2,
    },
    footerButtons: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonInside: {
        height: 45,
    },
    buttonOutside: {
        marginHorizontal: 10,
        justifyContent: 'center',
    }
});

Wizard.propTypes = {
    cancel: PropTypes.func.isRequired,
    totalSteps: PropTypes.number.isRequired,
    currentStep: PropTypes.number.isRequired,
    isNextDisabled: PropTypes.bool.isRequired,
    onNextHandler: PropTypes.func.isRequired,
    onPreviousHandler: PropTypes.func.isRequired,
    onSubmitHandler: PropTypes.func.isRequired,
};