import React, { Component } from 'react';
import {Alert, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { connect } from 'react-redux';
import CustomText from "../../CustomText";
import {Ionicons} from "@expo/vector-icons";
import {ListItem} from "react-native-elements";
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import AthletesGrid from "../AthletesGrid";
import {DangerZone} from "expo";
import * as Animatable from "react-native-animatable";
const { Lottie } = DangerZone;

class PendingTraining extends Component {

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
            showMore: false
        };
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'TREINO'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginLeft: 10}} onPress = {() => navigation.goBack()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
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

        await this.fetchAthletes(this.state.training.availabilityIds);
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
                'presente',
                'atrasado',
            ],
            domain: [['id', 'in', ids]],
        };

        const response = await this.props.odoo.search_read('ges.linha_presenca', params);
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

            this.setState({athletes: athletes});
        }
    }

    /**
     * Fetch athletes information.
     * @param ids
     * @returns {Promise<Array|*>}
     */
    async fetchAthletesInfo(ids) {

        const params = {
            fields: [
                'id',
                'image',
                'escalao',
                'numerocamisola'
            ],
            domain: [['id', 'in', ids]],
            order: 'numerocamisola ASC'
        };

        const response = await this.props.odoo.search_read('ges.atleta', params);
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
     * Close training alert.
     * @returns {Promise<void>}
     */
    closeTraining() {

        Alert.alert(
            'Confirmação',
            'Pretende fechar este treino?',
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Confirmar',
                    onPress: async () => this._closeTraining()
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
    async _closeTraining() {

        await this.setState({isLoading: true});

        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.treino',
            method: 'fechar_evento',
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
     * @param athletePresenceId
     */
    async changeAthletePresence(athletePresenceId) {

        let value = false;
        const athletes = this.state.athletes.map(item => {
            let itemAux = item;
            if(item.presenceId === athletePresenceId) {
                // athlete presence
                itemAux.present = !item.present;

                // color
                if (itemAux.present && itemAux.late)
                    itemAux.displayColor = 'yellow';
                else if (itemAux.present)
                    itemAux.displayColor = 'green';
                else
                    itemAux.displayColor = 'red';

                // aux value
                value = itemAux.present;
            }

            return itemAux;
        });


        const response = await this.props.odoo.update('ges.linha_presenca', [athletePresenceId], {presente: value});
        if (response.success) {

            this.setState({athletes: athletes});

            return {success: true, athletes: athletes};
        }

        return {success: false, athletes: this.state.athletes};
    }

    /**
     * Change athlete availability.
     * @param athletePresenceId
     */
    async changeLateAthlete(athletePresenceId) {

        let value = false;
        const athletes = this.state.athletes.map(item => {
            let itemAux = item;
            if(item.presenceId === athletePresenceId) {
                // athlete presence
                itemAux.late = !item.late;

                // color
                if (itemAux.present && itemAux.late)
                    itemAux.displayColor = 'yellow';
                else if (itemAux.present)
                    itemAux.displayColor = 'green';
                else
                    itemAux.displayColor = 'red';

                // aux value
                value = itemAux.late;
            }

            return itemAux;
        });


        const response = await this.props.odoo.update('ges.linha_presenca', [athletePresenceId], {atrasado: value});
        if (response.success) {

            this.setState({athletes: athletes});

            return {success: true, athletes: athletes.filter(item => item.present)};
        }

        return {success: false, athletes: this.state.athletes.filter(item => item.present)};
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
                this.state.training.date + '  |  ' +
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
                                style={styles.topButton}
                                onPress={() => this.closeTraining()}
                            >
                                <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                                    {'FECHAR TREINO'}
                                </Text>
                                <Text style={{color: '#dedede', fontWeight: '400', textAlign: 'center'}}>
                                    {'O treino será fechado com as presenças e os atrasos definidos.'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.registerContainer}>
                                <TouchableOpacity
                                    disabled={this.state.athletes && this.state.athletes.length === 0}
                                    onPress={() => {
                                        this.props.navigation.navigate('ChangeAthletesPresences', {
                                            athletes: this.state.athletes,
                                            presenceFunction: async (id) => await this.changeAthletePresence(id)
                                        });
                                    }}
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
                                    onPress={() => {
                                        this.props.navigation.navigate('ChangeLateAthletes', {
                                            athletes: this.state.athletes.filter(item => item.present),
                                            lateFunction: async (id) => await this.changeLateAthlete(id)
                                        });
                                    }}
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
                                    onPress={() => {
                                        this.props.navigation.navigate('RegisterInjury', {
                                            eventId: this.state.training.id,
                                            eventDate: this.state.training.date,
                                            athletes: this.state.athletes.filter(a => a.present),
                                            eventType: 'treino'
                                        });
                                    }}
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
                        title={'Atletas presentes/atrasados'}
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

    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PendingTraining);