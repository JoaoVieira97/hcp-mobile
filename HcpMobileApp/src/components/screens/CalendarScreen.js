import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet
} from 'react-native';
import {Agenda} from 'react-native-calendars';

export default class CalendarScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            items: {
                /*
                '2019-03-06': [
                    {name: 'Treino sub-13', height: 50},
                    {name: 'Jogo', height: 100}
                ],
                '2019-03-07': [],
                '2019-03-08': [
                    {name: 'Treino sub-15', height: 10},
                    {name: 'Jogo Benjamins', height: 60}
                ],
                '2019-03-09': [],
                '2019-03-10': [
                    {name: 'Treino sub-19', height: 100},
                    {name: 'Jogo Treino', height: 60}
                ],*/
            }
        };
    }

    static navigationOptions = {
        headerTitle: 'Calendário',
    };

    async componentDidMount() {

        if (global.odoo) {
            const params = {
                ids: [285],
                fields: ['start_datetime', 'equipa_adversaria', 'description', 'evento_desportivo'],
            };
            let jogo = await global.odoo.get('ges.jogo', params);
            let desc = jogo.data[0].description;
            let oponent = jogo.data[0].equipa_adversaria[1];
            let event_type = jogo.data[0].evento_desportivo[1];
            let time_hour = jogo.data[0].start_datetime;
            let times = time_hour.split(" ");

            this.state.items['2019-03-06'] = [];
            this.state.items['2019-03-06'].push({
                type: 0,
                title: desc,
                time: 'Hours: ' + times[1],
                description: 'VS  ' + oponent
            });


            const params2 = {
                ids: [23],
                fields: ['start_datetime', 'description', 'evento_desportivo', 'duracao'],
            };
            let treino = await global.odoo.get('ges.treino', params2);
            desc = treino.data[0].description;
            event_type = treino.data[0].evento_desportivo[1];
            let duration = treino.data[0].duracao;
            time_hour = treino.data[0].start_datetime;
            times = time_hour.split(" ");

            this.state.items['2019-03-06'].push({
                type: 1,
                title: desc,
                time: 'Hours: ' + times[1],
                description: 'Duration: ' + duration
            });

        }
    };

//type JOGO / TREINO
//title
//time
//description

    render() {
        return (
            <Agenda
                items={this.state.items}
                selected={'2019-03-06'}
                renderItem={this.renderItem.bind(this)}
                renderEmptyDate={this.renderEmptyDate.bind(this)}
                rowHasChanged={this.rowHasChanged.bind(this)}
            />
        );
    }

    renderItem(item) {

        let bgColor = "#fab1a0";
        if (item.type === 1) {
            bgColor = "#81ecec";
        }

        return (
            <View style={[styles.item, {backgroundColor: bgColor}]}>
                <Text style={{fontWeight: '600'}}>{item.title}</Text>
                <Text>{item.time}</Text>
                <Text>{item.description}</Text>
            </View>
        );
    }

    renderEmptyDate() {
        return (
            <View style={styles.emptyDate}></View>
        );
    }

    rowHasChanged(r1, r2) {
        return r1.name !== r2.name;
    }

}

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