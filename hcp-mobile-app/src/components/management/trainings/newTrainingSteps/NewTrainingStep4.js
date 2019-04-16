import React, { Component } from 'react';

import {StyleSheet, View} from 'react-native';

import { connect } from 'react-redux';
import * as Animatable from "react-native-animatable";
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";


class NewTrainingStep4 extends Component {


    render() {

        return (
            <View style={styles.container}>
                <Animatable.View animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Escalão e atletas"
                            subtitle="Defina os atletas a serem convocados."
                            left={(props) => <Ionicons name="md-done-all" size={20} color={'#000'} {...props}/>}
                        />
                        <Card.Content>
                        </Card.Content>
                    </Card>
                </Animatable.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep4);