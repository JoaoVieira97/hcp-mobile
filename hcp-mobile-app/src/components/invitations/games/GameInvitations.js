import React, {Component} from 'react';

import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {connect} from "react-redux";
import {ListItem} from "react-native-elements";
import moment from 'moment';
import {colors} from "../../../styles/index.style";

import ConvertTime  from '../../ConvertTime';

class GameItem extends React.PureComponent {

    render() {

        const game = this.props.game;

        const colorText = !game.canChangeAvailability ? '#919391' : '#0d0d0d' ;
        const colorBackground = !game.canChangeAvailability ? colors.lightGrayColor : '#fff';
        const iconName = !game.canChangeAvailability ?  'md-done-all' : 'md-hourglass';
        const iconSize = !game.canChangeAvailability ?  22 : 28;

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: colorText}}>
                            {'Jogo ' + game.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {game.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{fontWeight: '700', color: colors.darkGrayColor}}>
                                {'Adversário: '}
                            </Text>
                            <Text style={{fontWeight: '400', color: colors.darkGrayColor}}>
                                {game.opponent}
                            </Text>
                        </View>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + game.hours}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                game.place ?
                                    'Local: ' + game.place[1] :
                                    'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={iconName} size={iconSize} color={colorText} />)}
                chevron
                containerStyle={{
                    backgroundColor: colorBackground
                }}
                onPress={() => { this.props.navigation.navigate('OpenedGameInvitations', {game: game})}}
            />
        )
    }
}

class GameInvitations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            games: [],
            date: '',
        };
    }

    async componentDidMount() {

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

        const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
        if(athleteInfo) {

            const athleteId = athleteInfo[0].id;
            const idsFetched = this.state.games.map(game => {return game.id});

            const params = {
                domain: [
                    ['id', 'not in', idsFetched],
                    ['atletas', 'in', athleteId]
                ],
                fields: ['id', 'evento_desportivo' ,'atletas', 'display_start',
                        'local', 'escalao', 'duracao',
                        'convocatorias','treinador', 'seccionistas',
                        'equipa_adversaria', 'competicao'],
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
                    let canChangeAvailability = moment(convertTime.getDate()).isAfter(this.state.date);

                    /*
                        diff = difference in ms between actual date and game's date
                        oneDay = one day in ms
                        gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
                     */
                    let diff = moment(convertTime.getDate()).diff(moment(this.state.date));
                    let oneDay = 24 * 60 * 60 * 1000;
                    let gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';

                    if(diff >=0){
                        if(diff < oneDay) {
                             if(moment(this.state.date).isAfter(gameDayMidNight )) date.date = 'Hoje';
                             else date.date = 'Amanhã';
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
                        opponent: item.equipa_adversaria ? item.equipa_adversaria[1] : 'Não definido',
                        competition: item.competicao ? (item.competicao[1].split('('))[0] : 'Não definida',
                        athleteIds: item.atletas,
                        invitationIds: item.convocatorias,
                        coachIds: item.treinador,
                        secretaryIds: item.seccionistas,
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

    render() {

        return (
            <FlatList
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
        );
    }
}

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GameInvitations);

