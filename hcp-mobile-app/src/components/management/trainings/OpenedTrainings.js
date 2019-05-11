import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {ListItem} from 'react-native-elements';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";
import {colors} from "../../../styles/index.style";
import ConvertTime from "../../ConvertTime";

class TrainingItem extends React.PureComponent {

    render() {

        const convertTime = new ConvertTime();
        convertTime.setDate(this.props.training.display_start);
        const date = convertTime.getTimeObject();

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700'}}>
                            {'Treino ' + this.props.training.escalao[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400'}}>
                            {date.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + date.hour}
                        </Text>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Duração: ' + this.props.training.duracao + ' min'}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                this.props.training.local ?
                                'Local: ' + this.props.training.local[1] :
                                'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={'md-hourglass'} size={28} />)}
                chevron
                containerStyle={{
                    backgroundColor: this.props.index % 2 === 0 ? colors.lightGrayColor : '#fff'
                }}
                onPress={() => {
                    this.props.navigation.navigate(
                        'OpenedTraining',
                        {training: this.props.training, removeTraining: (id) => this.props.removeTraining(id)}
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
            trainingsList: [],
        };
    }

    async componentDidMount() {

        // fetch all trainings, max 20
        await this.fetchTrainings(20, true);
        await this.setState({isLoading: false});

        /*
        this.willFocus = this.props.navigation.addListener('willFocus', () => {
            this.setState({
                trainingsList: [],
                lastIDFetched: false,
            }, async () => {
                await this.fetchTrainings();
            });
        });

        componentWillUnmount() {

        //this.willFocus.remove();
    }
        */
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
     * Fetch all opened trainings. Maximum of limit items.
     * @param limit
     * @param clear
     * @returns {Promise<void>}
     */
    async fetchTrainings(limit=20, clear=false) {

        if(clear) {
            await this.setState({trainingsList: []});
        }

        const idsFetched = this.state.trainingsList.map(training => {return training.id});
        const params = {
            domain: [
                ['id', 'not in', idsFetched],
                ['state', '=', 'aberto']
            ],
            fields: ['id', 'display_start', 'local', 'escalao', 'duracao'],
            limit: limit,
            order: 'display_start DESC'
        };

        const response = await this.props.odoo.search_read('ges.treino', params);
        if (response.success && response.data.length > 0) {

            await this.setState(state => ({
                trainingsList: [...state.trainingsList, ...response.data]
            }));
        }
    }

    /**
     * Remove training from current list when user change training state.
     * @param trainingId
     */
    removeTraining(trainingId) {

        const trainingsListAux = this.state.trainingsList.filter(item => item.id !== trainingId);
        this.setState({trainingsList: trainingsListAux});
    }

    /**
     * When user refresh current screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        this.setState({isRefreshing: true, isLoading: false});

        // fetch all trainings and clear current list
        await this.fetchTrainings(20, true);

        this.setState({isRefreshing: false});
    };

    /**
     * Add more trainings if they exist.
     * @returns {Promise<void>}
     */
    handleMoreData = async () => {

        this.setState({isLoading: true});

        // fetch more trainings
        await this.fetchTrainings();

        this.setState({isLoading: false});
    };

    /**
     * Renders ActivityIndicator if is loading.
     * @returns {*}
     */
    renderFooter = () => {

        return (
            <View style={{paddingVertical: 20}}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={colors.loadingColor}
                    />
                }
            </View>
        );
    };

    /**
     * PureComponent used for rendering items of FlatList.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem = ({ item, index }) => (
        <TrainingItem
            key={item.id + item.escalao}
            training={item}
            index={index}
            removeTraining={(id) => this.removeTraining(id)}
            navigation={this.props.navigation} />
    );

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
                ListFooterComponent={this.renderFooter.bind(this)}
            />
        );
    }
}



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainings);
