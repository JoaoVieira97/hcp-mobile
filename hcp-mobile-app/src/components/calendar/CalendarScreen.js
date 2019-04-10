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

import { CheckBox } from 'react-native-elements';

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
        let item = this.props.item;
        switch (this.props.item.type) {
            case 0:
                color = colors.gameColor;
                break;
            case 1:
                color = colors.trainingColor;
                break;
            default:
                color = colors.gameColor;
                break;
        }

        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.navigation.navigate('EventScreen',{item})
                }}
                style={styles.item}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    width: '100%'}}>
                    <View style={{
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 10,
                        marginRight: 15}}>
                        <MaterialCommunityIcons
                            name={'hockey-sticks'}
                            size={28}
                            color={color}
                        />
                    </View>
                    <View style={{width: '82%'}}>
                        <Text style={{fontWeight: '600', marginBottom: 10, color: color}}>
                            {this.props.item.title}
                        </Text>
                        <Text>{this.props.item.time}</Text>
                        <Text>{this.props.item.description}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

class CalendarScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRefreshing: false,
            isLoading: false,
            items: {},
            markedDates: {},
            monthsFetched: [],
            checked: false
        };
    }

    async componentDidMount() {

        const today = new Date().toJSON().slice(0,10);

        await this.setState({
            items: {
                [today]: [],
            },
        });

        this.props.navigation.setParams({
            handleThis: this.changeChecked.bind(this),
            checkValue: this.state.checked
        });
    }

    /**
     * Fetch all events of the month of the given day.
     * @param day
     * @returns {Promise<void>}
     */
    fetchData = async (day) => {

        await this.setState({
            isLoading: true
        });

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

            await this.fetchTrainings(
                firstDaySliced,
                lastDaySliced
            );

            await this.fetchGames(
                firstDaySliced,
                lastDaySliced
            );
        }

        await this.setState({
            isLoading: false,
        });
    };

    /**
     * Fetch all trainings.
     * @param date1
     * @param date2
     * @returns {Promise<void>}
     */
    async fetchTrainings(date1, date2) {

        // Create aux domain
        let auxDomain = [];
        if(this.state.checked === false) {

            for (let i = 0; i < this.props.user.groups.length; i++) {

                const group = this.props.user.groups[i];

                if(group.name === 'Atleta') {
                    auxDomain = [...auxDomain, ['atletas', 'in', group.id]];
                }
                else if (group.name === 'Seccionista') {
                    auxDomain = [...auxDomain, ['seccionistas', 'in', group.id]];
                }
                else if (group.name === 'Treinador') {
                    auxDomain = [...auxDomain, ['treinador', 'in', group.id]];
                }
            }
        }

        // Define domain
        // (A and B) = & A B
        // (A and B and C) = & & A B C
        // (A and (B or C)) = & A or B C
        // (A and (B or C or D)) = & A or B or C D
        let domain = [];
        if (auxDomain.length === 0) {
            domain = [
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas']
            ];
        }
        else if (auxDomain.length === 1) {
            domain = [
                '&',
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas'],
                auxDomain[0]
            ];
        }
        else if (auxDomain.length === 2) {
            domain = [
                '&',
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas'],
                '|',
                auxDomain[0],
                auxDomain[1]
            ];
        }
        else if (auxDomain.length === 3) {
            domain = [
                '&',
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas'],
                '|',
                auxDomain[0],
                '|',
                auxDomain[1],
                auxDomain[2]
            ];
        }

        const params = {
            domain: domain,
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
        if (response.success && response.data.length > 0) {

            let items = this.state.items;
            let markedDates = this.state.markedDates;

            for (let i=0; i < response.data.length; i++){

                // Add training to the items list
                let training = this.parseTraining(response.data[i]);

                if (items[training.date] === undefined){
                    items[training.date] = [training];
                }
                else if(items[training.date].find(item => item.type === 1 && item.id === training.id) === undefined)
                    items[training.date].push(training);

                /*
                const trainingMark = {key:'training', color: colors.trainingColor};
                // Add training mark
                if (markedDates[training.date] === undefined) {
                    markedDates[training.date] = {
                        dots: [training]
                    }
                }
                else if (markedDates[training.date].dots.find(item => item.key === trainingMark.key) === undefined)
                    markedDates[training.date].dots.push(trainingMark);
                */
            }

            await this.setState({
                items: items,
                markedDates: markedDates
            });
        }
    }

    parseTraining = (training)  => {

        const description = training.display_name;
        const duration = training.duracao;
        const startTime = training.start_datetime;
        const startTimeDate = (startTime.split(" "))[0];
        const startTimeHour = (startTime.split(" "))[1];
        const localId = training.local[0];
        const local_name = training.local[1];

        return {
            id: training.id,
            type: 1,
            title: description,
            time: 'Início: ' + startTimeHour.slice(0,5) + 'h',
            description: 'Duração: ' + duration + ' min',
            local: localId,
            date: startTimeDate,
            localName: local_name
        };
    };

    /**
     * Fetch all games.
     * @param date1
     * @param date2
     * @returns {Promise<void>}
     */
    async fetchGames(date1, date2) {

        // Create aux domain
        let auxDomain = [];
        if(this.state.checked === false) {

            for (let i = 0; i < this.props.user.groups.length; i++) {

                const group = this.props.user.groups[i];

                if(group.name === 'Atleta') {
                    auxDomain = [...auxDomain, ['atletas', 'in', group.id]];
                }
                else if (group.name === 'Seccionista') {
                    auxDomain = [...auxDomain, ['seccionistas', 'in', group.id]];
                }
                else if (group.name === 'Treinador') {
                    auxDomain = [...auxDomain, ['treinador', 'in', group.id]];
                }
            }
        }

        // Define domain
        // (A and B) = & A B
        // (A and B and C) = & & A B C
        // (A and (B or C)) = & A or B C
        // (A and (B or C or D)) = & A or B or C D
        let domain = [];
        if (auxDomain.length === 0) {
            domain = [
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas']
            ];
        }
        else if (auxDomain.length === 1) {
            domain = [
                '&',
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas'],
                auxDomain[0]
            ];
        }
        else if (auxDomain.length === 2) {
            domain = [
                '&',
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas'],
                '|',
                auxDomain[0],
                auxDomain[1]
            ];
        }
        else if (auxDomain.length === 3) {
            domain = [
                '&',
                '&',
                '&',
                ['start_datetime', '>=', date1],
                ['start_datetime', '<=', date2],
                ['state', '=', 'convocatorias_fechadas'],
                '|',
                auxDomain[0],
                '|',
                auxDomain[1],
                auxDomain[2]
            ];
        }

        const params = {
            domain: domain,
            fields: [
                'id',
                'local',
                'start_datetime',
                'equipa_adversaria',
                'escalao'
            ],
            order: 'start_datetime ASC'
        };

        const response = await this.props.odoo.search_read('ges.jogo', params);
        if (response.success && response.data.length > 0){

            let items = this.state.items;
            let markedDates = this.state.markedDates;

            for (let i=0; i < response.data.length; i++){

                // Add game to items object
                let game = this.parseGame(response.data[i]);

                if (items[game.date] === undefined){
                    items[game.date] = [game];
                }
                else if(items[game.date].find(item => item.type === 0 && item.id === game.id) === undefined)
                    items[game.date].push(game);
            }

            await this.setState({
                items: items,
                markedDates: markedDates
            });
        }
    }

    parseGame = (game) =>{

        const level = game.escalao[1];
        const opponent = game.equipa_adversaria[1];
        const startTime = game.start_datetime;
        const startTimeDate = (startTime.split(" "))[0];
        const startTimeHour = (startTime.split(" "))[1];
        const localId = game.local[0];
        const local_name = game.local[1];

        return {
            id: game.id,
            type: 0,
            title: 'Jogo | ' + level + ' | ' + local_name,
            time: 'Início ' + startTimeHour.slice(0,5) + 'h',
            description: 'Adversário: ' + opponent,
            local: localId,
            localName: local_name,
            date: startTimeDate
        };
    };

    /**
     * Handle refresh.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        const today = new Date().toJSON().slice(0,10);
        await this.setState({
            items: {
                [today]: [],
            },
            markedDates: {},
            monthsFetched: []
        });

        // Go to today
        this.agenda.chooseDay(new Date().toJSON().slice(0,10), true);
    };

    /**
     * Render agenda item.
     * @param item
     */
    renderItem = (item) => {

        const key = (item.type === 0 ? 'game' : 'training') + item.id;

        return (
            <AgendaItem key={key} item={item} navigation={this.props.navigation} />
        );
    };

    /**
     * Render an message when there is no events.
     * @returns {*}
     */
    renderEmptyDate = () => {
        return (
            <View style={styles.emptyDate}>
                <Text>Nenhum evento para hoje.</Text>
            </View>
        );
    };

    /**
     * Compare two dates.
     */
    rowHasChanged = (r1, r2) => {
        return r1.name !== r2.name;
    };


    async changeChecked() {

        const {setParams} = this.props.navigation;
        if (this.state.checked === false){
            await this.setState({checked: true})
            setParams({ checkValue: true })
        } else{
            await this.setState({checked: false})
            setParams({ checkValue: false })
        }
        console.log(this.state.checked)
        await this.handleRefresh();
    }

    static navigationOptions = ({navigation}) => {
        const {params = {}} = navigation.state;
        return {
            headerRight:
                <CheckBox
                    center
                    iconRight
                    size={28}
                    title='Todos os eventos'
                    textStyle={{color: colors.gradient1}}
                    checkedColor={colors.gradient1}
                    uncheckedColor={colors.gradient1}
                    checked={params.checkValue}
                    onPress={() => params.handleThis()}
                    containerStyle={{ margin: 0, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                />
        }
    };

    render() {

        return (
            <Agenda
                ref={agenda => this.agenda = agenda /*this.r.chooseDay(this.state.selectedDay, true)*/ }
                items={this.state.items}
                loadItemsForMonth={this.fetchData.bind(this)}
                //markedDates = {this.state.markedDates}
                //markingType={'multi-dot'}
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
                //pastScrollRange={2}
                // Max amount of months allowed to scroll to the future. Default = 50
                //futureScrollRange={3}
                // If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make sure to also set the refreshing prop correctly.
                onRefresh={this.handleRefresh.bind(this)}
                // Set this true while waiting for new data from a refresh
                refreshing={this.state.isRefreshing}
            />
        );
    }
}

const styles = StyleSheet.create({
    item: {
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginVertical: 8,
        backgroundColor: '#fff'
    },
    emptyDate: {
        height: 15,
        flex:1,
        paddingTop: 30
    }
});


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarScreen);
