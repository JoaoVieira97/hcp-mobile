import React from 'react';

import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import { ListItem } from 'react-native-elements';
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import AthletesGrid from "../AthletesGrid";
import * as Animatable from "react-native-animatable";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import getDirections from 'react-native-google-maps-directions';
import ConvertTime from "../../ConvertTime";
import moment from 'moment';



class OpenedTraining extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            animation: false,
            training: {},
            coaches: ['A carregar...'],
            secretaries: ['A carregar...'],
            athletes: [],
            showMore: false,

            isCoach: false,
        };
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerRight: *, headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => {

        const { params } = navigation.state;

        return {
            headerTitle: headerTitle(
                '#ffffff', 'TREINO'
            ),
            headerLeft: closeButton(
                '#ffffff', navigation
            ),
            headerRight:
                params.trainingID &&
                <TouchableOpacity style={{
                    width:42,
                    height:42,
                    alignItems:'center',
                    justifyContent:'center',
                    marginRight: 10}} onPress = {() => {
                    navigation.navigate('NewOrEditTraining', {
                        trainingID: params.trainingID,
                        reloadInfo: params.reloadInfo
                    })
                }
                }>
                    <Ionicons
                        name="md-create"
                        size={25}
                        color={'#ffffff'} />
                </TouchableOpacity>
        }
    };

    async componentWillMount() {

        for (let i = 0; i < this.props.user.groups.length; i++) {
            const group = this.props.user.groups[i];
            if (group.name === 'Treinador') {
                await this.setState({isCoach: true});
                break;
            }
        }

        if(this.state.isCoach) {
            this.props.navigation.setParams({
                trainingID: this.props.navigation.state.params.training.id,
                reloadInfo: () => this.onRefresh()
            });
        }
    }

    async componentDidMount() {

        await this.setState({
            training: this.props.navigation.state.params.training
        });

        const date = moment().format();
        await this.setState({date: date});

        await this.fetchData();
        await this.setState({isLoading: false});
    }

    async getTrainingInformation() {

        const params = {
            ids: [this.state.training.id],
            fields: [
                'id', 'start_datetime', 'stop_datetime', 'duracao',
                'atletas', 'treinador', 'seccionistas',
                'local', 'escalao', 'convocatorias', 'evento_desportivo'
            ],
        };

        const response = await this.props.odoo.get('ges.treino', params);
        if(response.success && response.data.length > 0) {

            const item = response.data[0];
            const convertTime = new ConvertTime();

            convertTime.setDate(item.start_datetime);
            const date = convertTime.getTimeObject();

            /**
             diff = difference in ms between actual date and training's date
             oneDay = one day in ms
             gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
             twoDaysLimit = actualDate + 2 days + '00:00:00' -> To verify Amanha
             (se a data do jogo nao atual ultrapassar estes 2 dias de limite, data=Amanha)
             */
            const diff = moment(convertTime.getDate()).diff(moment(this.state.date));
            const oneDay = 24 * 60 * 60 * 1000;
            const gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';
            const twoDaysLimit = (moment(this.state.date).add(2, 'days').format()
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

            const training = {
                id: item.id,
                local: item.local,
                echelon: item.escalao,
                duration: item.duracao,
                date: date.date,
                hour: date.hour,
                invitationIds: item.convocatorias,
                athleteIds : item.atletas,
                coachIds: item.treinador,
                secretaryIds: item.seccionistas,
                eventId: item.evento_desportivo[0]
            };

            await this.setState({training: training});
        }
    };

    /**
     * Fetch all needed data.
     * @returns {Promise<void>}
     */
    async fetchData() {

        await this.fetchAthletes(this.state.training.invitationIds);
        await this.fetchCoaches(this.state.training.coachIds);
        await this.fetchSecretaries(this.state.training.secretaryIds);
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
            const ids = this.state.training.athleteIds;
            let athletes = [];
            const athletesImages = await this.fetchAthletesImages(ids);

            data.forEach(item => {

                const athleteImageEchelon = athletesImages.find(imageItem =>
                    item.atleta[0] === imageItem.id
                );

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
                    image: athleteImageEchelon ? athleteImageEchelon.image : false,
                    echelon: athleteImageEchelon ? athleteImageEchelon.escalao[1] : 'error',
                    displayColor: displayColor
                };

                athletes.push(athlete);
            });

            this.setState({athletes: athletes});
        }
    }

    /**
     * Fetch athletes images.
     * @param ids
     * @returns {Promise<Array|*>}
     */
    async fetchAthletesImages(ids) {

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
     * Close invitations alert.
     * @returns {Promise<void>}
     */
    markPresences() {

        Alert.alert(
            'Confirmação',
            'Pretende fechar o período de convocatórias para este treino?',
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Confirmar',
                    onPress: async () => this._markPresences()
                },
            ],
            {cancelable: true},
        );
    }

    /**
     * Close invitations.
     * @returns {Promise<void>}
     * @private
     */
    async _markPresences() {

        await this.setState({isLoading: true});

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.treino',
            method: 'marcar_presencas',
            args: [this.state.training.id]
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            // remove training from list
            this.props.navigation.state.params.removeTraining(this.state.training.id);

            await this.setState({isLoading: false, animation: true});

            this.animation.play();
            setTimeout(() => {this.props.navigation.goBack()}, 1100);

        } else {

            await this.setState({isLoading: false});

            Alert.alert(
                'Erro',
                'Não foi possível fechar o período de convocatórias para este treino.' +
                        ' Por favor, tente mais tarde.',
                [{text: 'Confirmar', style: 'cancel'}],
                {cancelable: true},
            );
        }
    }

    /**
     * Change athlete availability.
     * @param athleteId
     */
    async changeAthleteAvailability(athleteId) {

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.evento_desportivo',
            method: 'atleta_alterar_disponibilidade',
            args: [
                this.state.training.eventId,
                athleteId
            ],
        };

        const response = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
        if (response.success) {

            const athletes = this.state.athletes.map(item => {
                let itemAux = item;
                if(item.id === athleteId) {
                    itemAux.available = !item.available;
                }

                // color
                if (itemAux.available)
                    itemAux.displayColor = 'green';
                else
                    itemAux.displayColor = 'red';

                return itemAux;
            });

            this.setState({athletes: athletes});

            return {success: true, athletes: athletes};
        }

        return {success: false, athletes: this.state.athletes};
    }

    /**
     * Get coordinates of local.
     */
    async getCoordinates() {

        this.setState({isLoading: true});

        const params = {
            ids: [this.state.training.local[0]],
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

    /**
     * When user refresh this screen.
     */
    onRefresh = async () => {

        await this.setState({isRefreshing: true, showMore: false});
        await this.getTrainingInformation();
        await this.fetchData();
        this.setState({isRefreshing: false});
    };

    /**
     * When user press local button.
     */
    onLocalPress = () => {

        if(this.state.training.local && this.state.training.local[0]) {

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

    render() {

        const list = [{
            name: 'Escalão',
            icon: 'md-shirt',
            subtitle: this.state.training.echelon ? this.state.training.echelon[1] : 'Não definido',
        }, {
            name: 'Início e duração',
            icon: 'md-time',
            subtitle:
                this.state.training.date + '  às  ' +
                this.state.training.hour + '\n' +
                this.state.training.duration + ' min',
        }, {
            name: 'Local',
            icon: 'google-maps',
            subtitle: this.state.training.local ? this.state.training.local[1] : 'Nenhum local atribuído',
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
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
                { this.state.animation &&
                    <View style={styles.loading} opacity={0.8}>
                        <Lottie
                            ref={animation => {
                                this.animation = animation;
                            }}
                            loop={false}
                            style={{
                                width: 200,
                                height: 200,
                            }}
                            source={require('../../../../assets/animations/success')}
                        />
                    </View>
                }
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
                        <View style={{zIndex: 500}}>
                            <TouchableOpacity
                                onPress={() => this.markPresences()}
                                style={styles.topButton}
                            >
                                <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                    {'FECHAR CONVOCATÓRIA'}
                                </Text>
                                <Text style={{color: '#dedede', fontWeight: '400', textAlign: 'center'}}>
                                    {'Serão registadas as presenças dos atletas disponíveis.'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.navigation.navigate('ChangeAthletesAvailabilities', {
                                        athletes: this.state.athletes,
                                        availabilityFunction: async (id) => await this.changeAthleteAvailability(id)
                                    });
                                }}
                                style={styles.topButton}
                            >
                                <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                    {'EDITAR DISPONIBILIDADES'}
                                </Text>
                                <Text style={{color: '#dedede', fontWeight: '400', textAlign: 'center'}}>
                                    {'Alterar a disponibilidade dos atletas convocados.'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{zIndex: 499}}>
                            {
                                this.state.showMore ?
                                    <Animatable.View animation={"fadeInDown"}>
                                        <FlatList
                                            keyExtractor={item => item.name}
                                            data={list}
                                            renderItem={this.renderItemOfList}
                                        />
                                    </Animatable.View> :
                                    <TouchableOpacity
                                        onPress={() => {this.setState({showMore: true})}}
                                        style={{justifyContent: 'center', alignItems: 'center', marginTop: 15}}
                                    >
                                        <Text style={{color: colors.darkGrayColor, fontWeight: '700', fontSize: 13}}>
                                            {'Ver informações do evento'}
                                        </Text>
                                        <Ionicons
                                            name="ios-arrow-down"
                                            size={28}
                                            color={colors.darkGrayColor} />
                                    </TouchableOpacity>
                            }
                        </View>
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
    },
    topButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(173, 46, 83, 0.8)',
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 5
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#ffffff",
        zIndex: 101
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTraining);