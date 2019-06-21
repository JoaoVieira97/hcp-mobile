import React, {Component} from 'react';
import {View, FlatList} from 'react-native';
import {connect} from "react-redux";
import {ListItem} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../../styles/index.style";


class GameScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            openedGamesCounter: 0,
            closedGamesCounter: 0,
            finishedGamesCounter: 0,
            isRefreshing: false
        };
    }

    /**
     * Define game navigator.
     */
    static navigationOptions = {
        title: 'Jogos',
    };

    componentWillMount() {

        for (let i = 0; i < this.props.user.groups.length; i++) {
            const group = this.props.user.groups[i];
            if (group.name === 'Treinador') {
                this.setState({isCoach: true});
                break;
            }
        }
    }

    componentDidMount() {

        this.subscriptions = [
            this.props.navigation.addListener('willFocus', async () => {
                await this.countOpenedGames();
                await this.countGamesThatNeedToClose();
                await this.countFinishedGames();
            })
        ];
    }

    componentWillUnmount() {

        this.subscriptions.forEach(sub => sub.remove());
    }

    /**
     * Count number of opened games.
     * @returns {Promise<void>}
     */
    async countOpenedGames() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.jogo',
            method: 'search_count',
            args: [
                [['state', '=', 'aberto']],
            ]
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            await this.setState({
                openedGamesCounter: response.data,
            });
        }
    }

    /**
     * Count number of closed games.
     * @returns {Promise<void>}
     */
    async countGamesThatNeedToClose() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.jogo',
            method: 'search_count',
            args: [
                [['state', '=', 'convocatorias_fechadas']],
            ]
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            await this.setState({
                closedGamesCounter: response.data,
            });
        }
    }

    /**
     * Count number of finished games.
     * @returns {Promise<void>}
     */
    async countFinishedGames() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.jogo',
            method: 'search_count',
            args: [
                [['state', '=', 'fechado']],
            ]
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            await this.setState({
                finishedGamesCounter: response.data,
            });
        }
    }

    /**
     * Refresh screen.
     */
    handleRefresh = () => {
        this.setState({
                isRefreshing: true
            },
            async () => {
                await this.countOpenedGames();
                await this.countGamesThatNeedToClose();
                await this.countFinishedGames();

                this.setState({
                    isRefreshing: false
                });
            });
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle ? item.subtitle : null}
                leftAvatar={
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 30,
                        width: 30
                    }}>
                        <Ionicons name={item.icon} size={27}/>
                    </View>
                }
                badge={item.value >= 0 ? {
                    value: item.value,
                    badgeStyle: {
                        backgroundColor: colors.gradient1
                    }
                } : null}
                onPress={item.onPress && (item.value > 0 || item.value === -1) ? () => {
                    this.props.navigation.navigate(item.onPress);
                } : null}
            />
        );
    };

    render() {

        let list = [{
            name: 'Convocatórias em aberto',
            icon: 'md-list-box',
            subtitle: 'Alterar dados de uma convocatória | ' +
                'Alterar disponibilidade dos atletas | ' +
                'Fechar o período de convocatórias',
            value: this.state.openedGamesCounter > 100 ? '+99' : this.state.openedGamesCounter,
            onPress: 'OpenedGames'
        }, {
            name: 'Convocatórias fechadas',
            icon: 'md-log-out',
            subtitle: 'Alterar presenças e atrasos | Fechar jogos',
            value: this.state.closedGamesCounter > 100 ? '+99' : this.state.closedGamesCounter,
            onPress: 'PendingGames'
        }, {
            name: 'Jogos fechados',
            icon: 'md-done-all',
            subtitle: 'Consultar informações dos jogos fechados',
            value: this.state.finishedGamesCounter > 100 ? '+99' : this.state.finishedGamesCounter,
            onPress: 'ClosedGames'
        }];

        if(this.state.isCoach) {
            list = [{
                name: 'Criar jogo',
                icon: 'md-add',
                subtitle: false,
                value: -1,
                onPress: 'NewOrEditGame'
            }, ...list];
        }

        return (
            <FlatList
                keyExtractor={item => item.name}
                data={list}
                renderItem={this.renderItem}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
            />
        )
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);
