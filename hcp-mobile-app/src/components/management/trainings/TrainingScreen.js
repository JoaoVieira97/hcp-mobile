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
            isRefreshing: false
        };
    }

    /**
     * Define training navigator.
     */
    static navigationOptions = {
        title: 'Treinos',
    };

    componentDidMount() {

        this.subscriptions = [
            this.props.navigation.addListener('willFocus', async () => {
                await this.countOpenedTrainings();
                await this.countTrainingsThatNeedToClose();
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
     * Refresh screen.
     */
    handleRefresh = () => {
        this.setState({
                isRefreshing: true
            },
            async () => {
                await this.countOpenedTrainings();
                await this.countTrainingsThatNeedToClose();

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

        const list = [{
                name: 'Criar treino',
                icon: 'md-add',
                subtitle: false,
                value: -1,
                onPress: 'NewTraining'
            }, {
                name: 'Convocatórias em aberto',
                icon: 'md-list-box',
                subtitle: 'Editar dados | ' +
                    'Controlar a disponibilidade dos atletas | ' +
                    'Fechar o período de convocatórias',
                value: this.state.openedTrainingsCounter,
                onPress: 'OpenedTrainings'
            }, {
                name: 'Convocatórias fechadas',
                icon: 'md-log-out',
                subtitle: 'Editar presenças e atrasos | ' +
                    'Concluir ou eliminar treinos',
                value: this.state.closedTrainingsCounter,
                onPress: 'PendingTrainings'
            },
        ];

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
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TrainingScreen);