import React, {Component} from 'react';

import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    RefreshControl,
    FlatList,
    ListView,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import { SectionGrid } from 'react-native-super-grid';
import { ListItem, CheckBox } from 'react-native-elements';
import CustomText from "../../CustomText";
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;

import {colors} from "../../../styles/index.style";

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
            coaches: ["A carregar..."], //dando ids de treinadores do treino, para buscar o nome
            secretaries: ["A carregar..."], //dando ids de seccionistas do treino, para buscar o nome
            athletes: [], //dando ids de atletas do treino, para buscar o nomes, numero e disponibilidade
            checked: undefined, //verificar checkbox
        }
    }

    /*
   componentWillMount() {

        this.setState({
            training: this.props.navigation.getParam('training'),
        });
    }
*/

    async componentDidMount() {

        await this.setState({
            training: this.props.navigation.getParam('training'),
        });

        await this.fetchData();
    }

    /**
     * Definir as opções da barra de navegação no topo.
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

    /**
     * Buscar todos os dados necessários sobre o treino.
     */
    async fetchData() {
        await this.fetchAthletes(this.state.training.invitationIds);
        await this.fetchCoaches(this.state.training.coachIds);
        await this.fetchSecretaries(this.state.training.secretaryIds);


        await this.setState({
            isLoading: false,
            isRefreshing: false
        });
    }

    /**
     * Buscar os atletas que foram convocados, bem como a sua disponibilidade.
     * @param ids
     */
    async fetchAthletes(ids) {

        const params = {
            domain: [['id','=',ids],],
            fields: [
                'atleta',
                'disponivel',
                'numero'
            ],
            order: 'numero ASC',
        };

        const response = await this.props.odoo.search_read('ges.linha_convocatoria', params);

        if(response.success && response.data.length > 0) {

            const data = response.data;
            const ids = this.state.training.athleteIds;//data.map(athlete => {return athlete.atleta[0]});

            let athletes = [];
            const athletesImages = await this.fetchAthletesImages(ids);

            data.forEach(item => {

                const image = athletesImages.find(imageItem =>
                    item.atleta[0] === imageItem.id
                );

                const athlete = {
                    id: item.atleta[0],
                    name: item.atleta[1],
                    squad_number: item.numero,
                    available: item.disponivel,
                    image: image.image,
                };

                athletes.push(athlete);
            });

            //VER ISTO DEPOIS!
            const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
            const athleteId = athleteInfo[0].id;

            const checked = (athletes.filter(athlete => athlete.id === athleteId))[0].available;

            this.setState(state => ({
                athletes: [...state.athletes, ...athletes],
                checked: checked,
            }));
        }
    }

    /**
     * Buscar as imagens dos atletas.
     * @param ids
     */
    async fetchAthletesImages(ids) {

        const params = {
            ids: ids,
            fields: [
                'id',
                'image',
            ]
        };

        const response = await this.props.odoo.get('ges.atleta', params);

        if(response.success && response.data.length > 0)
            return response.data;

        return [];
    }

    /**
     * Buscar os nomes dos treinadores associados ao treino.
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

    async fetchSecretaries(ids) {

        const params = {
            ids: ids,
            fields: ['name'],
        };

        const response = await this.props.odoo.get('ges.seccionista', params);

        if(response.success && response.data.length > 0) {

            const data = response.data;

            let secretaryNames = [];
            data.forEach(item => {
                secretaryNames.push(item.name);
            });

            this.setState({
                secretaries: secretaryNames
            });
        } else {
            this.setState({
                secretaries: ['Nenhum seccionista atribuído']
            });
        }

    }

    /**
     * Registar presenças.
     */

    /**
     * Mudar disponibilidade atual.
     * TODO Send notifications to coaches and secretarys
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
     * Renderizar o item da lista presente no header.
     * @param {Object} item
     */
    renderItemOfList = ({ item }) => {
        let checkbox;
        let arrow;
        let getLocal = false;
        let disabled = true;

        if (item.name === 'Disponibilidade'){
            checkbox = (
                <CheckBox
                    iconRight
                    checked={this.state.checked}
                    onPress={() => this.changeAvailability()}
                    size = {30}
                    containerStyle={{ marginRight: 5, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                    //iconType='material'
                    //checkedIcon='clear'
                    //uncheckedIcon='add'
                    checkedColor = {'#81c784'}
                    uncheckedColor = {'#e57373'}
                />
            )
        }

        if (this.state.training.canChangeAvailability && item.name === 'Local') {
            arrow = (
                <View style={{width: 25}}>
                    <Ionicons name={'ios-arrow-forward'} size={24} color={'#919391'}/>
                </View>
            );

            getLocal = true;
            disabled = false;
        }

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={
                    <View style={{width: 25}}>
                        <Ionicons name={item.icon} size={27} />
                    </View>
                }
                //chevron={chevron}
                rightIcon={arrow}
                containerStyle={{
                    backgroundColor: '#ffe3e4',
                    height: 60,
                }}
                rightElement={checkbox}
                onPress = { () => {this.getCoords(getLocal)} }
                disabled = {disabled}
            />
        )

    };



    /**
     * Renderizar o item dos atletas convocados.
     * @param {Object} item
     */
    renderItem = ({item}) => {

        let image;

        if(item.image){
            image = (
                <Image
                    source={{uri: `data:image/png;base64,${item.image}`}}
                    style={{width: '100%', height: '60%', opacity: 1,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
            )
        }
        else {
            image = (
                <Image
                    source={require('../../../../assets/user-account.png')}
                    style={{width: '100%', height: '60%', opacity: 0.8,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
            )
        }

        return (
            <View style={[
                styles.itemContainer,
                {backgroundColor: item.available ? '#81c784' : '#e57373'}]}>
                {image}
                <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                    <Text style={styles.itemName}>
                        {item.name.substring(0, 27)}
                    </Text>
                    <Text style={styles.itemCode}>#{item.squad_number}</Text>
                </View>
            </View>
        );
    };

   /* renderHeader = () => {

        return (
            <TouchableOpacity
                onPress={async () => {await this.markPresences();}}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    backgroundColor: 'rgba(173, 46, 83, 0.8)', //rgba(173, 46, 83, 0.8)
                    padding: 10,
                    marginHorizontal: 10,
                    marginVertical: 5,
                    borderRadius: 5
                }}>
                <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                    FECHAR CONVOCATÓRIA
                </Text>
                <Text style={{color: '#dedede', fontWeight: '400', textAlign: 'center'}}>
                    Serão registadas as presenças dos atletas disponíveis.
                </Text>
            </TouchableOpacity>
        );
    };*/

    /**
     * Função que permite atualizar o conteúdo do componente.
     */
    onRefresh = () => {
        this.setState({
            isRefreshing: true,
            athletes: []
        }, async () => {

            await this.fetchData();
        });
    };

    render() {
        const list = [{
            name: 'Escalão',
            icon: 'md-shirt',
            subtitle: this.state.training.echelon[1],
        }, {
            name: 'Início',
            icon: 'md-time',
            subtitle: this.state.training.date + ' | ' + this.state.training.hours + 'h',
        }, {
            name: 'Local',
            icon: 'md-pin',
            subtitle: this.state.training.place[1],
        }, {
            name: 'Treinadores',
            icon: 'md-people',
            subtitle: this.state.coaches.join(', ')
        }, {
            name: 'Seccionistas',
            icon: 'md-clipboard',
            subtitle: this.state.secretaries.join(', ')
        }];

        if (this.state.training.canChangeAvailability)
            list.push({
                name: 'Disponibilidade',
                icon: 'md-list-box',
                //subtitle:
            });

        return (
            <View style={{flex: 1}}>
                { this.state.isLoading &&
                <View style={styles.loading} opacity={0.5}>
                    <ActivityIndicator size='large' color={colors.loadingColor} />
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
                        <FlatList
                            keyExtractor={item => item.name}
                            extraData = {this.state.checked}
                            data={list}
                            renderItem={this.renderItemOfList}
                            //ListHeaderComponent={this.renderHeader}
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
        elevation: 5
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
    odoo: state.odoo.odoo,
    trainingsList: state.openedTrainings.trainingsList
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainingInvitations);