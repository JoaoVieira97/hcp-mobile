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
    ActivityIndicator,
    Alert
} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import { SectionGrid } from 'react-native-super-grid';
import { ListItem, CheckBox } from 'react-native-elements';
import CustomText from "../../CustomText";
import {colors} from "../../../styles/index.style";
import Loader from "../../screens/Loader";

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
            checked: false
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

                const athlete = {
                    id: item.atleta[0],
                    name: item.atleta[1],
                    squad_number: item.numero,
                    available: item.disponivel,
                    image: athleteImageEchelon ? athleteImageEchelon.image : false,
                    echelon: athleteImageEchelon ? athleteImageEchelon.escalao[1] : 'erro'
                };

                athletes.push(athlete);
            });

            const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
            const athleteId = athleteInfo[0].id;

            let checked = false;
            const athletesFiltered = athletes.filter(athlete => athlete.id === athleteId);

            if (athletesFiltered && athletesFiltered > 0)
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
    async changeAvailability(){

        this.setState({isLoading: true,});

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
        );

        if (response.success) {

            const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
            const athleteId = athleteInfo[0].id;

            const athletes = this.state.athletes;
            const athleteIndex = athletes.findIndex(athlete => athlete.id === athleteId);

            if(athleteIndex >= 0) athletes[athleteIndex].available = !this.state.checked;

            this.setState(state => ({
                athletes: athletes,
                isLoading: false,
                checked: !this.state.checked,
            }));
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
     * Render item of athletes list.
     * @param item
     * @returns {*}
     */
    renderItem = ({item}) => {

        let userImage;
        if (item.image)
            userImage = (
                <Image
                    source={{uri: `data:image/png;base64,${item.image}`}}
                    style={{width: '100%', height: '60%', opacity: 1,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
            );
        else
            userImage = (
                <Image
                    source={require('../../../../assets/user-account.png')}
                    style={{width: '100%', height: '60%', opacity: 0.8,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
            );

        return (
            <View style={[
                styles.itemContainer,
                {backgroundColor: item.available ? '#81c784' : '#e57373'}]}>
                {userImage}
                <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                    <Text numberOfLines={2} ellipsizeMode='tail' style={styles.itemName}>
                        {item.name}
                    </Text>
                    {
                        (item.echelon !== 'erro') ?
                            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.itemCode}>
                                #{item.squad_number} - {item.echelon}
                            </Text>
                            :
                            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.itemCode}>
                                #{item.squad_number}
                            </Text>
                    }
                </View>
            </View>
        );
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
                    <SectionGrid
                        itemDimension={100}
                        spacing={10}
                        sections={[{
                            title: 'Atletas convocados',
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
    gridView: {
        marginTop: 10,
        flex: 1,
    },
    itemContainer: {
        justifyContent: 'flex-start',
        borderRadius: 5,
        padding: 0,
        height: 150,
        //shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    itemName: {
        fontSize: 15,
        color: '#000',
        fontWeight: '500',
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
    }
});

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainingInvitations);