import React, { Component } from 'react';

import { connect } from 'react-redux';
import CustomText from "../../CustomText";
import {ActivityIndicator, FlatList, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import ConvertTime from "../../ConvertTime";
import {colors} from "../../../styles/index.style";
import ManagementListItem from "../ManagementListItem";


class ClosedTrainings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            trainingsList: [],
            isFetching: false
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
                children={'TREINOS FECHADOS'}
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

        if(!this.state.isFetching) {

            this.setState({isFetching: true});

            if(clear) {
                await this.setState({trainingsList: []});
            }

            const idsFetched = this.state.trainingsList.map(training => {return training.id});
            const params = {
                domain: [
                    ['id', 'not in', idsFetched],
                    ['state', '=', 'fechado']
                ],
                fields: ['id', 'atletas', 'display_start', 'local', 'escalao', 'duracao', 'convocatorias','treinador', 'seccionistas'],
                limit: limit,
                order: 'display_start DESC'
            };

            const response = await this.props.odoo.search_read('ges.treino', params);
            if (response.success && response.data.length > 0) {

                let trainings = [];
                const convertTime = new ConvertTime();
                response.data.forEach(item => {

                    convertTime.setDate(item.display_start);
                    const date = convertTime.getTimeObject();

                    const training = {
                        id: item.id,
                        local: item.local,
                        echelon: item.escalao,
                        duration: item.duracao,
                        date: date.date,
                        hour: date.hour,
                        invitationIds: item.convocatorias,
                        athleteIds : item.atletas,
                        coachIds: item.treinador,
                        secretaryIds: item.seccionistas,
                    };

                    trainings.push(training);
                });

                this.setState(state => ({
                    trainingsList: [...state.trainingsList, ...trainings]
                }));
            }

            this.setState({isFetching: false});
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
        <ManagementListItem
            item={item}
            index={index}
            titleType={'Treino '}
            navigateToFunction={() => {

                /*
                this.props.navigation.navigate(
                    'PendingTraining',
                    {
                        training: item,
                        //removeTraining: (id) => this.removeTraining(id)
                    }
                );
                 */
            }} />
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

export default connect(mapStateToProps, mapDispatchToProps)(ClosedTrainings);