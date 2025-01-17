import React, { Component } from 'react';
import {View, FlatList} from 'react-native';
import {ListItem} from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../../styles/index.style";

import {connect} from 'react-redux';


class TrainingScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            openedTrainingsCounter: 0,
            closedTrainingsCounter: 0,
            finishedTrainingsCounter: 0,
            isRefreshing: false,
            isCoach: false,
        };
    }

    /**
     * Define training navigator.
     */
    static navigationOptions = {
        title: 'Treinos',
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
                await this.countOpenedTrainings();
                await this.countTrainingsThatNeedToClose();
                await this.countFinishedTrainings();
            })
        ];
    }

    componentWillUnmount() {

        //clearInterval(this.timer);
        this.subscriptions.forEach(sub => sub.remove());
    }

    /**
     * Count number of opened trainings.
     * @returns {Promise<void>}
     */
    async countOpenedTrainings() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.treino',
            method: 'search_count',
            args: [
                [['state', '=', 'aberto']],
            ]
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            await this.setState({
                openedTrainingsCounter: response.data,
            });
        }
    }

    /**
     * Count number of closed trainings.
     * @returns {Promise<void>}
     */
    async countTrainingsThatNeedToClose() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.treino',
            method: 'search_count',
            args: [
                [['state', '=', 'convocatorias_fechadas']],
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success) {

            await this.setState({
                closedTrainingsCounter: response.data,
            });
        }
    }

    /**
     * Count number of finished trainings.
     * @returns {Promise<void>}
     */
    async countFinishedTrainings() {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.treino',
            method: 'search_count',
            args: [
                [['state', '=', 'fechado']],
            ]
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success) {

            await this.setState({
                finishedTrainingsCounter: response.data,
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
                await this.countOpenedTrainings();
                await this.countTrainingsThatNeedToClose();
                await this.countFinishedTrainings();

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
                value: this.state.openedTrainingsCounter > 100 ? '+99' : this.state.openedTrainingsCounter,
                onPress: 'OpenedTrainings'
            }, {
                name: 'Convocatórias fechadas',
                icon: 'md-log-out',
                subtitle: 'Alterar presenças e atrasos | Fechar treinos',
                value: this.state.closedTrainingsCounter > 100 ? '+99' : this.state.closedTrainingsCounter,
                onPress: 'PendingTrainings'
            }, {
                name: 'Treinos fechados',
                icon: 'md-done-all',
                subtitle: 'Consultar informações dos treinos fechados',
                value: this.state.finishedTrainingsCounter > 100 ? '+99' : this.state.finishedTrainingsCounter,
                onPress: 'ClosedTrainings'
            },
        ];

        if(this.state.isCoach) {
            list = [{
                name: 'Criar treino',
                icon: 'md-add',
                subtitle: false,
                value: -1,
                onPress: 'NewOrEditTraining'
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

export default connect(mapStateToProps, mapDispatchToProps)(TrainingScreen);