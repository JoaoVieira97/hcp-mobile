import React from 'react';
import { connect } from 'react-redux';
import {View, StyleSheet, Dimensions} from 'react-native';

import {Button,  ProgressBar} from 'react-native-paper';
import {colors} from "../../../../../styles/index.style";

class Step extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.root}>
                {this.props.children}
                <View style={styles.footer}>
                    <View style={styles.footerProgressBar}>
                        <ProgressBar
                            progress={(this.props.currentIndex + 1) / this.props.totalIndex}
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
                                disabled={this.props.currentIndex === 0}
                                onPress={this.props.prevStep}
                            >
                                Voltar
                            </Button>
                        </View>
                        <View style={{flex: 1}}>
                            {this.props.isLast ? (
                                <Button
                                    color={colors.redColor}
                                    mode="contained"
                                    contentStyle={styles.buttonInside}
                                    style={styles.buttonOutside}
                                    onPress={this.props.onSubmit}
                                    disabled={this.props.isStepDisabled}
                                >
                                    Concluir
                                </Button>
                            ) : (
                                <Button
                                    color={colors.redColor}
                                    mode="contained"
                                    contentStyle={styles.buttonInside}
                                    style={styles.buttonOutside}
                                    onPress={this.props.nextStep}
                                    disabled={this.props.isStepDisabled}
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

const mapStateToProps = state => ({
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Step);

const window = Dimensions.get('window');
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    footer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        paddingBottom: 10,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#fff'
    },
    footerProgressBar: {
        width: window.width / 2,
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
