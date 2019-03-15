import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator, Text} from 'react-native';
import {ListItem} from 'react-native-elements';

import {connect} from 'react-redux';
import {Ionicons, MaterialIcons} from "@expo/vector-icons";


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
                            {this.props.training.escalao[1] + ' | '}
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
            />
        )
    }
}

class PendingTrainings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            trainingsList: [],
            lastIDFetched: false,
            isLoading: true,
            isRefreshing: false,
        };
    }

    componentDidMount() {

        this.willFocus = this.props.navigation.addListener('willFocus', () => {
            this.fetchTrainings();
        });
    }

    componentWillUnmount() {

        this.willFocus.remove();
    }

    /**
     * Buscar treinos com convocatória fechadas.
     * O número de treinos retornados é menor ou igual ao limite apresentado.
     *
     * @param limit
     */
    async fetchTrainings(limit=15) {

        const id = this.state.lastIDFetched ? this.state.lastIDFetched : 2147483647;
        const params = {
            domain: [
                ['id', '<', id.toString()],
                ['state', '=', 'convocatorias_fechadas']
            ],
            fields: ['id', 'display_start', 'local', 'escalao', 'duracao'],
            limit: limit,
            order: 'id DESC'
        };

        const response = await this.props.odoo.search_read('ges.treino', params);
        if (response.success) {

            if (response.data.length > 0) {

                await this.setState({
                    trainingsList: [...this.state.trainingsList, ...response.data],
                    lastIDFetched: response.data[response.data.length-1].id
                });
            }
        }

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
                trainingsList: [],
                lastIDFetched: false,
                isRefreshing: true,
                isLoading: false
            },
            () => {
                this.fetchTrainings();
            });
    };

    /**
     * Função que trata de adicionar, se existirem, treinos antigos.
     */
    handleMoreData = () => {
        this.setState({
                isLoading: true
            },
            () => {
                this.fetchTrainings();
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
                    borderTopWidth: 1,
                    borderTopColor: '#ced0ce'
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
    renderItem = ({ item, index }) => (<TrainingItem training={item} index={index} />);

    render() {

        return (
            <FlatList
                keyExtractor={item => item.id.toString()}
                data={this.state.trainingsList}
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
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PendingTrainings);
