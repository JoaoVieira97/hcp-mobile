import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import {Agenda, LocaleConfig} from 'react-native-calendars';
import {connect} from 'react-redux';

import {colors} from "../../styles/index.style";
import {MaterialCommunityIcons} from "@expo/vector-icons";

// Locale settings
LocaleConfig.locales['pt'] = {
    monthNames: [
        'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ],
    monthNamesShort: ['jan.','fev.','mar.','abr.','maio','jun.','jul.','ago.','set.','out.','nov.','dez.'],
    dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
    dayNamesShort: ['Dom.','Seg.','Terç.','Qua.','Qui.','Sex.','Sáb.']
};
LocaleConfig.defaultLocale = 'pt';


class AgendaItem extends React.PureComponent {

    render() {

        let color;
        switch (this.props.item.type) {
            case 1:
                color = colors.gradient1;
                break;
            default:
                color = colors.gradient2;
                break;
        }

        return (
            <TouchableOpacity
                onPress={() => {
                    // this.props.navigation.navigate('EventScreen',{item})
                }}
                style={[
                    styles.item, {
                        backgroundColor: '#fff',
                        flexDirection: 'row',
                        paddingVertical: 10,
                        paddingHorizontal: 5
            }]}>
                <View style={{
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 10,
                    marginRight: 15
                }}>
                    <MaterialCommunityIcons
                        name={'hockey-sticks'}
                        size={28}
                        color={color}
                    />
                </View>
                <View>
                    <Text style={{fontWeight: '600', marginBottom: 10, color: color}}>
                        {this.props.item.title}
                    </Text>
                    <Text>{this.props.item.time}</Text>
                    <Text>{this.props.item.description}</Text>
                </View>
            </TouchableOpacity>
        );

        /*
        return (
            <ListItem
                title={(
                    <Text style={{fontSize: 16, fontWeight: '700'}}>
                        {this.props.item.title}
                    </Text>
                )}
                subtitle={(
                    <View style={{flex: 1, flexDirection: 'column'}}>
                        <Text>{this.props.item.time}</Text>
                        <Text>{this.props.item.description}</Text>
                    </View>
                )}
                leftAvatar={(<MaterialCommunityIcons name={'hockey-sticks'} size={28} />)}
                chevron
                containerStyle={{
                    backgroundColor: color,
                    flex: 1,
                    borderRadius: 5,
                    padding: 10,
                    marginRight: 10,
                    marginTop: 17
                }}
                onPress={() => {

                }}
            />
        )
        */

        /*
        return (
            <View style={[styles.item, {height: this.props.item.height}]}>
                <Text>{this.props.item.name}</Text>
            </View>
        )
        */
    }
}

class CalendarScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRefreshing: false,
            items: {},
            monthsFetched: []
        };
    }

    async componentDidMount() {

        const today = new Date().toJSON().slice(0,10);

        await this.setState({
            items: {
                [today]: [],
            }
        });
    }

    /**
     * Função que busca os eventos compreendidos num dados mês.
     * Dado o dia, busca todos os eventos desse mês caso não estejam já em memória.
     * @param day
     * @returns {Promise<void>}
     */
    fetchData = async (day) => {

        // Get the first and the last days of the given month
        const date = new Date(day.timestamp);
        const firstDay = new Date(date.setDate(1));
        const lastDay = new Date(date.setDate(32));

        // Format both days: 'yyyy-mm-dd'
        const firstDaySliced = firstDay.toJSON().slice(0,10);
        const lastDaySliced = lastDay.toJSON().slice(0,10);

        // Check if month were already fetched.
        const month = this.state.monthsFetched.find(item => item === firstDaySliced);
        if (month === undefined) {

            await this.setState(state => ({
                monthsFetched: [...state.monthsFetched, firstDaySliced]
            }));

            //this.getGames(initial_date, end_date);
            await this.getTrainings(
                firstDaySliced,
                lastDaySliced
            );
        }
    };

    /**
     * Função que trata de atualizar a lista dos treinos.
     */
    handleRefresh = async () => {

        const today = new Date().toJSON().slice(0,10);

        await this.setState({
            items: {
                [today]: [],
            },
            monthsFetched: []
        });

        // Go to today
        this.agenda.chooseDay(new Date().toJSON().slice(0,10), true);
    };

    /**
     * Retorna o componente que representa um item da agenda.
     * @param item
     */
    renderItem = (item) => {
        return (
            <AgendaItem key={item.name} item={item} navigation={this.props.navigation} />
        );
    };

    /**
     * Retorna um componente que representa um dia sem eventos.
     */
    renderEmptyDate = () => {
        return (
            <View style={styles.emptyDate}>
                <Text>Nenhum evento para hoje.</Text>
            </View>
        );
    };

    /**
     * Função que compara se uma linha foi alterada.
     */
    rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    };

    /**
     * TO DO
     * --------------------------------------
     */

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
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas']
            ],
            fields: [
                'id',
                'display_name',
                'start_datetime',
                'description',
                'duracao',
                'local'
            ],
            order: 'start_datetime ASC'
        };

        const response = await this.props.odoo.search_read('ges.treino', params);
        if (response.success) {

            console.log(response.data);

            for (let i=0; i < response.data.length; i++) {
                let training = response.data[i];
                await this.parseTraining(training);
            }
        }
    }

    async parseTraining(training) {
        const description = training.display_name;
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
            time: 'Início: ' + startTimeHour.slice(0,5) + 'h',
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

        /*
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
        */
  
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

        /*
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
        */
    }

    /**
     * --------------------------------------
     * TO DO
     */


    render() {

        return (
            <Agenda
                ref={agenda => this.agenda = agenda /*this.r.chooseDay(this.state.selectedDay, true)*/ }
                items={this.state.items}
                loadItemsForMonth={this.fetchData.bind(this)}
                //selected={this.state.selectedDay}
                renderItem={this.renderItem.bind(this)}
                renderEmptyDate={this.renderEmptyDate.bind(this)}
                rowHasChanged={this.rowHasChanged.bind(this)}
                theme={{
                    backgroundColor: '#eeeeee',
                    // calendarBackground: '#ffffff',
                    // textSectionTitleColor: colors.gradient2,
                    agendaKnobColor: colors.gradient1,
                    // agendaDayTextColor: colors.gradient2,
                    // agendaDayNumColor: 'green',
                    agendaTodayColor: colors.gradient1,
                    // Dot colors marking events
                    dotColor: colors.gradient1,
                    //Selected day circle
                    selectedDayBackgroundColor: colors.gradient1,
                    selectedDayTextColor: '#ffffff',
                    selectedDotColor: '#ffffff',
                    todayTextColor: colors.gradient1,
                    dayTextColor: colors.gradient2,
                    monthTextColor: colors.gradient1,
                }}
                // Max amount of months allowed to scroll to the past. Default = 50
                pastScrollRange={2}
                // Max amount of months allowed to scroll to the future. Default = 50
                futureScrollRange={3}
                // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
                onRefresh={this.handleRefresh.bind(this)}
                // Set this true while waiting for new data from a refresh
                refreshing={this.state.isRefreshing}
            />
        );

        /*
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
        */
    }
}


const styles = StyleSheet.create({
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    },
    emptyDate: {
        height: 15,
        flex:1,
        paddingTop: 30
    }
});


const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarScreen);
