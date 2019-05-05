import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator, Text, TouchableOpacity} from 'react-native';
import {ListItem} from 'react-native-elements';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";
import {colors} from "../../../styles/index.style";

class TrainingItem extends React.PureComponent {

    render() {

        const date_hour = this.props.training.display_start.split(' ');
        const date =
            date_hour[0].slice(8,10) + '/' +
            date_hour[0].slice(5,7) + '/' +
            date_hour[0].slice(0,4);

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700'}}>
                            {'Treino ' + this.props.training.escalao[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400'}}>
                            {date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {
                                'Início às ' + date_hour[1].slice(0, -3) + 'h' +
                                ' com duração de ' + this.props.training.duracao + ' min'
                            }
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                this.props.training.local ?
                                    this.props.training.local[1] : 'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={'md-hourglass'} size={28} />)}
                chevron
                containerStyle={{
                    backgroundColor: this.props.index % 2 === 0 ? colors.lightGrayColor : '#fff'
                }}
            />
        )
    }
}

class PendingTrainings extends Component {

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
                children={'CONVOCATÓRIAS FECHADAS'}
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
     * Fetch all pending trainings. Maximum of limit items.
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
                ['state', '=', 'convocatorias_fechadas']
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
        <TrainingItem key={item.id + item.escalao} training={item} index={index} navigation={this.props.navigation} />
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
