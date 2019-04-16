import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {ListItem} from 'react-native-elements';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";

import {setTrainings, addTrainings, clearAllTrainings} from "../../../redux/actions/openedTrainings";


class TrainingItem extends React.PureComponent {

    render() {

        const date_hour = this.props.training.display_start.split(' ');

        let color;
        switch (this.props.index % 2) {
            case 0:
                color = '#f4f4f4';
                break;
            default:
                color = '#fff';
                break;
        }

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700'}}>
                            {'Treino ' + this.props.training.escalao[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400'}}>
                            {date_hour[0]}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{color: '#919391'}}>
                                {this.props.training.local[1] + ' - '}
                            </Text>
                            <Text style={{color: '#919391'}}>
                                {date_hour[1].slice(0, -3) + 'h'}
                            </Text>
                        </View>
                        <Text style={{color: '#919391'}}>
                            {this.props.training.duracao + ' min'}
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={'md-hourglass'} size={28} />)}
                chevron
                containerStyle={{
                    backgroundColor: color
                }}
                onPress={() => {
                    this.props.navigation.navigate(
                        'OpenedTraining',
                        {id: this.props.training.id}
                    );
                }}
            />
        )
    }
}

class OpenedTrainings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
        };
    }

    async componentDidMount() {

        await this.fetchTrainings(20, true);
        /*
        this.willFocus = this.props.navigation.addListener('willFocus', () => {
            this.setState({
                trainingsList: [],
                lastIDFetched: false,
            }, async () => {
                await this.fetchTrainings();
            });
        });
        */
    }

    componentWillUnmount() {

        //this.willFocus.remove();
    }

    /**
     * Definir as opções da barra de navegação no topo.
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: //'Convocatórias em aberto',
            <CustomText
                type={'bold'}
                children={'CONVOCATÓRIAS EM ABERTO'}
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

    /**
     * Buscar treinos com convocatória em aberto.
     * O número de treinos retornados é menor ou igual ao limite apresentado.
     *
     * @param limit
     */
    async fetchTrainings(limit=20, clear=false) {

        if(clear) {
            await this.props.clearAllTrainings();
        }

        const idsFetched = this.props.trainingsList.map(training => {return training.id});
        const params = {
            domain: [
                //['display_start', '<=', '3000-01-01 24:00:00'],
                ['id', 'not in', idsFetched],
                ['state', '=', 'aberto']
            ],
            fields: ['id', 'display_start', 'local', 'escalao', 'duracao'],
            limit: limit,
            order: 'display_start DESC'
        };

        const response = await this.props.odoo.search_read('ges.treino', params);
        if (response.success) {

            if (response.data.length > 0) {

                //this.props.setTrainings(response.data);
                await this.props.addTrainings(response.data);
            }
        } else
            console.log("error");

        await this.setState({
            isLoading: false,
            isRefreshing: false
        });
    }

    /**
     * Função que trata de atualizar a lista dos treinos.
     */
    handleRefresh = () => {

        this.setState({
                isRefreshing: true,
                isLoading: false
            },
            async () => {
                await this.props.clearAllTrainings();
                await this.fetchTrainings();
            });
    };

    /**
     * Função que trata de adicionar, se existirem, treinos antigos.
     */
    handleMoreData = () => {
        this.setState({
                isLoading: true
            },
            async () => {
                await this.fetchTrainings();
            });
    };

    /**
     * Retorna o componente ActivityIndicator se estiver a fazer loading.
     */
    renderFooter = () => {

        if(this.state.isLoading) {

            return (
                <View style={{
                    paddingVertical: 20,
                }}>
                    <ActivityIndicator
                        size={'large'}
                        color={'#ced0ce'}
                    />
                </View>
            );
        }

        return null;
    };

    /**
     * Renderiza uma linha entre os items da lista.
     */
    renderSeparator = () => {
        return (
            <View style={{
                height: 0,
                width: '100%',
                backgroundColor: '#ced0ce',
            }}/>
        );
    };

    /**
     * Retorna o componente que representa um item da lista.
     * @param item
     */
    renderItem = ({ item, index }) => (
        <TrainingItem training={item} key={item.id} navigation={this.props.navigation} />
    );

    render() {

        return (
            <FlatList
                keyExtractor={item => item.id.toString()}
                data={this.props.trainingsList}
                renderItem={this.renderItem}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
                onEndReached={this.handleMoreData}
                onEndReachedThreshold={0.1}
                ItemSeparatorComponent={this.renderSeparator}
                ListFooterComponent={this.renderFooter}
            />
        );
    }
}



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    trainingsList: state.openedTrainings.trainingsList
});

const mapDispatchToProps = dispatch => ({

    setTrainings: (trainingsList) => {
        dispatch(setTrainings(trainingsList))
    },

    addTrainings: (trainingsList) => {
        dispatch(addTrainings(trainingsList))
    },

    clearAllTrainings: () => {
        dispatch(clearAllTrainings())
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainings);
