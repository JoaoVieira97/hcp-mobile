import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    Dimensions
} from 'react-native';

import {connect} from 'react-redux';

import {Agenda} from 'react-native-calendars';

const gameMark = {key:'game', color: '#fab1a0'};
const trainingMark = {key:'training', color: '#81ecec'};

const WIDTH = Dimensions.get('window').width;

class CalendarScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            items: {},
            markedDates: {}
        };
    }

    static navigationOptions = {
        headerTitle: 'Calendário',
    };

    async getAllTrainings() {

        const params = {
            domain: [['id', '>=', '0']],
            fields: ['id'],
        };

        let response = await this.props.odoo.search('ges.treino', params);
        if (response.success) {
            //console.log(response.data);
            return response;
        }
        else return {};
    }

    async getTraining(id) {

        const params = {
            ids: [id],
            fields: ['atletas','start_datetime', 'description', 'evento_desportivo', 'duracao'],
        };

        const response = await this.props.odoo.get('ges.treino', params);
        if (response.success) {
            //console.log(response.data);
            return response;
        }
        else return {};
    }

    async getTrainings() {

        let allTrainings = await this.getAllTrainings();
        
        for (let i = 20; i < 40; i++){
        //for (let i = 0; i < allTrainings.data.length; i++){
            
            let training = await this.getTraining(allTrainings.data[i]);

            // get training data
            if (training.success) {
            
                // get data object
                const data = training.data[0];

                // parse data
                const description = data.description;
                //const event = data.evento_desportivo[1];
                const duration = data.duracao;
                const startTime = data.start_datetime;
                const startTimeDate = (startTime.split(" "))[0];
                const startTimeHour = (startTime.split(" "))[1];

                let finalObject = {
                    type: 1,
                    title: description,
                    time: 'Início: ' + startTimeHour,
                    description: 'Duração: ' + duration + ' min'
                };

                //Update this.state.items -> concat to array if necessary
                if (!(startTimeDate in this.state.items)){
                    this.state.items[startTimeDate] = [];
                }
                this.state.items[startTimeDate].push(finalObject);

                /*
                this.setState(state => ({
                    items: {...state.items, ...finalObject}
                }));
                */

                if (!(startTimeDate in this.state.markedDates)){
                    this.state.markedDates[startTimeDate] = {
                        dots: [trainingMark],
                        selectedColor: '#e6e6e6'
                    }
                }
                else{
                    if (!(this.state.markedDates[startTimeDate].dots.includes(trainingMark))){
                        this.state.markedDates[startTimeDate].dots.push(trainingMark)
                    }
                }

                /*
                let finalMarkedDates = {
                    [startTimeDate] : {
                        dots: [trainingMark],
                        selectedColor: '#e6e6e6'
                    }
                };

                this.setState(state => ({
                    markedDates: {...state.markedDates, ...finalMarkedDates}
                }));
                */
            }
        }
    }

    async getAllGames() {

        const params = {
            domain: [['id', '>=', '0']],
            fields: ['id'],
        };

        let response = await this.props.odoo.search('ges.jogo', params);
        if (response.success) {
            //console.log(response.data);
            return response;
        }
        else return {};
    }

    async getGame(id) {

        const params = {
            ids: [id],
            fields: ['start_datetime', 'equipa_adversaria', 'description', 'evento_desportivo'],
        };

        const response = await this.props.odoo.get('ges.jogo', params);
        if (response.success) {
            //console.log(response.data);
            return response;
        }
        else return {};
    }

    async getGames() {

        let allGames = await this.getAllGames();

        for (let i = 0; i < 10; i++){
        //for (let i = 0; i < allGames.data.length; i++){

            let game = await this.getGame(allGames.data[i]);

            if (game.success) {

                // get data object
                const data = game.data[0];

                // parse data
                const description = data.description;
                const opponent = data.equipa_adversaria[1];
                //const event = data.evento_desportivo[1];
                const startTime = data.start_datetime;
                const startTimeDate = (startTime.split(" "))[0];
                const startTimeHour = (startTime.split(" "))[1];

                let finalObject = {
                        type: 0,
                        title: description,
                        time: 'Início ' + startTimeHour,
                        description: 'Adversário: ' + opponent
                };

                //Update this.state.items -> concat to array if necessary
                if (!(startTimeDate in this.state.items)){
                    this.state.items[startTimeDate] = [];
                }
                this.state.items[startTimeDate].push(finalObject);

                /*
                this.setState(state => ({
                    items: {...state.items, ...finalObject}
                }));
                */

                if (!(startTimeDate in this.state.markedDates)){
                    this.state.markedDates[startTimeDate] = {
                        dots: [gameMark],
                        selectedColor: '#e6e6e6'
                    }
                }
                else{
                    if (!(this.state.markedDates[startTimeDate].dots.includes(gameMark))){
                        this.state.markedDates[startTimeDate].dots.push(gameMark)
                    }
                }

                /*let finalMarkedDates = {
                    [startTimeDate] : {
                        dots: [gameMark],
                        selectedColor: '#e6e6e6'
                    }
                };

                this.setState(state => ({
                    markedDates: {...state.markedDates, ...finalMarkedDates}
                }));*/
            }
        }
    }

    async componentDidMount() {

        // Get games
        await this.getGames();

        // Get trainigs
        await this.getTrainings();

        // Just for test
        const finalObject = {
            '2019-03-10': [{
                type: 0,
                title: 'Jogo de inauguração',
                time: 'Início 10:00h',
                description: 'Adversário: Rossas'
            },{
                type: 1,
                title: 'Treino para a Champions',
                time: 'Início 10:00h',
                description: 'Duração: 90 min'
            }]
        };

        this.setState(state => ({
            items: {...state.items, ...finalObject}
        }));

        const finalMark = {
            '2019-03-10': {
                dots: [trainingMark, gameMark],
                selectedColor: '#e6e6e6',
            }
        };

        this.setState(state => ({
            markedDates: {...state.markedDates, ...finalMark}
        }));

        //console.log(this.state.items);
        //console.log(this.state.markedDates);
    };

    render() {
        return (
            <Agenda
                items = {this.state.items}
                //selected={'2019-03-06'}
                renderItem = {renderItem}
                renderEmptyDate = {renderEmptyDate}
                rowHasChanged = {rowHasChanged}
                markedDates = {this.state.markedDates}
                markingType={'multi-dot'}
            />
        );
    }
}

function renderItem(item) {

    let bgColor = '#fab1a0';
    let hoquei_Logo = require('../img/hoquei-icon-black.png');
    if (item.type === 1) {
        bgColor = '#81ecec';
        hoquei_Logo = require('../img/hoquei-icon-white.png');
    }

    return (
            <View style={[styles.item, {backgroundColor: bgColor, flexDirection: 'row'}]}>
                <View style={{width: WIDTH*0.60}}>
                    <Text style={{fontWeight: '600'}}>{item.title}</Text>
                    <Text>{item.time}</Text>
                    <Text>{item.description}</Text>
                </View>
                <View style={{width: 50}}>
                    <Image
                        source={hoquei_Logo}
                        style={{width: 50,height: 50,flex: 1}}
                    />
                </View>
            </View>
    );
}

function renderEmptyDate() {
    return (
        <View style={styles.emptyDate}>Sem dados.</View>
    );
}

function rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarScreen);


const styles = StyleSheet.create({
    item: {
        flex: 1,
        borderRadius: 5,
        padding: 15,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30
    }
});