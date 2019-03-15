import React from 'react';

import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import { SectionGrid } from 'react-native-super-grid';

class OpenedTraining extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            id: false,
            category: '',
            local: {},
            startTime: '',
            endTime: '',
            coaches: [],
            athletes: [],
        }
    }

    componentDidMount() {

        this.setState({
            id: this.props.navigation.getParam('id')
        }, () => {
            this.fetchTraining(this.state.id);
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
    fetchTraining(id) {

        let params = {
            ids: [id],
            fields: [
                'id',
                'escalao',
                'local',
                'start_datetime',
                'stop_datetime',
                'treinador',
                'convocatorias'
            ],
        };

        this.props.odoo.get('ges.treino', params)
            .then(response => {

                if (response.success && response.data.length > 0) {

                    this.fetchAthletes(response.data[0].convocatorias);
                }
            })
            .catch(e => {})
    }

    /**
     * Buscar os atletas que foram convocados, bem como a sua disponibilidade.
     * @param ids
     */
    fetchAthletes(ids) {

        const params = {
            ids: ids,
            fields: [
                'atleta',
                'disponivel',
                'numero'
            ],
        };

        this.props.odoo.get('ges.linha_convocatoria', params)
            .then(response => {

                if(response.success && response.data.length > 0) {

                    const data = response.data;
                    const size = data.length;

                    let athletes = [];
                    for (let i = 0; i < size; i++) {

                        const athlete = {
                            id: data[i].atleta[0],
                            name: data[i].atleta[1],
                            squad_number: data[i].numero,
                            available: data[i].disponivel
                        };

                        athletes.push(athlete);
                    }

                    this.setState(state => ({
                        athletes: [...state.athletes, ...athletes]
                    }));
                }
            })
            .catch(error => {});
    }

    render() {
        const items = [
            {name: 'TURQUOISE', code: '#1abc9c'},
            {name: 'EMERALD', code: '#2ecc71'},
            {name: 'PETER RIVER', code: '#3498db'},
            {name: 'AMETHYST', code: '#9b59b6'},
            {name: 'WET ASPHALT', code: '#34495e'},
            {name: 'GREEN SEA', code: '#16a085'},
            {name: 'NEPHRITIS', code: '#27ae60'},
            {name: 'BELIZE HOLE', code: '#2980b9'},
            {name: 'WISTERIA', code: '#8e44ad'},
            {name: 'MIDNIGHT BLUE', code: '#2c3e50'},
            {name: 'SUN FLOWER', code: '#f1c40f'},
            {name: 'CARROT', code: '#e67e22'},
            {name: 'ALIZARIN', code: '#e74c3c'},
            {name: 'CLOUDS', code: '#ecf0f1'},
            {name: 'CONCRETE', code: '#95a5a6'},
            {name: 'ORANGE', code: '#f39c12'},
            {name: 'PUMPKIN', code: '#d35400'},
            {name: 'POMEGRANATE', code: '#c0392b'},
            {name: 'SILVER', code: '#bdc3c7'},
            {name: 'ASBESTOS', code: '#7f8c8d'},
        ];

        return (
            <SectionGrid
                itemDimension={90}
                // staticDimension={300}
                // fixed
                // spacing={20}
                sections={[
                    {
                        title: 'Atletas convocados',
                        data: items.slice(0, 20),
                    }
                ]}
                style={styles.gridView}
                renderItem={({item, section, index}) => (
                    <View style={[styles.itemContainer, {backgroundColor: item.code}]}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemCode}>{item.code}</Text>
                    </View>
                )}
                renderSectionHeader={({section}) => (
                    <Text style={styles.sectionHeader}>{section.title}</Text>
                )}
            />
        );
    }
}

const styles = StyleSheet.create({
    gridView: {
        marginTop: 20,
        flex: 1,
    },
    itemContainer: {
        justifyContent: 'flex-end',
        borderRadius: 5,
        padding: 10,
        height: 150,
    },
    itemName: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    itemCode: {
        fontWeight: '600',
        fontSize: 12,
        color: '#fff',
    },
    sectionHeader: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        alignItems: 'center',
        backgroundColor: '#636e72',
        color: 'white',
        padding: 10,
    },
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTraining);