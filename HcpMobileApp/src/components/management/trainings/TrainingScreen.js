import React, { Component } from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
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

    componentDidMount() {

        /*
        this.timer = setInterval(
            () => {
                this.countOpenedTrainings();
                this.countTrainingsThatNeedToClose();
            },
            3000
        );
        */

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
     * Definir as opções da barra de navegação no topo.
     */
    static navigationOptions = {
        title: 'Treinos',
        tabBarIcon: ({ tintColor }) => (
            <Ionicons name={"md-fitness"} color={tintColor} size={26}/>
        ),
        tabBarColor: "#efefef",
    };

    /**
     * Contar o número de treinos em aberto.
     * Altera o estado do componente.
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

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );

        if (response.success) {

            await this.setState({
                openedTrainingsCounter: response.data,
            });
        }

        /*
        Alert.alert(
                    'Erro',
                    'Aconteceu um erro. Não foi possível contabilizar o número de treiros.',
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                    {cancelable: false},
                );
         */
    }

    /**
     * Contar o número de treinos com convocatórias fechadas.
     * Altera o estado do componente.
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

        /*
        Alert.alert(
                    'Erro',
                    'Aconteceu um erro. Não foi possível contabilizar o número de treiros.',
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                    {cancelable: false},
                );
         */
    }

    /**
     * Função que trata de atualizar a lista dos treinos.
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
     * Renderizar o item da lista principal.
     *
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

    /**
     * Renderizar o componente TrainingScreen.
     *
     */
    render() {

        const list = [{
                name: 'Criar treino',
                icon: 'md-add',
                subtitle: false,
                value: -1,
                onPress: false
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
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.name}
                    data={list}
                    renderItem={this.renderItem}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                />
            </View>
        )
    }
}


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(TrainingScreen);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10
    }
});



/*

    async getAllTrainingsNeedToClose() {

        const params = {
            domain: [
                ['state', '=', 'convocatorias_fechadas']],
            fields: ['id', 'evento_ref'],
        };

        let response = await this.props.odoo.search_read('ges.evento_desportivo', params);
        if (response.success) {

            let counter = 0;
            const size = response.data.length;

            for (let i = 0; i < size; i++) {

                const aux = response.data[i].evento_ref.split(',');

                if(aux[0] === 'ges.treino') {
                    counter = counter + 1;
                }
            }

            //console.log(response.data);
            //Alert.alert("Total", counter.toString());
            return counter;
        }

        return 0;
    }

    async getAllTrainings() {

        const params = {
            domain: [['id', '>=', '0']],
            fields: ['id'],
        };

        let response = await this.props.odoo.search('ges.treino', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async getAllConvocations() {

        const params = {
            domain: [['id', '>=', '0']],
            fields: ['id'],
        };

        let response = await this.props.odoo.search('ges.linha_convocatoria', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async getAllPresences() {

        const params = {
            domain: [['id', '>=', '0']],
            fields: ['id'],
        };

        let response = await this.props.odoo.search('ges.linha_presenca', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async getEvent(id) {

        const params = {
            ids: [id],
            fields: [],
        };

        const response = await this.props.odoo.get('ges.evento_desportivo', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async getTraining(id) {

        const params = {
            ids: [id],
            fields: [],
        };

        const response = await this.props.odoo.get('ges.treino', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async getConvocation(id) {

        const params = {
            ids: [id],
            fields: [],
        };

        const response = await this.props.odoo.get('ges.linha_convocatoria', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async getPresence(id) {

        const params = {
            ids: [id],
            fields: [],
        };

        const response = await this.props.odoo.get('ges.linha_presenca', params);
        if (response.success) {

            console.log(response.data);
        }
    }

    async registerAvailabilities(convocation_ids, availability = true) {

        let response = await this.props.odoo.update('ges.linha_convocatoria',
            convocation_ids,
            {
                disponivel:  availability,
            }
        );

        if (response.success) {

            console.log(response.data);
        }
    }
 */
