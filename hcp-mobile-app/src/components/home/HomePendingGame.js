import React, {Component} from 'react';
import {FlatList, RefreshControl, ScrollView, StyleSheet, View, Alert} from 'react-native';
import {connect} from 'react-redux';
import { ListItem } from 'react-native-elements';
import {Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {headerTitle, closeButton, linearGradientHeader} from "../navigation/HeaderComponents";
import Loader from "../screens/Loader";
import {colors} from "../../styles/index.style";
import getDirections from 'react-native-google-maps-directions';
import ConvertTime  from '../ConvertTime';
import moment from 'moment';


class HomePendingGame extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            gameEvent: undefined,
            game: undefined,
            coaches: ['A carregar...'],
            secretaries: ['A carregar...'],
        };
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'JOGO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
        headerBackground: linearGradientHeader(),
    });

    async componentWillMount() {
        await this.setState({
            gameEvent: this.props.navigation.state.params.gameEvent
        });
    }

    async componentDidMount() {

        await this.fetchGameInfo();
        this.setState({isLoading: false});
    }

    /**
     * Fetch game information.
     * @returns {Promise<void>}
     */
    fetchGameInfo = async () => {

        const params = {
            domain: [
                ['evento_desportivo', 'in', [this.state.gameEvent.id]],
            ],
            fields: [
                'id', 'evento_desportivo' , 'display_start', 'antecedencia',
                'local', 'escalao', 'duracao',
                'treinador', 'seccionistas',
                'equipa_adversaria', 'competicao'],
        };

        const response = await this.props.odoo.search_read('ges.jogo', params);
        if(response.success && response.data.length > 0) {

            const game = response.data[0];

            const convertTime = new ConvertTime();
            convertTime.setDate(game.display_start);
            const date = convertTime.getTimeObject();

            /**
             diff = difference in ms between actual date and game's date
             oneDay = one day in ms
             gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
             twoDaysLimit = actualDate + 2 days + '00:00:00' -> To verify Amanha
             (se a data do jogo nao atual ultrapassar estes 2 dias de limite, data=Amanha)
             */
            let diff = moment(convertTime.getDate()).diff(moment(this.state.date));
            let oneDay = 24 * 60 * 60 * 1000;
            let gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';
            let twoDaysLimit = (moment(this.state.date).add(2, 'days').format()
                .split('T'))[0] + 'T00:00:00';

            if(diff >=0){
                if(diff < oneDay) {
                    if(moment(this.state.date).isAfter(gameDayMidNight)) date.date = 'Hoje';
                    else date.date = 'Amanhã';
                }
                else if(diff < 2*oneDay && !moment(convertTime.getDate()).isAfter(twoDaysLimit)) {
                    date.date = 'Amanhã';
                }
            }

            await this.setState({
                game: {
                    id: game.id,
                    eventId: game.evento_desportivo[0],
                    place: game.local,
                    echelon: game.escalao,
                    duration: game.duracao,
                    date: date.date,
                    hours: date.hour,
                    state: game.state,
                    antecedence: !game.antecedencia ? 'Não definida' :
                        game.antecedencia === 1 ? game.antecedencia + ' hora' : game.antecedencia + ' horas',
                    opponent: game.equipa_adversaria ? game.equipa_adversaria[1] : 'Não definido',
                    competition: game.competicao ? (game.competicao[1].split('('))[0] : 'Não definida',
                    coachIds: game.treinador,
                    secretaryIds: game.seccionistas,
                }
            });

            await this.fetchCoaches(this.state.game.coachIds);
            await this.fetchSecretaries(this.state.game.secretaryIds);
        }
    };

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
     * When user refresh this screen.
     */
    onRefresh = async () => {

        await this.setState({isRefreshing: true});
        await this.fetchGameInfo();
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

        if (item.name === 'Local') {
            return (
                <ListItem
                    title={item.name}
                    subtitle={item.subtitle}
                    leftAvatar={
                        <View style={{width: 25}}>
                            <MaterialCommunityIcons
                                name={item.icon}
                                size={27}
                                color={colors.redColor}
                            />
                        </View>
                    }
                    containerStyle={{
                        backgroundColor: colors.lightRedColor,
                        minHeight: 60,
                    }}
                    rightIcon={
                        <MaterialIcons
                            name={'keyboard-arrow-right'}
                            size={25}
                            color={colors.redColor}
                        />
                    }
                    onPress={() => this.onLocalPress()}
                />
            );
        } else {
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
            subtitle: 'Convocatórias fechadas'
        }, {
            name: 'Competição',
            icon: 'md-trophy',
            subtitle: this.state.game ? this.state.game.competition : 'A carregar...',
        }, {
            name: 'Escalão e Adversário',
            icon: 'md-shirt',
            subtitle: this.state.game ? (this.state.game.echelon[1] + '\n' + this.state.game.opponent) :
                'A carregar...',
        }, {
            name: 'Início e Duração',
            icon: 'md-time',
            subtitle: this.state.game ? (this.state.game.date + '  às  ' +
                this.state.game.hours + '\n' +
                this.state.game.duration + ' min') :
                'A carregar...'
        },{
            name: 'Antecedência',
            icon: 'ios-alarm',
            subtitle: this.state.game ? this.state.game.antecedence : 'A carregar...',
        }, {
            name: 'Local',
            icon: 'google-maps',
            subtitle: this.state.game ?
                (this.state.game.place ? this.state.game.place[1] : 'Nenhum local atribuído') :
                'A carregar...',
        }, {
            name: 'Treinadores',
            icon: 'md-people',
            subtitle: this.state.coaches.join(',  ')
        }, {
            name: 'Seccionistas',
            icon: 'md-clipboard',
            subtitle: this.state.secretaries.join(',  ')
        }];


        return (
            <View style={{flex: 1, backgroundColor: '#ffe3e4'}}>
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
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    topHeader: {
        flex: 1,
        paddingVertical: 10,
    }
});

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(HomePendingGame);