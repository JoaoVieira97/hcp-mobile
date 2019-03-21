import React, { Component } from 'react';
import {View, StyleSheet, FlatList, Alert } from 'react-native';
import {ListItem} from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";

import {connect} from 'react-redux';


class TrainingScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            openedTrainingsCounter: 0,
            closedTrainingsCounter: 0,
        };
    }

    componentDidMount() {

        this.willFocus = this.props.navigation.addListener('willFocus', () => {
            this.countOpenedTrainings();
            this.countTrainingsThatNeedToClose();
        });
    }

    componentWillUnmount() {

        this.willFocus.remove();
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
    countOpenedTrainings() {

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

        this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        ).then(
            response => {
                if (response.success) {

                    this.setState({
                        openedTrainingsCounter: response.data,
                    });
                }
            }
        ).catch(
            error => {
                Alert.alert(
                    'Erro',
                    'Aconteceu um erro. Não foi possível contabilizar o número de treiros.',
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                    {cancelable: false},
                );
            }
        );
    }

    /**
     * Contar o número de treinos com convocatórias fechadas.
     * Altera o estado do componente.
     */
    countTrainingsThatNeedToClose() {

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

        this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        ).then(
            response => {
                if (response.success) {

                    this.setState({
                        closedTrainingsCounter: response.data,
                    });
                }
            }
        ).catch(
            error => {
                Alert.alert(
                    'Erro',
                    'Aconteceu um erro. Não foi possível contabilizar o número de treiros.',
                    [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                    {cancelable: false},
                );
            }
        );
    }

    /**
     * Renderizar o item da lista principal.
     *
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        if (item.badge) {
            return (
                <ListItem
                    title={item.name}
                    subtitle={item.subtitle}
                    leftAvatar={
                        <Ionicons name={item.icon} size={27} style={{paddingBottom: 5}}/>
                    }
                    badge={item.badge}
                    onPress={() => (
                        this.props.navigation.navigate(item.onPress)
                    )}
                />
            );
        }

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={
                    <Ionicons name={item.icon} size={27} style={{paddingBottom: 5}}/>
                }
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
                subtitle: '',
                badge: false,
                chevron: false
            }, {
                name: 'Convocatórias em aberto',
                icon: 'md-list-box',
                subtitle: 'Editar dados | ' +
                    'Controlar a disponibilidade dos atletas | ' +
                    'Fechar o período de convocatórias',
                badge: {
                    value: this.state.openedTrainingsCounter,
                    status: "warning",
                    badgeStyle: {
                        backgroundColor: '#ad2e53'
                    }
                },
                chevron: false,
                onPress: 'OpenedTrainings'
            }, {
                name: 'Convocatórias fechadas',
                icon: 'md-log-out',
                subtitle: 'Editar presenças e atrasos | ' +
                    'Concluir ou eliminar treinos',
                badge: {
                    value: this.state.closedTrainingsCounter,
                    status: "warning",
                    badgeStyle: {
                        backgroundColor: '#ad2e53'
                    }
                },
                chevron: false,
                onPress: 'PendingTrainings'
            },
        ];

        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.name}
                    data={list}
                    renderItem={this.renderItem}
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
