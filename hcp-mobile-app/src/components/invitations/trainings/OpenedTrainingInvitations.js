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

import {removeTraining} from "../../../redux/actions/openedTrainings";
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
                canChangeAvailability: undefined,
            },
            coaches: [], //dando ids de treinadores do treino, para buscar o nome
            athletes: [], //dando ids de atletas do treino, para buscar o nomes, numero e disponibilidade
            checked: undefined, //verificar checkbox
            idInvitation: undefined, //para mudar a disponibilidade na convocatoria deste atleta
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
                'id',
                'atleta',
                'disponivel',
                'numero'
            ],
            order: 'numero ASC',
        };

        const response = await this.props.odoo.search_read('ges.linha_convocatoria', params);

        if(response.success && response.data.length > 0) {

            console.log(response);

            const data = response.data;
            const ids = data.map(athlete => {return athlete.atleta[0]});

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
                    idInvitation: item.id,
                };

                athletes.push(athlete);
            });

            //VER ISTO DEPOIS!
            const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
            const athleteId = athleteInfo[0].id;

            const checked = (athletes.filter(athlete => athlete.id === athleteId))[0].available;
            const idInvitation = (athletes.filter(athlete => athlete.id === athleteId))[0].idInvitation;

            this.setState(state => ({
                athletes: [...state.athletes, ...athletes],
                checked: checked,
                idInvitation: idInvitation,
            }));

            console.log("CHECKEDSTATE "+this.state.checked);
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

    /**
     * Registar presenças.
     */
    /*
    async markPresences() {

        Alert.alert(
            'Confirmação',
            'Pretende fechar o período de convocatórias para este treino?',
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Confirmar',
                    onPress: async () => {

                        const params = {
                            kwargs: {
                                context: this.props.odoo.context,
                            },
                            model: 'ges.treino',
                            method: 'marcar_presencas',
                            args: [this.state.training.id]
                        };

                        const response = await this.props.odoo.rpc_call(
                            '/web/dataset/call_kw',
                            params
                        );

                        if (response.success) {

                            await this.props.removeTraining(this.state.training.id);
                            await this.setState({animation: true});
                            this.animation.play();

                            setTimeout(() => {
                                this.props.navigation.goBack();
                            }, 1100);
                        }

                       }
                },
            ],
            {cancelable: true},
        );
    }*/


    /**
     * Mudar disponibilidade atual. 
     */
    async changeAvailability(){

        this.setState({isLoading: true,});

        const fields = {
            'disponivel': !this.state.checked,
        };
        const response = await this.props.odoo.update('ges.linha_convocatoria', [this.state.idInvitation], fields);

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

    /**
     * Renderizar o item da lista presente no header.
     * @param {Object} item
     */
    renderItemOfList = ({ item }) => {

        let chevron = false;
        let checkbox;
        let arrow;

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

        if (item.name === 'Local') {
            //chevron = true;
            arrow = (
                <View style={{width: 25}}>
                    <Ionicons name={'ios-arrow-forward'} size={24} color={'#919391'}/>
                </View>
            )
        }

        /*if (item.name === 'Disponibilidade') {
            return (
                <ListItem
                    title={item.name}
                    subtitle={item.subtitle}
                    leftAvatar={
                        <View style={{width: 25}}>
                            <Ionicons name={item.icon} size={27} />
                        </View>
                    }
                    chevron={chevron}
                    containerStyle={{
                        backgroundColor: '#ffe3e4',
                        height: 60,
                    }}
                    rightElement={
                        //<View style={{width: 25}}>
                            <CheckBox
                                iconRight
                                checked={this.state.checked}
                                onPress={() => this.changeAvailability()}
                                size = {30}
                                containerStyle={{ marginRight: 20, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                                //iconType='material'
                                //checkedIcon='clear'
                                //uncheckedIcon='add'
                                checkedColor = {'#81c784'}
                                uncheckedColor = {'#e57373'}
                            />
                        //</View>
                    }
                />
                )
        }
        else if (item.name !== 'Disponibilidade'){
            return (
                <ListItem
                    title={item.name}
                    subtitle={item.subtitle}
                    leftAvatar={
                        <View style={{width: 25}}>
                            <Ionicons name={item.icon} size={27} />
                        </View>
                    }
                    chevron={chevron}
                    containerStyle={{
                        backgroundColor: '#ffe3e4',
                        height: 60,
                    }}
                />
            )
        }*/

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

    removeTraining: (trainingsList) => {
        dispatch(removeTraining(trainingsList))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainingInvitations);