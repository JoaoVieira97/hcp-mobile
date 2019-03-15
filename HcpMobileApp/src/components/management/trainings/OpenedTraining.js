import React from 'react';

import {View, Text, StyleSheet, Image, ScrollView, RefreshControl, FlatList} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import { SectionGrid } from 'react-native-super-grid';
import { ListItem } from 'react-native-elements';

class OpenedTraining extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isRefreshing: false,
            id: false,
            category: '',
            local: '',
            startTime: '',
            endTime: '',
            duration: '',
            coaches: [],
            athletes: [],
        }
    }

    componentDidMount() {

        this.setState({

            id: this.props.navigation.getParam('id')

        }, async () => {
            await this.fetchTraining(this.state.id);
        });
    }

    /**
     * Definir as opções da barra de navegação no topo.
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: 'Treino',
        headerLeft: <Ionicons
            name="md-arrow-back"
            size={28}
            color={'#ffffff'}
            style={{paddingLeft: 20}}
            onPress = {() => navigation.goBack()}
        />,
        headerRight: <Ionicons
            name="md-create"
            size={25}
            color={'#ffffff'}
            style={{paddingRight: 20}}
            onPress = {() => navigation.navigate('EditOpenedTraining')}
        />
    });

    /**
     * Buscar todos os dados necessários sobre o treino.
     * @param id
     */
    async fetchTraining(id) {

        let params = {
            ids: [id],
            fields: [
                'id',
                'escalao',
                'local',
                'start_datetime',
                'stop_datetime',
                'duracao',
                'treinador',
                'convocatorias'
            ],
        };

        const response = await this.props.odoo.get('ges.treino', params);
        if (response.success && response.data.length > 0) {

            console.log(response.data);
            await this.fetchAthletes(response.data[0].convocatorias);

            await this.setState({
                category: response.data[0].escalao[1],
                startTime: response.data[0].start_datetime,
                endTime: response.data[0].stop_datetime,
                duration: response.data[0].duration,
                coaches: response.data[0].treinador,
                local: response.data[0].local[1],
            });
        }
    }

    /**
     * Buscar os atletas que foram convocados, bem como a sua disponibilidade.
     * @param ids
     */
    async fetchAthletes(ids) {

        const params = {
            ids: ids,
            fields: [
                'atleta',
                'disponivel',
                'numero'
            ],
        };

        const response = await this.props.odoo.get('ges.linha_convocatoria', params)

        if(response.success && response.data.length > 0) {

            const data = response.data;
            const size = data.length;

            let athletes = [];
            for (let i = 0; i < size; i++) {

                const athlete = {
                    id: data[i].atleta[0],
                    name: data[i].atleta[1],
                    squad_number: data[i].numero,
                    available: data[i].disponivel,
                    image: await this.fetchAthleteImage(data[i].atleta[0])
                };

                athletes.push(athlete);
            }

            this.setState(state => ({
                athletes: [...state.athletes, ...athletes]
            }));
        }
    }

    /**
     * Buscar a imagem do atleta
     * @param id
     */
    async fetchAthleteImage (id) {

        const params = {
            ids: [id],
            fields: [
                'image',
            ]
        };

        const response = await this.props.odoo.get('ges.atleta', params);

        if(response.success && response.data.length > 0)
            return response.data[0].image;

        return null;
    }

    /**
     * Renderizar o item da lista presente no header.
     * @param {Object} item
     */
    renderItemOfList = ({ item }) => (
        <ListItem
            title={item.name}
            subtitle={item.subtitle}
            leftAvatar={
                <View style={{width: 25}}>
                    <Ionicons name={item.icon} size={27} /*style={{paddingBottom: 5}}*/ />
                </View>
            }
            containerStyle={{
                backgroundColor: '#ffe3e4',
                height: 60,
            }}
        />
    );

    /**
     * Renderizar o item dos atletas convocados.
     * @param {Object} item
     */
    renderItem = ({item}) => {

        if(item.image) {
            return (
                <View style={[
                    styles.itemContainer,
                    {backgroundColor: item.available ? '#81c784' : '#e57373'}]}>
                    <Image
                        source={{uri: `data:image/png;base64,${item.image}`}}
                        style={{width: '100%', height: '60%', opacity: 1,
                            borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                    </Image>
                    <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                        <Text style={styles.itemName}>
                            {item.name.substring(0, 27)}
                        </Text>
                        <Text style={styles.itemCode}>#{item.squad_number}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[
                styles.itemContainer,
                {backgroundColor: item.available ? '#81c784' : '#e57373'}]}>
                <Image
                    source={require('../../../../assets/user-account.png')}
                    style={{width: '100%', height: '60%', opacity: 0.8,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
                <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                    <Text style={styles.itemName}>
                        {item.name.substring(0, 27)}
                    </Text>
                    <Text style={styles.itemCode}>#{item.squad_number}</Text>
                </View>
            </View>
        );
    };

    /**
     * Função que permite atualizar o conteúdo do componente.
     */
    onRefresh = () => {
        this.setState({
            isRefreshing: true,
            athletes: []
        }, async () => {

            await this.fetchTraining(this.state.id);
            this.setState({isRefreshing: false});
        });
    };


    render() {

        const list = [{
            name: 'Escalão',
            icon: 'md-shirt',
            subtitle: this.state.category,
        }, {
            name: 'Início',
            icon: 'md-time',
            subtitle: this.state.startTime
        }, {
            name: 'Local',
            icon: 'md-pin',
            subtitle: this.state.local
        }, {
            name: 'Treinadores',
            icon: 'md-people',
            subtitle: 'Treinador 1 | Treinador 2'
        }];

        return (
            <ScrollView
                style={{flex: 1}}
                nestedScrollEnabled={true}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.onRefresh}
                    />
                }>
                <View style={styles.topHeader}>
                    <FlatList
                        keyExtractor={item => item.name}
                        data={list}
                        renderItem={this.renderItemOfList}
                    />
                </View>
                <SectionGrid
                    itemDimension={100}
                    spacing={10}
                    sections={[{
                        title: 'Atletas convocados | Disponibilidade',
                        data: this.state.athletes,
                    }]}
                    style={styles.gridView}
                    renderItem={this.renderItem}
                    renderSectionHeader={({section}) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionText}>{section.title}</Text>
                        </View>
                    )}
                />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    topHeader: {
        flex: 1,
        backgroundColor: '#ffe3e4',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingVertical: 10
    },
    gridView: {
        marginTop: 10,
        flex: 1,
    },
    itemContainer: {
        justifyContent: 'flex-start',
        borderRadius: 5,
        padding: 0,
        height: 150,
    },
    itemName: {
        fontSize: 16,
        color: '#000',
        fontWeight: '600',
    },
    itemCode: {
        fontWeight: '600',
        fontSize: 12,
        color: '#000',
    },
    sectionHeader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#ad2e53',
        borderBottomWidth: 2,
        marginHorizontal: 20,
        padding: 5
    },
    sectionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#ad2e53',
    },
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTraining);