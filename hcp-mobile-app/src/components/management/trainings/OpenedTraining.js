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
import {Ionicons} from "@expo/vector-icons";
import { ListItem } from 'react-native-elements';
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import AthletesGrid from "../AthletesGrid";
import * as Animatable from "react-native-animatable";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";

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
        };
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerRight: *, headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'TREINO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
        headerRight:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginRight: 10}} onPress = {() => {navigation.navigate('EditOpenedTraining')}
            }>
                <Ionicons
                    name="md-create"
                    size={25}
                    color={'#ffffff'} />
            </TouchableOpacity>
    });

    async componentWillMount() {

        await this.setState({
            training: this.props.navigation.state.params.training
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
     * Render item of first list.
     * @param item
     * @returns {*}
     */
    renderItemOfList = ({ item }) => {
        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={
                    <View style={{width: 25}}>
                        <Ionicons name={item.icon} size={27} /*style={{paddingBottom: 5}}*/ />
                    </View>
                }
                containerStyle={{
                    backgroundColor: colors.lightRedColor,
                    minHeight: 60,
                }}
            />
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

    render() {

        const list = [{
            name: 'Escalão',
            icon: 'md-shirt',
            subtitle: this.state.training.echelon[1],
        }, {
            name: 'Início e duração',
            icon: 'md-time',
            subtitle:
                this.state.training.date + '  às  ' +
                this.state.training.hour + '\n' +
                this.state.training.duration + ' min',
        }, {
            name: 'Local',
            icon: 'md-pin',
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
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTraining);