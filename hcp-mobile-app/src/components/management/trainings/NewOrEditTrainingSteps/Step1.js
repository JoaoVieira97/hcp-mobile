import React, {Component} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import {colors} from "../../../../styles/index.style";
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from "react-native-modal-datetime-picker";
import ConvertTime from "../../../ConvertTime";
import {
    setLocalID,
    setStartTime,
    setEndTime
} from "../../../../redux/actions/newOrEditTraining";


// NO REMOVE
const startText = "Selecione o horário de início...";
const endText = "Selecione o horário de fim...";


class Step1 extends Component {

    constructor(props) {
        super(props);

        const today = new Date();

        this.state = {
            startTime: false,
            endTime: false,
            local: false,

            isDateTimeStartPickerVisible: false,
            isDateTimeEndPickerVisible: false,
            todayRaw: today,
        }
    }

    componentDidMount() {

        if(
            this.props.newOrEditTraining.rawStartTime !== startText &&
            this.props.newOrEditTraining.rawEndTime !== endText &&
            this.props.newOrEditTraining.rawLocalID !== undefined
        ) {
            this.props.setStepDisabled(false);
            this.setState({
                startTime: true,
                endTime: true,
                local: true,
            });
        }
    }

    isStepReady = () => {

        if(this.state.startTime && this.state.endTime && this.state.local) {
            this.props.setStepDisabled(false);
        }
        else {
            this.props.setStepDisabled(true);
        }
    };

    /**
     * Formats date as "YYYY-MM-DD | HH:MMh".
     * @param date
     * @returns {string}
     */
    parsingDate = (date) => {

        if(date !== startText && date !== endText) {

            const auxDateArray = (date.slice(0,19)).split('T');
            const auxDate = auxDateArray[0] + ' ' + auxDateArray[1];

            const convertTime = new ConvertTime();
            convertTime.setDate(auxDate);
            const dateObject = convertTime.getTimeObject();

            return dateObject.date + ' | ' + dateObject.hour;
        }

        return date;
    };

    showDateTimeStartPicker = () => this.setState({isDateTimeStartPickerVisible: true});

    hideDateTimeStartPicker = () => this.setState({isDateTimeStartPickerVisible: false});

    showDateTimeEndPicker = () => this.setState({isDateTimeEndPickerVisible: true});

    hideDateTimeEndPicker = () => this.setState({isDateTimeEndPickerVisible: false});

    handleDateStartPicked = (date) => {

        if (date.getTime() > this.state.todayRaw) {

            this.props.setStartTime(new Date(date));
            this.setState({startTime: true});
            this.isStepReady();
        }
        else {
            Alert.alert('Erro', 'Por favor, defina um horário válido.');
        }

        this.hideDateTimeStartPicker();
    };

    handleDateEndPicked = (date) => {

        if((this.props.newOrEditTraining.rawStartTime === startText)) {
            Alert.alert('Erro', 'Por favor, defina em primeiro o horário de início.');
        }
        else if (date.getTime() > this.props.newOrEditTraining.rawStartTime) {

            this.props.setEndTime(new Date(date));
            this.setState({endTime: true});
            this.isStepReady();
        }
        else {
            Alert.alert('Erro', 'Por favor, defina um horário válido.');
        }

        this.hideDateTimeEndPicker();
    };

    handleLocalPicked = async (value) => {

        if(value !== null) {
            this.props.setLocalID(value);
            await this.setState({local: true});
        }

        this.isStepReady();
    };

    render() {

        const locals = this.props.newOrEditTraining.allLocals.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name,
            color: '#000'
        }));

        return (
            <Animatable.View style={{margin: 20}} animation={"fadeIn"}>
                <Card elevation={6}>
                    <Card.Title
                        title="Horário e Local"
                        subtitle="Defina todos os campos."
                        left={(props) =>
                            <Ionicons name="md-calendar" size={20} color={'#000'} {...props} />
                        }
                    />
                    <Card.Content>
                        <View>
                            <Text style={styles.contentTitle}>Início</Text>
                            <TouchableOpacity
                                onPress={this.showDateTimeStartPicker.bind(this)}
                                style={styles.buttonContainer}
                            >
                                <Text style={{fontSize: 16}}>
                                    {
                                        this.props.newOrEditTraining.rawStartTime === startText ?
                                            this.props.newOrEditTraining.rawStartTime :
                                            this.parsingDate(this.props.newOrEditTraining.rawStartTime.toISOString())
                                    }
                                </Text>
                            </TouchableOpacity>
                            <DateTimePicker
                                date={
                                    this.props.newOrEditTraining.rawStartTime === startText ?
                                        this.state.todayRaw :
                                        this.props.newOrEditTraining.rawStartTime
                                }
                                mode={'datetime'}
                                cancelTextIOS={'Cancelar'}
                                confirmTextIOS={'Ok'}
                                minimumDate={this.state.todayRaw}
                                is24Hour={true}
                                isVisible={this.state.isDateTimeStartPickerVisible}
                                onConfirm={this.handleDateStartPicked}
                                onCancel={this.hideDateTimeStartPicker}
                            />
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={styles.contentTitle}>Fim</Text>
                            <TouchableOpacity
                                onPress={this.showDateTimeEndPicker.bind(this)}
                                style={styles.buttonContainer}
                            >
                                <Text style={{fontSize: 16}}>
                                    {
                                        this.props.newOrEditTraining.rawEndTime === endText ?
                                            this.props.newOrEditTraining.rawEndTime :
                                            this.parsingDate(this.props.newOrEditTraining.rawEndTime.toISOString())
                                    }
                                </Text>
                            </TouchableOpacity>
                            <DateTimePicker
                                date={
                                    this.props.newOrEditTraining.rawEndTime === endText ?
                                        this.state.todayRaw :
                                        this.props.newOrEditTraining.rawEndTime
                                }
                                mode={'datetime'}
                                cancelTextIOS={'Cancelar'}
                                confirmTextIOS={'Ok'}
                                minimumDate={
                                    this.props.newOrEditTraining.rawStartTime === startText ?
                                        this.state.todayRaw :
                                        this.props.newOrEditTraining.rawStartTime
                                }
                                is24Hour={true}
                                isVisible={this.state.isDateTimeEndPickerVisible}
                                onConfirm={this.handleDateEndPicked}
                                onCancel={this.hideDateTimeEndPicker}
                            />
                        </View>
                        <View style={{marginTop: 10}}>
                            <Text style={styles.contentTitle}>Local</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    placeholder={{
                                        label: 'Selecione um local...',
                                        value: null,
                                        color: colors.darkGrayColor,
                                    }}
                                    items={locals}
                                    onValueChange={this.handleLocalPicked.bind(this)}
                                    value={this.props.newOrEditTraining.rawLocalID}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </Animatable.View>
        );
    }
}

const styles = StyleSheet.create({
    contentTitle: {
        fontSize: 18,
        fontWeight: '400',
        letterSpacing: 3
    },
    pickerContainer: {
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
    },
    buttonContainer: {
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
        padding: 10,
        justifyContent: 'center'
    }
});

Step1.propTypes = {
    setStepDisabled: PropTypes.func.isRequired
};

const mapStateToProps = state => ({

    newOrEditTraining: state.newOrEditTraining
});

const mapDispatchToProps = dispatch => ({
    setLocalID: (id) => {
        dispatch(setLocalID(id))
    },
    setStartTime: (startTime) => {
        dispatch(setStartTime(startTime))
    },
    setEndTime: (endTime) => {
        dispatch(setEndTime(endTime))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Step1);