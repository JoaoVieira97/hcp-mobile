import React, {Component} from 'react';

import {Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {connect} from 'react-redux';
import {closeButton, headerTitle} from "../../navigation/HeaderComponents";
import getDirections from "react-native-google-maps-directions";
import {CheckBox, ListItem} from "react-native-elements";
import {Ionicons, MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import * as Animatable from "react-native-animatable";
import {DangerZone} from "expo";
const { Lottie } = DangerZone;
import AthletesGrid from "../AthletesGrid";



class PendingGame extends Component {

    constructor(props) {

        super(props);
        this.state = {
            isLoading: true,
            isRefreshing: false,
            showMore: false,
            animation: false,

            // game info
            game: undefined,
            coaches: ["A carregar..."],
            secretaries: ["A carregar..."],
            athletes: [],
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

        await this.fetchAthletes(this.state.game.availabilityIds);
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
                'presente',
                'atrasado',
            ],
            domain: [['id', 'in', ids]],
        };

        const response = await this.props.odoo.search_read('ges.linha_presenca', params);
        console.log(response);
        if(response.success && response.data.length > 0) {

            const data = response.data;
            const athletesIds = data.map(item => item.atleta[0]);
            const athletesInfo = await this.fetchAthletesInfo(athletesIds);

            let athletes = [];
            // orderBy squadNumber
            if(data.length === athletesInfo.length) {
                athletesInfo.forEach(item => {

                    const athleteInfo = data.find(athleteItem =>
                        athleteItem.atleta[0] === item.id
                    );

                    // color
                    let displayColor;
                    if (athleteInfo.presente && athleteInfo.atrasado)
                        displayColor = 'yellow';
                    else if (athleteInfo.presente)
                        displayColor = 'green';
                    else
                        displayColor = 'red';

                    const athlete = {
                        presenceId: athleteInfo.id,
                        id: athleteInfo.atleta[0],
                        name: athleteInfo.atleta[1],
                        squad_number: item.numerocamisola,
                        present: athleteInfo.presente,
                        late: athleteInfo.atrasado,
                        image: item.image,
                        echelon: item.escalao[1],
                        displayColor: displayColor
                    };

                    athletes.push(athlete);
                });
            }
            // orderBy name
            else {
                data.forEach(item => {

                    const athleteInfo = athletesInfo.find(imageItem =>
                        item.atleta[0] === imageItem.id
                    );

                    // color
                    let displayColor;
                    if (item.presente && item.atrasado)
                        displayColor = 'yellow';
                    else if (item.presente)
                        displayColor = 'green';
                    else
                        displayColor = 'red';

                    const athlete = {
                        presenceId: item.id,
                        id: item.atleta[0],
                        name: item.atleta[1],
                        squad_number: athleteInfo ? athleteInfo.numerocamisola : 0,
                        present: item.presente,
                        late: item.atrasado,
                        image: athleteInfo ? athleteInfo.image : false,
                        echelon: athleteInfo ? athleteInfo.escalao[1] : 'error',
                        displayColor: displayColor
                    };

                    athletes.push(athlete);
                });
            }

            this.setState({
                athletes: athletes.sort((a, b) => (a.squad_number) - (b.squad_number))
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
                'escalao',
                'numerocamisola'
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
            ids: [this.state.game.local[0]],
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

        await this.setState({isRefreshing: true, showMore: false});
        await this.fetchData();
        this.setState({isRefreshing: false});
    };

    /**
     * When user press local button.
     */
    onLocalPress = () => {

        if(this.state.game.local && this.state.game.local[0]) {

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
                this.state.game.hour + '\n' +
                this.state.game.duration + ' min',
        },{
            name: 'Antecedência',
            icon: 'ios-alarm',
            subtitle: this.state.game.antecedence,
        }, {
            name: 'Local',
            icon: 'google-maps',
            subtitle: this.state.game.local ? this.state.game.local[1] : 'Nenhum local atribuído',
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
                                style={styles.topButton}
                                //onPress={() => this.closeTraining()}
                            >
                                <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                    {'FECHAR JOGO'}
                                </Text>
                                <Text style={{color: '#dedede', fontWeight: '400', textAlign: 'center'}}>
                                    {'O jogo será fechado com as presenças e os atrasos definidos.'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.registerContainer}>
                                <TouchableOpacity
                                    disabled={this.state.athletes && this.state.athletes.length === 0}
                                    /*
                                    onPress={() => {
                                        this.props.navigation.navigate('ChangeAthletesPresences', {
                                            athletes: this.state.athletes,
                                            presenceFunction: async (id) => await this.changeAthletePresence(id)
                                        });
                                    }}
                                     */
                                    style={styles.registerButton}>
                                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                        {'REGISTAR'}
                                    </Text>
                                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                        {'PRESENÇAS'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={this.state.athletes && this.state.athletes.length === 0}
                                    /*onPress={() => {
                                        this.props.navigation.navigate('ChangeLateAthletes', {
                                            athletes: this.state.athletes.filter(item => item.present),
                                            lateFunction: async (id) => await this.changeLateAthlete(id)
                                        });
                                    }}*/
                                    style={styles.registerButton}>
                                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                        {'REGISTAR'}
                                    </Text>
                                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                        {'ATRASOS'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={this.state.athletes && this.state.athletes.length === 0}
                                    /*
                                    onPress={() => {
                                        this.props.navigation.navigate('RegisterInjury', {
                                            eventId: this.state.training.id,
                                            eventDate: this.state.training.date,
                                            athletes: this.state.athletes.filter(a => a.present),
                                            eventType: 'treino'
                                        });
                                    }}
                                     */
                                    style={styles.registerButton}>
                                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                        {'REGISTAR'}
                                    </Text>
                                    <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                        {'LESÃO'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
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
    registerContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15
    },
    registerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(173, 46, 83, 0.8)',
        padding: 10,
        width: '33%',
        marginHorizontal: 5,
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

    user: state.user,
    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PendingGame);