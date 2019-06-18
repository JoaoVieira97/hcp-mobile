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
import ConvertTime from "../ConvertTime";
import _ from 'lodash';


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
                    if(item.type === 0) {
                        this.props.navigation.navigate('CalendarPendingGame',{
                            gameEvent: item
                        });
                    }
                    else {
                        this.props.navigation.navigate('CalendarPendingTraining',{
                            trainingEvent: item
                        });
                    }
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
                        <Text numberOfLines={1} ellipsizeMode='tail'
                            style={{fontWeight: '600', marginBottom: 10, color: color}}>
                            {this.props.item.title}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail'>{this.props.item.time}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail'>{this.props.item.description}</Text>
                        <Text numberOfLines={1} ellipsizeMode='tail'>{this.props.item.localName}</Text>
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
            monthsFetched: [],
            checked: false
        };
    }

    async componentDidMount() {

        const today = new Date().toJSON().slice(0,10);
        await this.setState({items: {[today]: []}});
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

            if(this.state.checked === false) {
                await this.fetchOwnEvents(firstDaySliced, lastDaySliced);
            }
            else {
                await this.fetchAllEvents(firstDaySliced, lastDaySliced);
            }
        }

        await this.setState({
            isLoading: false,
        });
    };

    /**
     * Fetch own future events. All events are associated to the current user.
     * Display the first 5 events from now.
     * @returns {Promise<void>}
     */
    async fetchOwnEvents(date1, date2) {

        // Create aux domain
        let auxDomain = [];
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

        await this.fetchEvents(domain);
    }

    /**
     * Fetch other future events. All events are associated to the current user.
     * Display the first 5 events from now.
     * @returns {Promise<void>}
     */
    async fetchAllEvents(date1, date2) {

        const domain = [
            '&',
            '&',
            ['start_datetime', '>=', date1],
            ['start_datetime', '<=', date2],
            ['state', '=', 'convocatorias_fechadas']
        ];

        await this.fetchEvents(domain);
    }

    /**
     * Fetch all necessary data.
     * @param domain
     * @returns {Promise<boolean>}
     */
    async fetchEvents(domain) {

        const params = {
            domain: domain,
            fields: ['evento_ref', 'duracao', 'local', 'display_start', 'display_name', 'escalao'],
            order: 'start_datetime ASC',
            limit: 6
        };

        const response = await this.props.odoo.search_read('ges.evento_desportivo', params);
        if (response.success && response.data.length > 0) {

            let items = this.state.items;
            for (let i=0; i<response.data.length; i++) {

                const event = response.data[i];
                const eventReference = event.evento_ref.split(",");

                // get datetime
                const convertTime = new ConvertTime();
                convertTime.setDate(event.display_start);
                const date = convertTime.getTimeObject();

                let eventObject;
                if (eventReference[0] === 'ges.jogo') {

                    const opponent = await this.fetchGameOpponent(parseInt(eventReference[1]));
                    eventObject = {
                        id: event.id,
                        type: 0,
                        title: 'JOGO | ' + _.upperCase(event.escalao[1]),
                        rawDate: (event.display_start.split(" "))[0],
                        date: date.date,
                        time: 'Início às ' + date.hour,
                        description: opponent ? 'Adversário: ' + opponent : "",
                        local: event.local[0],
                        localName: 'Local: ' + event.local[1]
                    };
                }
                else {
                    eventObject = {
                        id: event.id,
                        type: 1,
                        title: 'TREINO | ' + _.upperCase(event.escalao[1]),
                        rawDate: (event.display_start.split(" "))[0],
                        date: date.date,
                        time: 'Início às ' + date.hour,
                        description: 'Duração de ' + event.duracao + ' min',
                        local: event.local[0],
                        localName: 'Local: ' + event.local[1]
                    };
                }

                // if it is the first add
                if (items[eventObject.rawDate] === undefined){
                    items[eventObject.rawDate] = [eventObject];
                }
                // if there is already a entry for this day
                else {
                    if(items[eventObject.rawDate].find(item => item.id === eventObject.id) === undefined)
                        items[eventObject.rawDate].push(eventObject);
                }
            }

            await this.setState({items: items});
        }
    }

    /**
     * Fetch game opponent.
     * @param gameId
     * @returns {Promise<string|null>}
     */
    async fetchGameOpponent(gameId) {

        const params = {
            ids: [gameId],
            fields: ['equipa_adversaria'],
        };

        // Parsing trainings
        const response = await this.props.odoo.get('ges.jogo', params);
        if(response.success && response.data.length > 0) {

            const game = response.data[0];

            return game.equipa_adversaria ? game.equipa_adversaria[1] : "";
        }

        return null;
    }


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
        this.agenda.chooseDay(today, true);
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
                <Text>Nenhum evento para este dia.</Text>
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

        await this.setState(state => ({checked: !state.checked}));
        await this.handleRefresh();
    }

    render() {

        return (
            <View style={{flex: 1}}>
                <View style={styles.topHeader}>
                    <CheckBox
                        iconRight
                        size={28}
                        title='Visualizar todos os eventos'
                        textStyle={{color: colors.gradient1}}
                        checkedColor={colors.gradient1}
                        uncheckedColor={colors.gradient1}
                        checked={this.state.checked}
                        onPress={() => this.changeChecked()}
                        containerStyle={{ margin: 0, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                    />
                </View>
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
            </View>
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
    },
    topHeader: {
        flexDirection: 'row',
        width: '100%',
        paddingVertical: 10,
        backgroundColor: '#eeeeee',
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CalendarScreen);
