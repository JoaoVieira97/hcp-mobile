import React, { Component } from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import { connect } from 'react-redux';
import ConvertTime from "../../ConvertTime";
import {colors} from "../../../styles/index.style";
import ManagementListItem from "../ManagementListItem";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import moment from 'moment';


class ClosedGames extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stopFetching: false,
            isLoading: true,
            isRefreshing: false,
            isFetching: false,
            gamesList: [],
        };
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'CONVOCATÓRIAS FECHADAS'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });

    async componentDidMount() {

        const date = moment().format();
        await this.setState({date: date});

        // fetch all games, max 20
        await this.fetchGames(20, false);
        await this.setState({isLoading: false});
    }

    /**
     * Fetch all opened games. Maximum of limit items.
     * @param limit
     * @param clear
     * @returns {Promise<void>}
     */
    async fetchGames(limit=20, clear=false) {

        this.setState({isFetching: true});

        if (clear) {
            await this.setState({gamesList: []});
        }

        const idsFetched = this.state.gamesList.map(game => {
            return game.id
        });
        const params = {
            domain: [
                ['id', 'not in', idsFetched],
                ['state', '=', 'fechado']
            ],
            fields: [
                'id', 'evento_desportivo' ,'atletas', 'display_start',
                'local', 'escalao', 'duracao',
                'convocatorias','presencas',
                'treinador', 'seccionistas',
                'equipa_adversaria', 'competicao', 'state', 'antecedencia'
            ],
            limit: limit,
            order: 'display_start DESC'
        };

        const response = await this.props.odoo.search_read('ges.jogo', params);
        if (response.success && response.data.length > 0) {

            if(response.data.length < limit)
                this.setState({stopFetching: true});

            let games = [];
            const convertTime = new ConvertTime();
            response.data.forEach(item => {

                convertTime.setDate(item.display_start);
                const date = convertTime.getTimeObject();

                /**
                 diff = difference in ms between actual date and games's date
                 oneDay = one day in ms
                 gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
                 twoDaysLimit = actualDate + 2 days + '00:00:00' -> To verify Amanha
                 (se a data do jogo nao atual ultrapassar estes 2 dias de limite, data=Amanha)
                 */
                const diff = moment(convertTime.getDate()).diff(moment(this.state.date));
                const oneDay = 24 * 60 * 60 * 1000;
                const gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';
                const twoDaysLimit = (moment(this.state.date).add(2, 'days').format()
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
                    local: item.local,
                    echelon: item.escalao,
                    duration: item.duracao,
                    date: date.date,
                    hour: date.hour,
                    opponent: item.equipa_adversaria ? item.equipa_adversaria[1] : 'Não definido',
                    competition: item.competicao ? (item.competicao[1].split('('))[0] : 'Não definida',
                    antecedence: !item.antecedencia ? 'Não definida' :
                        item.antecedencia === 1 ? item.antecedencia + ' hora' : item.antecedencia + ' horas',
                    athleteIds : item.atletas,
                    invitationIds: item.convocatorias,
                    availabilityIds: item.presencas,
                    coachIds: item.treinador,
                    secretaryIds: item.seccionistas,
                    eventId: item.evento_desportivo[0]
                };

                games.push(game);
            });

            this.setState(state => ({
                gamesList: [...state.gamesList, ...games]
            }));
        }

        this.setState({isFetching: false});
    }

    /**
     * When user refresh current screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        this.setState({isRefreshing: true, isLoading: false, stopFetching: false});

        // fetch all trainings and clear current list
        await this.fetchGames(20, true);

        this.setState({isRefreshing: false});
    };

    /**
     * Add more trainings if they exist.
     * @returns {Promise<void>}
     */
    handleMoreData = async () => {

        if(!this.state.isFetching && !this.state.stopFetching) {
            this.setState({isLoading: true});

            // fetch more trainings
            await this.fetchGames();

            this.setState({isLoading: false});
        }
    };

    /**
     * Renders ActivityIndicator if is loading.
     * @returns {*}
     */
    renderFooter = () => {

        return (
            <View style={{paddingVertical: 20}}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={colors.loadingColor}
                    />
                }
            </View>
        );
    };

    /**
     * PureComponent used for rendering items of FlatList.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem = ({ item, index }) => {
        return (
            <ManagementListItem
                item={item}
                index={index}
                titleType={'Jogo '}
                navigateToFunction={() => {
                    this.props.navigation.navigate('ClosedGame', {game: item});
                }}
            />
        );
    };

    render() {
        return (
            <FlatList
                keyExtractor={item => item.id.toString()}
                data={this.state.gamesList}
                renderItem={this.renderItem}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
                onEndReached={this.handleMoreData}
                onEndReachedThreshold={0.1}
                ListFooterComponent={this.renderFooter.bind(this)}
            />
        );
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ClosedGames);