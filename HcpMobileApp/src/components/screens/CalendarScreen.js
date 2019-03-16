import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
    Alert
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
            markedDates: {},
            months: []
        };
    }

    static navigationOptions = {
        headerTitle: 'Calendário',
    };

    async getLocal(id) {

        const params = {
            ids: [id],
            fields: ['coordenadas', 'descricao'],
        };

        const response = await this.props.odoo.get('ges.local', params);
        if (response.success) {
            return response;
        }
        return {};
    }

    async getTrainings(date1, date2) {

        const params = {
            domain: [
                ['start_datetime', '>', date1],
                ['start_datetime', '<', date2]
            ],
            fields: ['local', 'atletas', 'start_datetime', 'description', 'duracao'],
            order: 'start_datetime ASC'
        };

        const response = await this.props.odoo.search_read('ges.treino', params);
        if (response.success){
            for (let i=0; i < response.data.length; i++){
                let training = response.data[i];
                this.parseTraining(training);
            }
        }
    }

    async parseTraining(training) {
        const description = training.description;
        const duration = training.duracao;
        const startTime = training.start_datetime;
        const startTimeDate = (startTime.split(" "))[0];
        const startTimeHour = (startTime.split(" "))[1];
        const localName = training.local[1];

        let local = await this.getLocal(training.local[0]);

        let local_f = (local.success && local.data[0].coordenadas)? {
            latitude: parseFloat(local.data[0].coordenadas.split(", ")[0]),
            longitude: parseFloat(local.data[0].coordenadas.split(", ")[1])
        } : null

        let finalObject = {
            type: 1,
            title: description,
            time: 'Início: ' + startTimeHour,
            description: 'Duração: ' + duration + ' min',
            local: localName,
            coordinates: local_f
        };

        // ------ Update Items ------

        let newItems = this.state.items;
        if (!(startTimeDate in newItems)){
            newItems[startTimeDate] = [];
        }
        newItems[startTimeDate].push(finalObject);

        this.setState({items: newItems});

        // ------ Update MarkedDates ------

        let newMarks = this.state.markedDates;
        if (!(startTimeDate in newMarks)){
            newMarks[startTimeDate] = {
                dots: [trainingMark],
                selectedColor: '#e6e6e6'
            }
        }
        else{
            if (!(newMarks[startTimeDate].dots.includes(trainingMark))){
                newMarks[startTimeDate].dots.push(trainingMark)
            }
        }

        this.setState({markedDates: newMarks});
  
    }

    async getGames(date1, date2) {

        const params = {
            domain: [
                ['start_datetime', '>', date1],
                ['start_datetime', '<', date2]
            ],
            fields: ['local', 'start_datetime', 'equipa_adversaria', 'description'],
            order: 'start_datetime ASC'
        };

        const response = await this.props.odoo.search_read('ges.jogo', params);
        if (response.success){
            for (let i=0; i < response.data.length; i++){
                let game = response.data[i];
                this.parseGame(game);
            }
        }
    }

    async parseGame(game){
        const description = game.description;
        const opponent = game.equipa_adversaria[1];
        const startTime = game.start_datetime;
        const startTimeDate = (startTime.split(" "))[0];
        const startTimeHour = (startTime.split(" "))[1];
        const localName = game.local[1];

        let local = await this.getLocal(game.local[0]);

        let local_f = (local.success && local.data[0].coordenadas)? {
            latitude: parseFloat(local.data[0].coordenadas.split(", ")[0]),
            longitude: parseFloat(local.data[0].coordenadas.split(", ")[1])
        } : null

        let finalObject = {
            type: 0,
            title: description,
            time: 'Início ' + startTimeHour,
            description: 'Adversário: ' + opponent,
            local: localName,
            coordinates: local_f
        };

        // ------ Update Items ------

        let newItems = this.state.items;
        if (!(startTimeDate in newItems)){
            newItems[startTimeDate] = [];
        }
        newItems[startTimeDate].push(finalObject);

        this.setState({items: newItems});

        // ------ Update MarkedDates ------

        let newMarks = this.state.markedDates;
        if (!(startTimeDate in newMarks)){
            newMarks[startTimeDate] = {
                dots: [gameMark],
                selectedColor: '#e6e6e6'
            }
        }
        else{
            if (!(newMarks[startTimeDate].dots.includes(gameMark))){
                newMarks[startTimeDate].dots.push(gameMark)
            }
        }

        this.setState({markedDates: newMarks});
    }

    render() {
        return (
            <Agenda
                items = {this.state.items}
                renderItem = {renderItem.bind(this)}
                renderEmptyData = {() => {return (<View><Text style={{margin: 25, textAlign: 'center', fontSize: 15, color: '#828583'}}>Sem eventos marcados.</Text></View>);}}
                rowHasChanged = {rowHasChanged}
                markedDates = {this.state.markedDates}
                markingType={'multi-dot'}
                loadItemsForMonth={this.loadItems.bind(this)}
            />
        );
    }

    loadItems(day){
        let month = day.month;
        let year = day.year;

        month_i = parseInt(month);
        year_i = parseInt(year);

        if (!(year_i in this.state.months)){
            let newMonths = this.state.months;
            newMonths[year_i] = [];
            this.setState({months: newMonths});
        }

        if (!(this.state.months[year_i].includes(month_i))){
            let newMonths = this.state.months;
            newMonths[year_i].push(month_i);
            this.setState({months: newMonths});

            let initial_date = year + '-' + month + '-01';
            let end_date = '';
            if (month_i === 12){
                end_date = String(year_i+1) + '-01-01'; 
            } else{
                end_date = year + '-' + String(month_i+1) + '-01';
            }
            console.log('Retrieving events in: ' + initial_date + ' <==> ' + end_date);
            this.getGames(initial_date, end_date);
            this.getTrainings(initial_date, end_date)
            
            console.log('DONE')
        } else{
            console.log('Events of month already retrieved before')
        }
    }

    dayToString(day, diff) {
        const time = day.timestamp + diff * 24 * 60 * 60 * 1000;
        const date = new Date(time);
        return date.toISOString().split('T')[0];
    }
}

function renderItem(item) {

    let bgColor = '#fab1a0';
    let hoquei_Logo = require('../img/hoquei-icon-black.png');
    if (item.type === 1) { // Training
        bgColor = '#81ecec';
        hoquei_Logo = require('../img/hoquei-icon-white.png');
    }

    return (
        <TouchableOpacity 
        onPress={() => this.props.navigation.navigate('EventScreen',{item})}
        style={[styles.item, {backgroundColor: bgColor, flexDirection: 'row'}]}>
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
        </TouchableOpacity>
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
        paddingTop: 30,
    }
});

/*const finalObject = {
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
}));*/