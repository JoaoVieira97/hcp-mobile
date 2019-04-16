import React, { Component } from 'react';

import {Alert, Picker, StyleSheet, Text, TouchableOpacity, View, Button} from 'react-native';

import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import DateTimePicker from "react-native-modal-datetime-picker";
import {
    setEndDateTime,
    setLocalId,
    setStartDateTime
} from "../../../../redux/actions/newTraining";
import Loader from "../../../screens/Loader";


class NewTrainingStep1 extends Component {

    constructor(props) {
        super(props);

        const today = new Date();

        this.state = {
            isLoading: true,
            today: today,
            isDateTimeStartPickerVisible: false,
            isDateTimeEndPickerVisible: false,
            startDateTimeRaw : today,
            endDateTimeRaw: today,
        };
    }

    async componentDidMount() {

        // Define start date time on clock
        let startDateTimeRaw = undefined;
        if(this.props.newTraining.startDateTime !== "Selecione o horário de ínicio") {
            startDateTimeRaw = new Date(this.props.newTraining.startDateTime);
        }

        // Define end date time on clock
        let endDateTimeRaw = undefined;
        if(this.props.newTraining.endDateTime !== "Selecione o horário de fim") {
            endDateTimeRaw = new Date(this.props.newTraining.endDateTime);
        }

        this.setState(state => ({
            startDateTimeRaw: startDateTimeRaw ? startDateTimeRaw : state.startDateTimeRaw,
            endDateTimeRaw: endDateTimeRaw ? endDateTimeRaw : state.startDateTimeRaw,
            isLoading: false,
        }));
    }

    /**
     * Formats date as "YYYY-MM-DD | HH:MMh".
     * @param dateString
     * @returns {string}
     */
    parsingDate = (dateString) => {

        if(dateString !== "Selecione o horário de ínicio" && dateString !== "Selecione o horário de fim") {
            const dateTimeArray = dateString.split('T');
            return dateTimeArray[0] + ' | ' + dateTimeArray[1].slice(0,5) + 'h';
        }

        return dateString;
    };

    _showDateTimeStartPicker = () => this.setState({isDateTimeStartPickerVisible: true});

    _hideDateTimeStartPicker = () => this.setState({isDateTimeStartPickerVisible: false});

    _handleDateStartPicked = (date) => {

        if (date.getTime() > (new Date())) {

            this.setState({
                startDateTimeRaw: new Date(date)
            });

            this.props.setStartDateTime(date.toISOString());
        }
        else {
            Alert.alert('Erro', 'Por favor, defina um horário válido.');
        }

        this._hideDateTimeStartPicker();
    };

    _showDateTimeEndPicker = () => this.setState({isDateTimeEndPickerVisible: true});

    _hideDateTimeEndPicker = () => this.setState({isDateTimeEndPickerVisible: false});

    _handleDateEndPicked = (date) => {

        if (date.getTime() > this.state.startDateTimeRaw) {

            this.setState({
                endDateTimeRaw: new Date(date)
            });

            this.props.setEndDateTime(date.toISOString());
        }
        else {
            Alert.alert('Erro', 'Por favor, defina um horário válido.');
        }

        this._hideDateTimeEndPicker();
    };


    render() {

        const locals = this.props.newTraining.allLocals.map((data) => {
            return (
                <Picker.Item label={data.display_name} value={data.id} key={data.id} />
            );
        });

        return (
            <View style={styles.container}>
                {
                    !this.state.isLoading &&
                    <Animatable.View animation={"fadeIn"}>
                        <Card elevation={6}>
                            <Card.Title
                                title="Horário e local de realização"
                                subtitle="Defina todos os campos em baixo."
                                left={(props) => <Ionicons name="md-calendar" size={20} color={'#000'} {...props}/>}
                            />
                            <Card.Content>
                                <View>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Início</Text>
                                    <TouchableOpacity onPress={this._showDateTimeStartPicker.bind(this)} style={{
                                        borderRadius: 5,
                                        backgroundColor: '#f2f2f2',
                                        padding: 10,
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={{fontSize: 16}}>
                                            {this.parsingDate(this.props.newTraining.startDateTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePicker
                                        date={this.state.startDateTimeRaw}
                                        mode={'datetime'}
                                        cancelTextIOS={'Cancelar'}
                                        confirmTextIOS={'Ok'}
                                        minimumDate={this.state.today}
                                        is24Hour={true}
                                        isVisible={this.state.isDateTimeStartPickerVisible}
                                        onConfirm={this._handleDateStartPicked}
                                        onCancel={this._hideDateTimeStartPicker}
                                    />
                                </View>
                                <View style={{marginTop: 10}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Fim</Text>
                                    <TouchableOpacity onPress={this._showDateTimeEndPicker.bind(this)} style={{
                                        borderRadius: 5,
                                        backgroundColor: '#f2f2f2',
                                        padding: 10,
                                        justifyContent: 'center'
                                    }}>
                                        <Text style={{fontSize: 16}}>
                                            {this.parsingDate(this.props.newTraining.endDateTime)}
                                        </Text>
                                    </TouchableOpacity>
                                    <DateTimePicker
                                        date={this.state.endDateTimeRaw}
                                        mode={'datetime'}
                                        cancelTextIOS={'Cancelar'}
                                        confirmTextIOS={'Ok'}
                                        minimumDate={this.state.startDateTimeRaw}
                                        is24Hour={true}
                                        isVisible={this.state.isDateTimeEndPickerVisible}
                                        onConfirm={this._handleDateEndPicked}
                                        onCancel={this._hideDateTimeEndPicker}
                                    />
                                </View>
                                <View style={{marginTop: 30}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Local</Text>
                                    <View style={{
                                        borderRadius: 5,
                                        backgroundColor: '#f2f2f2',
                                        justifyContent: 'center'
                                    }}>
                                        <Picker
                                            //mode="dropdown"
                                            //prompt={'Locais disponíveis'}
                                            selectedValue={this.props.newTraining.localId}
                                            onValueChange={(itemValue) => (
                                                this.props.setLocalId(itemValue)
                                            )}>
                                            {locals}
                                        </Picker>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </Animatable.View>
                }
                <Loader isLoading={this.state.isLoading}/>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
});


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({

    setStartDateTime: (startDateTime) => {
        dispatch(setStartDateTime(startDateTime))
    },
    setEndDateTime: (endDateTime) => {
        dispatch(setEndDateTime(endDateTime))
    },
    setLocalId: (localId) => {
        dispatch(setLocalId(localId))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep1);