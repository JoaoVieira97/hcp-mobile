import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator} from 'react-native';
import moment from 'moment';
import {connect} from 'react-redux';
import {colors} from "../../../styles/index.style";
import ManagementListItem from "../ManagementListItem";
import ConvertTime from "../../ConvertTime";
import FabButton from "../FabButton";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";



class PendingTrainings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            stopFetching: false,
            isLoading: true,
            isRefreshing: false,
            trainingsList: [],
            isFetching: false,
            showFab: false,
        };
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'CONVOCATÓRIAS FECHADAS'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });

    async componentDidMount() {

        const date = moment().format();
        await this.setState({date: date});

        // fetch all trainings, max 20
        await this.fetchTrainings(20, true);
        await this.setState({isLoading: false});
    }

    /**
     * Fetch all pending trainings. Maximum of limit items.
     * @param limit
     * @param clear
     * @returns {Promise<void>}
     */
    async fetchTrainings(limit=20, clear=false) {

        this.setState({isFetching: true});

        if(clear) {
            await this.setState({trainingsList: []});
        }

        const idsFetched = this.state.trainingsList.map(training => {return training.id});
        const params = {
            domain: [
                ['id', 'not in', idsFetched],
                ['state', '=', 'convocatorias_fechadas']
            ],
            fields: [
                'id', 'atletas', 'display_start', 'local',
                'escalao', 'duracao',
                'convocatorias', 'presencas',
                'treinador', 'seccionistas'
            ],
            limit: limit,
            order: 'display_start DESC'
        };

        const response = await this.props.odoo.search_read('ges.treino', params);
        if (response.success && response.data.length > 0) {

            if(response.data.length < limit)
                this.setState({stopFetching: true});

            let trainings = [];
            const convertTime = new ConvertTime();
            response.data.forEach(item => {

                convertTime.setDate(item.display_start);
                const date = convertTime.getTimeObject();

                /**
                 diff = difference in ms between actual date and training's date
                 oneDay = one day in ms
                 gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
                 twoDaysLimit = actualDate + 2 days + '00:00:00' -> To verify Amanha
                 (se a data do jogo nao atual ultrapassar estes 2 dias de limite, data=Amanha)
                 */
                const diff = moment(convertTime.getDate()).diff(moment(this.state.date));
                const oneDay = 24 * 60 * 60 * 1000;
                const gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';
                const twoDaysLimit = (moment(this.state.date).add(2, 'days').format()
                    .split('T'))[0] + 'T00:00:00';

                if(diff >=0){
                    if(diff < oneDay) {
                        if(moment(this.state.date).isAfter(gameDayMidNight)) date.date = 'Hoje';
                        else date.date = 'Amanhã';
                    }
                    else if(diff < 2*oneDay && !moment(convertTime.getDate()).isAfter(twoDaysLimit)) {
                        date.date = 'Amanhã';
                    }
                }

                const training = {
                    id: item.id,
                    local: item.local,
                    echelon: item.escalao,
                    duration: item.duracao,
                    date: date.date,
                    hour: date.hour,
                    invitationIds: item.convocatorias,
                    availabilityIds: item.presencas,
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

        this.setState({isRefreshing: true, isLoading: false, stopFetching: false});

        // fetch all trainings and clear current list
        await this.fetchTrainings(20, true);

        this.setState({isRefreshing: false});
    };

    /**
     * Add more trainings if they exist.
     * @returns {Promise<void>}
     */
    handleMoreData = async () => {

        if(!this.state.isFetching && !this.state.stopFetching) {
            this.setState({isLoading: true});

            // fetch more trainings
            await this.fetchTrainings();

            this.setState({isLoading: false});
        }
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

                this.props.navigation.navigate(
                    'PendingTraining',
                    {
                        training: item,
                        removeTraining: (id) => this.removeTraining(id)
                    }
                );
            }} />
    );

    /**
     * Check if we need to show the fab.
     * @param event
     */
    handleScroll = (event) => {

        if (event.nativeEvent.contentOffset.y > 250) {
            this.setState({showFab: true});
        }
        else
            this.setState({showFab: false});
    };

    render() {

        return (
            <View>
                <FlatList
                    ref={(ref) => { this.flatListRef = ref; }}
                    onScroll={this.handleScroll}
                    keyExtractor={item => item.id.toString()}
                    data={this.state.trainingsList}
                    renderItem={this.renderItem}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                    onEndReached={this.handleMoreData}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={this.renderFooter.bind(this)}
                />
                {
                    this.state.showFab &&
                    <FabButton flatListRef={this.flatListRef}/>
                }
            </View>
        );
    }
}



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PendingTrainings);
