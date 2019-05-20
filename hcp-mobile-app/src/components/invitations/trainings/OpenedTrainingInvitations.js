import React, {Component} from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    RefreshControl,
    FlatList,
    TouchableOpacity,
    Alert
} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import { ListItem, CheckBox } from 'react-native-elements';
import CustomText from "../../CustomText";
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";
import AthletesGrid from "../../management/AthletesGrid";

class OpenedTrainingInvitations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            training: {
                id: undefined,
                place: [],
                echelon: [],
                duration: undefined,
                date: undefined,
                hours: undefined,
                athleteIds : [],
                invitationIds: [],
                coachIds: [],
                secretaryIds: [],
                canChangeAvailability: undefined,
            },
            coaches: ["A carregar..."],
            secretaries: ["A carregar..."],
            athletes: [],
            checked: true
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: //'Treino',
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
            </TouchableOpacity>,
    });

    async componentWillMount() {

        await this.setState({
            training: this.props.navigation.getParam('training'),
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
                    echelon: athleteImageEchelon ? athleteImageEchelon.escalao[1] : 'erro',
                    displayColor: displayColor
                };

                athletes.push(athlete);
            });

            const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
            const athleteId = athleteInfo[0].id;

            let checked = true;
            const athletesFiltered = athletes.filter(athlete => athlete.id === athleteId);

            if (athletesFiltered && athletesFiltered.length > 0)
                checked = athletesFiltered[0].available;

            this.setState({
                athletes: athletes,
                checked: checked
            });
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
     * Change athlete availability.
     * @returns {Promise<void>}
     */

/*
    async changeAthleteAvailability(athleteId) {


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

*/
    async changeAvailability(){

        this.setState({isLoading: true,});

        /*
        const params = {
            kwargs: {
                context: this.props.odoo.context,
            },
            model: 'ges.treino',
            method: 'alterar_disponibilidade',
            args: [this.state.training.id],
        };

        const response = await this.props.odoo.rpc_call(
            '/web/dataset/call_kw',
            params
        );*/

        const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');

        if(athleteInfo){
            const athleteId = athleteInfo[0].id;

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

            console.log(response);
            console.log("ATLETA: "+athleteId);
            console.log("ID: "+ this.props.user.id);
            if (response.success) {

                //const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
                //const athleteId = athleteInfo[0].id;

                const athletes = this.state.athletes;
                const athleteIndex = athletes.findIndex(athlete => athlete.id === athleteId);

                if(athleteIndex >= 0) {
                    athletes[athleteIndex].available = !this.state.checked;

                    if(athletes[athleteIndex].displayColor === 'green') athletes[athleteIndex].displayColor = 'red';
                    else athletes[athleteIndex].displayColor = 'green';
                }

                this.setState(state => ({
                    athletes: athletes,
                    isLoading: false,
                    checked: !this.state.checked,
                }));
            }
        }

        else {

            this.setState({
                isLoading: false,
            });

            Alert.alert(
                'Erro ao atualizar',
                'Ocorreu um erro ao atualizar a sua disponibilidade. Por favor, tente novamente.',
                [
                    {text: 'Confirmar'}
                ],
                {cancelable: true},
            );
        }
    };


    async getCoords(local){

        if(local){

            const item = {
                id: this.state.training.id,
                type: 1,
                title: 'Treino ' + this.state.training.echelon[1],
                time: 'Início: ' + this.state.training.hours + 'h',
                description: 'Duração: ' + this.state.training.duration + ' min',
                local: this.state.training.place[0],
                date: this.state.training.date,
                localName: this.state.training.place[1],
            };

            this.props.navigation.navigate('EventScreen',{item : item});
        }
    }


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
                            <Ionicons name={item.icon} size={27} />
                        </View>
                    }
                    containerStyle={{
                        backgroundColor: colors.lightRedColor,
                        minHeight: 60,
                    }}
                    chevron={true}
                    onPress={async () => this.getCoords(true)}
                />
            );
        }
        else if (item.name === 'Disponibilidade') {

            const checkbox = (
                <CheckBox
                    iconRight
                    checked={this.state.checked}
                    onPress={async () => this.changeAvailability()}
                    size = {30}
                    containerStyle={{ marginRight: 5, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                    checkedColor={'#81c784'}
                    uncheckedColor={'#e57373'}
                />
            );

            return (
                <ListItem
                    title={item.name}
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
        else {
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

        await this.setState({isRefreshing: true});
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
                this.state.training.hours + '\n' +
                this.state.training.duration + ' min',
        }, {
            name: 'Local',
            icon: 'md-pin',
            subtitle: this.state.training.place ? this.state.training.place[1] : 'Nenhum local atribuído',
        }, {
            name: 'Treinadores',
            icon: 'md-people',
            subtitle: this.state.coaches.join(',  ')
        }, {
            name: 'Seccionistas',
            icon: 'md-clipboard',
            subtitle: this.state.secretaries.join(',  ')
        }];

        if (this.state.training.canChangeAvailability)
            list.push({
                name: 'Disponibilidade',
                icon: 'md-list-box'
            });

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
                            extraData = {this.state.checked}
                            renderItem={this.renderItemOfList}
                            ListHeaderComponent={this.renderHeader}
                        />
                    </View>
                    <AthletesGrid
                        title={'Atletas convocados'}
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

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainingInvitations);