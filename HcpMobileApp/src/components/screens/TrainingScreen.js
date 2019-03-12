import React, { Component } from 'react';
import {View, StyleSheet, FlatList } from 'react-native';
import {ListItem} from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";

import {connect} from 'react-redux';


class TrainingScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            openedTrainingsIds: [],
            needToCloseIds: [],
            number_trainings_without_presences: 0,
            number_trainings_need_to_close: 0,
        };
    }

    static navigationOptions = {
        title: 'Treinos',
        tabBarIcon: ({ tintColor }) => (
            <Ionicons name={"md-fitness"} color={tintColor} size={26}/>
        ),
        tabBarColor: "#efefef",
    };

    async componentDidMount() {

        await this.getAllOpenedTrainings();
        const number_2 = await this.getAllTrainingsNeedToClose();

        this.setState({
            number_trainings_need_to_close: number_2
        });
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

    async getAllOpenedTrainings() {

        const params = {
            domain: [['state', '=', 'aberto']],
            fields: ['id', 'evento_ref', 'n_presentes', 'display_start'],
            order:  'display_start DESC',
        };

        let response = await this.props.odoo.search_read('ges.evento_desportivo', params);
        if (response.success) {

            const data = response.data;
            const size = data.length;

            let events_id = [];

            for (let i = 0; i < size; i++) {

                const aux = data[i].evento_ref.split(',');

                if(aux[0] === 'ges.treino') {

                    events_id.push(data[i].id);
                }
            }

            this.setState({
                openedTrainingsIds: events_id,
                number_trainings_without_presences: events_id.length,
            });
        }
    }

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

    async handlePress() {

        //await this.getEvent(1302);
        //await this.getConvocation(13332);

        //await this.registerAvailabilities([13332, 13333, 13332, 13334, 13335, 13336 ], false);

        await this.getAllTrainingsWithoutPresences();
    }

    icon = (type) => (<Ionicons name={type} size={27} style={{paddingBottom: 5}}/>);

    renderItem = ({ item }) => {

        if (item.badge) {
            return (
                <ListItem
                    title={item.name}
                    subtitle={item.subtitle}
                    leftAvatar={this.icon(item.icon)}
                    badge={item.badge}
                    onPress={() => (
                        this.props.navigation.navigate(item.onPress, {ids: this.state.openedTrainingsIds })
                    )}
                />
            );
        }

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={this.icon(item.icon)}
            />
        );
    };

    render() {

        const list = [
            {
                name: 'Criar treino',
                icon: 'md-add',
                subtitle: '',
                badge: false,
                chevron: false
            },
            {
                name: 'Treinos em aberto',
                icon: 'md-list-box',
                subtitle: 'Editar dados | ' +
                    'Controlar a disponibilidade dos atletas | ' +
                    'Fechar o período de convocatórias',
                badge: {
                    value: this.state.number_trainings_without_presences,
                    status: "warning"
                },
                chevron: false,
                onPress: 'OpenedTrainings'
            },
            {
                name: 'Convocatórias fechadas',
                icon: 'md-log-out',
                subtitle: 'Editar presenças e atrasos | ' +
                    'Concluir ou eliminar treinos',
                badge: {
                    value: this.state.number_trainings_need_to_close,
                    status: "warning"
                },
                chevron: false,
                onPress: 'ManagementNavigator'
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
    }
});
