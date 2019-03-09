import React, { Component } from 'react';
import {Text, View, Button, StyleSheet, FlatList, Alert} from 'react-native';
import {connect} from 'react-redux';
//import { FlatGrid } from 'react-native-super-grid';


import { ListItem } from 'react-native-elements'
import {Ionicons} from "@expo/vector-icons";



class TrainingScreen extends Component {

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


    async getAllTrainingsWithoutPresences() {

        const params = {
            domain: [
                ['state', '=', 'aberto'],
                ['n_presentes', '=', '0']],
            fields: ['id', 'state', 'n_presentes', 'evento_ref'],
        };

        let response = await this.props.odoo.search_read('ges.evento_desportivo', params);
        if (response.success) {

            /*
            let finalArray = [];
            const size = response.success.data.length;
            
            for (let i = 0; i < size; i++) {
                if(response.success.data[i].)
            }
            */

            //console.log(response.data);
            Alert.alert("Total", response.data.length.toString());
        }
    }

    async handlePress() {

        //await this.getEvent(1302);
        //await this.getConvocation(13332);

        //await this.registerAvailabilities([13332, 13333, 13332, 13334, 13335, 13336 ], false);

        await this.getAllTrainingsWithoutPresences();
    }

    icon = (type) => (<Ionicons name={type} size={30}/>);

    renderItem = ({ item }) => {

        if (item.badge) {
            return (
                <ListItem
                    title={item.name}
                    subtitle={item.subtitle}
                    leftAvatar={this.icon(item.icon)}
                    badge={item.badge}
                    chevron
                />
            );
        }

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={this.icon(item.icon)}
                chevron
            />
        );
    };

    render() {

        const list = [
            {
                name: 'Criar treino',
                icon: 'md-add',
                subtitle: '',
                badge: false
            },
            {
                name: 'Registar presenças',
                icon: 'md-list-box',
                subtitle: 'Controlar disponibilidade dos atletas e registar presenças.',
                badge: { value: 100, textStyle: { color: 'orange' }}
            },
            {
                name: 'Fechar treino',
                icon: 'md-log-out',
                subtitle: 'Concluir ou eliminar treinos.',
                badge: { value: 32, textStyle: { color: 'orange' }}
            },
        ];



        return (
            <View style={styles.container}>
                <FlatList
                    keyExtractor={item => item.name}
                    data={list}
                    renderItem={this.renderItem}
                />
                {
                    /*
                    <Button
                        onPress={this.handlePress.bind(this)}
                        title="GET DATA"
                        color="#ad2e53"
                    />
                     */
                }
                <Button
                    onPress={this.handlePress.bind(this)}
                    title="GET DATA"
                    color="#ad2e53"
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
