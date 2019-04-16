import React from 'react';

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
import { ListItem } from 'react-native-elements';
import CustomText from "../../CustomText";
import { DangerZone } from 'expo';
const { Lottie } = DangerZone;

import {removeTraining} from "../../../redux/actions/openedTrainings";
import {colors} from "../../../styles/index.style";

class OpenedTraining extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            animation: false,
            training: {},
            coaches: ['A carregar...'],
            athletes: [],
        }
    }

    componentWillMount() {

        const training = this.props.trainingsList.find(
            training => training.id === this.props.navigation.getParam('id')
        );

        this.setState({
            training: training
        });
    }

    async componentDidMount() {

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

    /**
     * Buscar todos os dados necessários sobre o treino.
     */
    async fetchData() {

        let params = {
            ids: [this.state.training.id],
            fields: [
                'treinador',
                'convocatorias'
            ],
        };

        const response = await this.props.odoo.get('ges.treino', params);
        if (response.success && response.data.length > 0) {

            await this.fetchAthletes(response.data[0].convocatorias);
            await this.fetchCoaches(response.data[0].treinador);

            await this.setState({
                isLoading: false,
                isRefreshing: false
            });
        }
    }

    /**
     * Buscar os atletas que foram convocados, bem como a sua disponibilidade.
     * @param ids
     */
    async fetchAthletes(ids) {

        const params = {
            ids: ids,
            fields: [
                'atleta',
                'disponivel',
                'numero'
            ],
        };

        const response = await this.props.odoo.get('ges.linha_convocatoria', params);
        if(response.success && response.data.length > 0) {

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
                    image: image.image
                };

                athletes.push(athlete);
            });

            this.setState(state => ({
                athletes: [...state.athletes, ...athletes]
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

    /**
     * Registar presenças.
     */
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

                        /*
                        await this.props.removeTraining(this.state.training.id);
                        await this.setState({animation: true});
                        this.animation.play();

                        setTimeout(() => {
                            this.props.navigation.goBack();
                        }, 1100);
                         */
                    }
                },
            ],
            {cancelable: true},
        );
    }

    /**
     * Renderizar o item da lista presente no header.
     * @param {Object} item
     */
    renderItemOfList = ({ item }) => (
        <ListItem
            title={item.name}
            subtitle={item.subtitle}
            leftAvatar={
                <View style={{width: 25}}>
                    <Ionicons name={item.icon} size={27} /*style={{paddingBottom: 5}}*/ />
                </View>
            }
            containerStyle={{
                backgroundColor: '#ffe3e4',
                height: 60,
            }}
        />
    );

    /**
     * Renderizar o item dos atletas convocados.
     * @param {Object} item
     */
    renderItem = ({item}) => {

        if(item.image) {
            return (
                <View style={[
                    styles.itemContainer,
                    {backgroundColor: item.available ? '#81c784' : '#e57373'}]}>
                    <Image
                        source={{uri: `data:image/png;base64,${item.image}`}}
                        style={{width: '100%', height: '60%', opacity: 1,
                            borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                    </Image>
                    <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                        <Text style={styles.itemName}>
                            {item.name.substring(0, 27)}
                        </Text>
                        <Text style={styles.itemCode}>#{item.squad_number}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View style={[
                styles.itemContainer,
                {backgroundColor: item.available ? '#81c784' : '#e57373'}]}>
                <Image
                    source={require('../../../../assets/user-account.png')}
                    style={{width: '100%', height: '60%', opacity: 0.8,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
                <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                    <Text style={styles.itemName}>
                        {item.name.substring(0, 27)}
                    </Text>
                    <Text style={styles.itemCode}>#{item.squad_number}</Text>
                </View>
            </View>
        );
    };

    renderHeader = () => {

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
                <Text style={{color: '#dedede', fontWeight: '400'}}>
                    Serão registadas as presenças dos atletas disponíveis.
                </Text>
            </TouchableOpacity>
        );
    };

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
            subtitle: this.state.training.escalao[1],
        }, {
            name: 'Início',
            icon: 'md-time',
            subtitle: this.state.training.display_start,
        }, {
            name: 'Local',
            icon: 'md-pin',
            subtitle: this.state.training.local[1],
        }, {
            name: 'Treinadores',
            icon: 'md-people',
            subtitle: this.state.coaches.join(', ')
        }];

        return (
            <View style={{flex: 1}}>
                { this.state.isLoading &&
                    <View style={styles.loading} opacity={0.5}>
                        <ActivityIndicator size='large' color={colors.loadingColor} />
                    </View>
                }
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
                        <FlatList
                            keyExtractor={item => item.name}
                            data={list}
                            renderItem={this.renderItemOfList}
                            ListHeaderComponent={this.renderHeader}
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

    odoo: state.odoo.odoo,
    trainingsList: state.openedTrainings.trainingsList
});

const mapDispatchToProps = dispatch => ({

    removeTraining: (trainingsList) => {
        dispatch(removeTraining(trainingsList))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTraining);