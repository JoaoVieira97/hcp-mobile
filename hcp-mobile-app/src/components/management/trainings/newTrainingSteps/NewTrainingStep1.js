import React, { Component } from 'react';

import {Alert, Picker, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import DateTimePicker from "react-native-modal-datetime-picker";


class NewTrainingStep1 extends Component {

    constructor(props) {
        super(props);

        const today = new Date();
        const today12h = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);

        this.state = {
            today: today,
            isDateTimeStartPickerVisible: false,
            isDateTimeEndPickerVisible: false,
            startDateTime: "Selecione o horário de ínicio",
            startDateTimeRaw : today12h,
            endDateTime: "Selecione o horário de fim",
            endDateTimeRaw: today12h,
            localValue: 0,
            locals: []
        };
    }

    async componentDidMount() {
        await this.fetchAllLocals();
    }

    /**
     * Fetch all locals.
     * @returns {Promise<void>}
     */
    fetchAllLocals = async () => {

        const  params = {
            fields: ['id', 'display_name'],
            order: 'descricao ASC'
        };

        const response = await this.props.odoo.search_read('ges.local', params);
        if (response.success && response.data.length > 0) {

            let localValue;
            const item = response.data.filter(item => (item.display_name === 'Nave Central'));

            if (item !== undefined && item.length > 0) {
                localValue = item[0].id;
            } else {
                localValue = response.data[0].id;
            }

            this.setState(({
                localValue: localValue,
                locals: response.data
            }));
        }
    };

    _showDateTimeStartPicker = () => this.setState({isDateTimeStartPickerVisible: true});

    _hideDateTimeStartPicker = () => this.setState({isDateTimeStartPickerVisible: false});

    _handleDateStartPicked = (date) => {

        const dateTimeArray = (date.toISOString()).split('T');
        const dateTime = dateTimeArray[0] + ' | ' + dateTimeArray[1].slice(0,5) + 'h';

        // 2019-03-01 01:30:00
        this.setState({
            startDateTime: dateTime,
            startDateTimeRaw: new Date(date)
        });

        this._hideDateTimeStartPicker();
    };

    _showDateTimeEndPicker = () => this.setState({isDateTimeEndPickerVisible: true});

    _hideDateTimeEndPicker = () => this.setState({isDateTimeEndPickerVisible: false});

    _handleDateEndPicked = (date) => {

        if (date.getTime() > this.state.startDateTimeRaw) {

            const dateTimeArray = (date.toISOString()).split('T');
            const dateTime = dateTimeArray[0] + ' | ' + dateTimeArray[1].slice(0,5) + 'h';

            // 2019-03-01 01:30:00
            this.setState({
                endDateTime: dateTime,
                endDateTimeRaw: new Date(date)
            });
        }
        else {
            Alert.alert('Erro', 'Por favor, defina um horário válido.');
        }

        this._hideDateTimeEndPicker();
    };


    render() {

        const locals = this.state.locals.map((data) => {
            return (
                <Picker.Item label={data.display_name} value={data.id} key={data.id} />
            );
        });

        return (
            <View style={styles.container}>
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
                                <Text style={{fontSize: 16}}>{this.state.startDateTime}</Text>
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
                                <Text style={{fontSize: 16}}>{this.state.endDateTime}</Text>
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
                                    selectedValue={this.state.localValue}
                                    onValueChange={(itemValue) => {
                                        this.setState({ localValue: itemValue });
                                }}>
                                    {locals}
                                </Picker>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
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
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep1);