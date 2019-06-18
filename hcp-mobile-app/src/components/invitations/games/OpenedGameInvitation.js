import React, {Component} from 'react';
import {FlatList, RefreshControl, ScrollView, StyleSheet, View, Alert} from 'react-native';
import {connect} from 'react-redux';
import { ListItem, CheckBox } from 'react-native-elements';
import {Ionicons} from "@expo/vector-icons";
import getDirections from 'react-native-google-maps-directions';
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import AthletesGrid from "../../management/AthletesGrid";



class OpenedGameInvitation extends Component {

    constructor(props) {

        super(props);
        this.state = {
            isLoading: true,
            isRefreshing: false,

            // game info
            game: undefined,
            coaches: ["A carregar..."],
            secretaries: ["A carregar..."],
            athletes: [],

            // athlete info
            athleteID: undefined,
            athleteIsChild: false,
            isAvailable: true
        }
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'JOGO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });

    async componentWillMount() {

        await this.setState({
            game: this.props.navigation.getParam('game'),
            athleteID: this.props.navigation.getParam('athleteID'),
            athleteIsChild: this.props.navigation.getParam('athleteIsChild'),
        });
    }

    async componentDidMount() {

        await this.fetchData();
        await this.setState({isLoading: false});
    }

    /**
     * Fetch all needed data.
     * @returns {Promise<void>}
     */
    async fetchData() {

        await this.fetchAthletes(this.state.game.invitationIds);
        await this.fetchCoaches(this.state.game.coachIds);
        await this.fetchSecretaries(this.state.game.secretaryIds);
    }

    /**
     * Fetch athletes data. Order by squad number.
     * @param ids
     * @returns {Promise<void>}
     */
    async fetchAthletes(ids) {

        const params = {
            fields: [
                'id',
                'atleta',
                'disponivel',
                'numero'
            ],
            domain: [['id', 'in', ids]],
            order: 'numero ASC'
        };

        const response = await this.props.odoo.search_read('ges.linha_convocatoria', params);
        if(response.success && response.data.length > 0) {

            const data = response.data;
            const ids = this.state.game.athleteIds;
            let athletes = [];
            const athletesInfo = await this.fetchAthletesInfo(ids);

            data.forEach(item => {

                const athleteInfo = athletesInfo.find(a =>
                    item.atleta[0] === a.id
                );

                if(item.atleta[0] === this.state.athleteID) {
                    this.setState({isAvailable: item.disponivel});
                }

                let displayColor;
                if (item.disponivel)
                    displayColor = 'green';
                else
                    displayColor = 'red';

                const athlete = {
                    id: item.atleta[0],
                    name: item.atleta[1],
                    squad_number: item.numero,
                    available: item.disponivel,
                    image: athleteInfo ? athleteInfo.image : false,
                    echelon: athleteInfo ? athleteInfo.escalao[1] : 'erro',
                    displayColor: displayColor
                };

                athletes.push(athlete);
            });

            this.setState({
                athletes: athletes
            });
        }
    }

    /**
     * Fetch athletes images.
     * @param ids
     * @returns {Promise<Array|*>}
     */
    async fetchAthletesInfo(ids) {

        const params = {
            ids: ids,
            fields: [
                'id',
                'image',
                'escalao'
            ]
        };

        const response = await this.props.odoo.get('ges.atleta', params);
        if(response.success && response.data.length > 0)
            return response.data;

        return [];
    }

    /**
     * Fetch coaches names.
     * @param ids
     * @returns {Promise<void>}
     */
    async fetchCoaches(ids) {

        const params = {
            ids: ids,
            fields: ['name'],
        };

        const response = await this.props.odoo.get('ges.treinador', params);
        if(response.success && response.data.length > 0) {

            const data = response.data;

            let coachesNames = [];
            data.forEach(item => {
                coachesNames.push(item.name);
            });

            this.setState({
                coaches: coachesNames
            });
        } else {
            this.setState({
                coaches: ['Nenhum treinador atribuído']
            });
        }
    }

    /**
     * Fetch secretaries names.
     * @param ids
     * @returns {Promise<void>}
     */
    async fetchSecretaries(ids) {

        const params = {
            ids: ids,
            fields: ['name'],
        };

        const response = await this.props.odoo.get('ges.seccionista', params);
        if(response.success && response.data.length > 0) {

            await this.setState({secretaries: response.data.map(item => item.name)});

        } else {
            this.setState({
                secretaries: ['Nenhum seccionista atribuído']
            });
        }
    }

    /**
     * Get coordinates of local.
     */
    async getCoordinates() {

        this.setState({isLoading: true});

        const params = {
            ids: [this.state.game.place[0]],
            fields: ['coordenadas'],
        };
        const response = await this.props.odoo.get('ges.local', params);
        if (response.success && response.data.length > 0) {

            const coordinates = response.data[0].coordenadas;

            if(coordinates !== false) {

                const latitude = parseFloat(coordinates.split(", ")[0]);
                const longitude = parseFloat(coordinates.split(", ")[1]);

                this.setState({isLoading: false});

                return {
                    latitude: latitude,
                    longitude: longitude
                }
            }
        }

        this.setState({isLoading: false});
        return undefined;
    }

    /**
     * Open google maps.
     * @param coordinates
     */
    openGoogleMaps = (coordinates) => {

        navigator.geolocation.getCurrentPosition(
            position => {
                const data = {
                    source: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    },
                    destination: {
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude
                    },
                    params: [
                        {
                            key: "travelmode",
                            value: "driving"
                        },
                        {
                            key: "dir_action",
                            value: "navigate"
                        }
                    ]
                };

                getDirections(data)
            },
            error => {
                Alert.alert(
                    'Erro',
                    'Não foi possível obter as suas coordenadas.',
                    [
                        {text: 'Voltar', style: 'cancel',},
                    ],
                    {cancelable: true},
                );
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    };

    /**
     * Change athlete availability.
     * @returns {Promise<void>}
     */
    async changeAvailability(){

        this.setState({isLoading: true,});

        if(this.state.athleteID){

            const params = {
                kwargs: {
                    context: this.props.odoo.context,
                },
                model: 'ges.evento_desportivo',
                method: 'atleta_alterar_disponibilidade',
                args: [
                    this.state.game.eventId,
                    this.state.athleteID
                ],
            };

            const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
            if (response.success) {

                const athletes = this.state.athletes;
                const athleteIndex = athletes.findIndex(athlete => athlete.id === this.state.athleteID);

                if(athleteIndex >= 0) {
                    athletes[athleteIndex].available = !this.state.isAvailable;

                    if(athletes[athleteIndex].displayColor === 'green') athletes[athleteIndex].displayColor = 'red';
                    else athletes[athleteIndex].displayColor = 'green';
                }

                this.setState(state => ({
                    athletes: athletes,
                    isLoading: false,
                    isAvailable: !state.isAvailable,
                }));
            }
        }
        else {

            this.setState({
                isLoading: false,
            });
            Alert.alert(
                'Erro ao atualizar',
                'Ocorreu um erro ao atualizar a disponibilidade. Por favor, tente novamente.',
                [
                    {text: 'Confirmar'}
                ],
                {cancelable: true},
            );
        }
    };

    /**
     * When user refresh this screen.
     */
    onRefresh = async () => {

        await this.setState({isRefreshing: true});
        await this.fetchData();
        this.setState({isRefreshing: false});
    };

    /**
     * When user press local button.
     */
    onLocalPress = () => {

        if(this.state.game.place && this.state.game.place[0]) {

            this.getCoordinates().then(response => {

                if (response !== undefined) {

                    Alert.alert(
                        'Abrir o Google Maps',
                        'Pretende abrir o Google Maps para visualizar o local do evento?',
                        [
                            {text: 'Cancelar', style: 'cancel',},
                            {text: 'Sim', onPress: () => {
                                    this.openGoogleMaps(response);
                                }},
                        ],
                        {cancelable: true},
                    );
                }
                else {
                    Alert.alert(
                        'Não existem coordenadas',
                        'As coordenadas deste evento ainda não foram definidas. Peça ao administrador para as adicionar.',
                        [
                            {text: 'Voltar', style: 'cancel',},
                        ],
                        {cancelable: true},
                    );
                }
            });
        }
        else {
            Alert.alert(
                'Local não atribuído',
                'O local para este evento ainda não foi atribuído.',
                [
                    {text: 'Voltar', style: 'cancel',},
                ],
                {cancelable: true},
            );
        }
    };

    /**
     * Render item of first list.
     * @param item
     * @returns {*}
     */
    renderItemOfList = ({ item }) => {

        switch (item.name) {

            case 'Local':
                return (
                    <ListItem
                        title={item.name}
                        subtitle={item.subtitle}
                        leftAvatar={
                            <View style={{width: 25}}>
                                <Ionicons name={item.icon} size={27} />
                            </View>
                        }
                        containerStyle={{
                            backgroundColor: colors.lightRedColor,
                            minHeight: 60,
                        }}
                        chevron={true}
                        onPress={() => this.onLocalPress()}
                    />
                );
            case 'Disponibilidade': {

                const checkbox = (
                    <CheckBox
                        iconRight
                        checked={this.state.isAvailable}
                        onPress={async () => this.changeAvailability()}
                        size = {30}
                        containerStyle={{ marginRight: 5, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                        checkedColor={colors.availableColor}
                        uncheckedColor={colors.notAvailableColor}
                    />
                );

                return (
                    <ListItem
                        title={item.name}
                        subtitle={item.subtitle}
                        leftAvatar={
                            <View style={{width: 25}}>
                                <Ionicons name={item.icon} size={27} />
                            </View>
                        }
                        containerStyle={{
                            backgroundColor: colors.lightRedColor,
                            minHeight: 60,
                        }}
                        disabled={true}
                        rightElement={checkbox}
                    />
                );
            }
            default:
                return (
                    <ListItem
                        title={item.name}
                        subtitle={item.subtitle}
                        leftAvatar={
                            <View style={{width: 25}}>
                                <Ionicons name={item.icon} size={27} />
                            </View>
                        }
                        containerStyle={{
                            backgroundColor: colors.lightRedColor,
                            minHeight: 60,
                        }}
                        disabled={true}
                    />
                );
        }
    };

    render() {

        const list = [{
            name: 'Estado',
            icon: 'md-help-circle',
            subtitle: 'Convocatórias em aberto'
        },{
            name: 'Competição',
            icon: 'md-trophy',
            subtitle: this.state.game.competition,
        },{
            name: 'Escalão e Adversário',
            icon: 'md-shirt',
                subtitle: this.state.game.echelon[1] + '\n' + this.state.game.opponent,
        }, {
            name: 'Início e Duração',
            icon: 'md-time',
            subtitle:
                this.state.game.date + '  às  ' +
                this.state.game.hours + '\n' +
                this.state.game.duration + ' min',
        }, {
            name: 'Local',
            icon: 'md-pin',
            subtitle: this.state.game.place ? this.state.game.place[1] : 'Nenhum local atribuído',
        }, {
            name: 'Treinadores',
            icon: 'md-people',
            subtitle: this.state.coaches.join(',  ')
        }, {
            name: 'Seccionistas',
            icon: 'md-clipboard',
            subtitle: this.state.secretaries.join(',  ')
        },{
            name: 'Disponibilidade',
            icon: 'md-list-box',
            subtitle: !this.state.athleteIsChild ?
                'Altere a sua disponibilidade para este jogo' :
                'Altere a disponibilidade do seu filho para este jogo'
        }];

        return (
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
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
                            extraData = {this.state.isAvailable}
                            renderItem={this.renderItemOfList}
                            ListHeaderComponent={this.renderHeader}
                        />
                    </View>
                    <AthletesGrid
                        title={'Atletas Convocados'}
                        athletes={this.state.athletes}
                    />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    topHeader: {
        flex: 1,
        backgroundColor: '#ffe3e4',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        paddingVertical: 10,

        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedGameInvitation);