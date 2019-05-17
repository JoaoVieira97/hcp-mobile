import React, { Component } from 'react';

import {ActivityIndicator, FlatList, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import CustomText from "../../CustomText";
import {Ionicons} from "@expo/vector-icons";
import ConvertTime from "../../ConvertTime";
import {colors} from "../../../styles/index.style";
import ManagementListItem from "../ManagementListItem";



class PendingGames extends Component {
    constructor(props) {
        super(props);

        this.state = {
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
        headerTitle:
            <CustomText
                type={'bold'}
                numberOfLines={1}
                ellipsizeMode='tail'
                children={'CONVOCATÓRIAS FECHADAS'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginLeft: 10}} onPress = {() => navigation.goBack()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'} />
            </TouchableOpacity>
    });

    async componentDidMount() {

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

        if(!this.state.isFetching) {

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
                    ['state', '=', 'convocatorias_fechadas']
                ],
                fields: ['id', 'state', 'atletas', 'display_start', 'local', 'escalao', 'duracao', 'convocatorias', 'treinador', 'seccionistas'],
                limit: limit,
                order: 'display_start DESC'
            };

            const response = await this.props.odoo.search_read('ges.jogo', params);
            if (response.success && response.data.length > 0) {

                let games = [];
                const convertTime = new ConvertTime();
                response.data.forEach(item => {

                    convertTime.setDate(item.display_start);
                    const date = convertTime.getTimeObject();

                    const game = {
                        id: item.id,
                        local: item.local,
                        echelon: item.escalao,
                        duration: item.duracao,
                        date: date.date,
                        hour: date.hour,
                        invitationIds: item.convocatorias,
                        athleteIds : item.atletas,
                        coachIds: item.treinador,
                        secretaryIds: item.seccionistas,
                    };

                    games.push(game);
                });

                this.setState(state => ({
                    gamesList: [...state.gamesList, ...games]
                }));
            }

            this.setState({isFetching: false});
        }
    }

    /**
     * When user refresh current screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        await this.setState({isRefreshing: true, isLoading: false});

        // fetch all games and clear current list
        await this.fetchGames(20, true);

        await this.setState({isRefreshing: false});
    };

    /**
     * Add more games if they exist.
     * @returns {Promise<void>}
     */
    handleMoreData = async () => {

        this.setState({isLoading: true});

        // fetch more games
        await this.fetchGames(20, false);

        this.setState({isLoading: false});
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
    renderItem = ({ item, index }) => (
        <ManagementListItem
            item={item}
            index={index}
            titleType={'Jogo '}
            navigateToFunction={() => {

                /*
                this.props.navigation.navigate(
                    'OpenedGame',
                    {
                        game: item,
                        removeGame: (id) => this.removeGame(id)
                    }
                );
                 */
            }} />
    );

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

export default connect(mapStateToProps, mapDispatchToProps)(PendingGames);