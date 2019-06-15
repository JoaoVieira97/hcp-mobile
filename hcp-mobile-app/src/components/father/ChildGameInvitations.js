import React, {Component} from 'react';

import {View, FlatList, ActivityIndicator} from 'react-native';
import {connect} from "react-redux";
import moment from 'moment';

import ConvertTime  from '../ConvertTime';
import GameItem  from '../invitations/games/GameItem';
import FabButton from "../management/FabButton";

class ChildGameInvitations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            games: [],
            date: '',
            child: {},
            showFab: false
        };
    }

    async componentDidMount() {

        await this.setState({
            child: this.props.navigation.getParam('child'),
        });

        const date = moment().format();
        await this.setState({date: date});

        // fetch data
        await this.fetchGames(20);

        await this.setState({isLoading: false});
    }

    /**
     * Define navigator name.
     */
    static navigationOptions = {
        title: 'Jogos',
    };

    /**
     * Fetch all opened games. Maximum of limit items.
     * @param limit
     * @param clear
     * @returns {Promise<void>}
     */
    async fetchGames(limit=20, clear=false) {

        if(clear) {
            await this.setState({games: []});
        }

        const athleteId = this.state.child.id;
        if(athleteId) {
            const idsFetched = this.state.games.map(game => {return game.id});

            const params = {
                domain: [
                    ['id', 'not in', idsFetched],
                    ['atletas', 'in', athleteId]
                ],
                fields: ['id', 'evento_desportivo' ,'atletas', 'display_start',
                    'local', 'escalao', 'duracao',
                    'convocatorias','treinador', 'seccionistas',
                    'equipa_adversaria', 'competicao', 'state'],
                //fields: [],
                limit: limit,
                order: 'display_start DESC',
            };

            const response = await this.props.odoo.search_read('ges.jogo', params);

            if (response.success && response.data.length > 0) {

                let games = [];
                const convertTime = new ConvertTime();
                response.data.forEach(async item => {

                    convertTime.setDate(item.display_start);
                    const date = convertTime.getTimeObject();
                    // let canChangeAvailability = moment(convertTime.getDate()).isAfter(this.state.date);

                    let canChangeAvailability;
                    let isOver;

                    if(!moment(convertTime.getDate()).isAfter(this.state.date) ||
                        item.state === 'fechado')
                    {
                        isOver = 'finished';
                        canChangeAvailability = false;
                    }
                    else {

                        if(item.state === 'convocatorias_fechadas') {
                            isOver = 'closed';
                        }
                        else
                            isOver = 'opened';

                        canChangeAvailability = true;
                    }

                    /**
                     diff = difference in ms between actual date and game's date
                     oneDay = one day in ms
                     gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
                     twoDaysLimit = actualDate + 2 days + '00:00:00' -> To verify Amanha
                     (se a data do jogo nao atual ultrapassar estes 2 dias de limite, data=Amanha)
                     */
                    let diff = moment(convertTime.getDate()).diff(moment(this.state.date));
                    let oneDay = 24 * 60 * 60 * 1000;
                    let gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';
                    let twoDaysLimit = (moment(this.state.date).add(2, 'days').format()
                        .split('T'))[0] + 'T00:00:00';

                    if(diff >=0){
                        if(diff < oneDay) {
                            if(moment(this.state.date).isAfter(gameDayMidNight)) date.date = 'Hoje';
                            else date.date = 'Amanhã';
                        }
                        else if(diff < 2*oneDay && !moment(convertTime.getDate()).isAfter(twoDaysLimit)) {
                            date.date = 'Amanhã';
                        }
                    }

                    const game = {
                        id: item.id,
                        eventId: item.evento_desportivo[0],
                        place: item.local,
                        echelon: item.escalao,
                        duration: item.duracao,
                        date: date.date,
                        hours: date.hour,
                        state: item.state,
                        opponent: item.equipa_adversaria ? item.equipa_adversaria[1] : 'Não definido',
                        competition: item.competicao ? (item.competicao[1].split('('))[0] : 'Não definida',
                        athleteIds: item.atletas,
                        invitationIds: item.convocatorias,
                        coachIds: item.treinador,
                        secretaryIds: item.seccionistas,
                        isOver: isOver,
                        canChangeAvailability: canChangeAvailability,
                    };

                    games.push(game);
                });

                this.setState(state => ({
                    games: [...state.games, ...games]
                }));
            }
        }
    }

    /**
     * PureComponent used for rendering items of FlatList.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem =  ({item, index}) => (
        <GameItem
            key={item.id + item.date}
            game={item}
            child={this.state.child}
            index={index}
            navigation={this.props.navigation} />
    );

    /**
     * Add more games if they exist.
     * @returns {Promise<void>}
     */
    handleMoreData = async () => {

        this.setState({isLoading: true});
        await this.fetchGames();
        this.setState({isLoading: false});
    };

    /**
     * Renders ActivityIndicator if is loading.
     * @returns {*}
     */
    renderFooter = () => {

        return (
            <View style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#ced0ce'
            }}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={'#ced0ce'}
                    />
                }
            </View>
        );
    };

    /**
     * Renders separator line.
     * @returns {*}
     */
    renderSeparator = () => (
        <View style={{
            height: 1,
            width: '100%',
            backgroundColor: '#ced0ce',
        }}/>
    );

    /**
     * When user refresh current screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        this.setState({isRefreshing: true, isLoading: false});

        // fetch all games and clear current list
        await this.fetchGames(20, true);

        this.setState({isRefreshing: false});
    };

    /**
     * Check if we need to show the fab.
     * @param event
     */
    handleScroll = (event) => {

        if (event.nativeEvent.contentOffset.y > 250) {
            this.setState({showFab: true});
        }
        else
            this.setState({showFab: false});
    };

    render() {
        return (
            <View>
                <FlatList
                    ref={(ref) => { this.flatListRef = ref; }}
                    onScroll={this.handleScroll}
                    keyExtractor={item => item.id + item.date}
                    data={this.state.games}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={this.renderSeparator}
                    onEndReached={this.handleMoreData}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={this.renderFooter}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                />
                {
                    this.state.showFab &&
                    <FabButton flatListRef={this.flatListRef}/>
                }
            </View>
        );
    }
}

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChildGameInvitations);

