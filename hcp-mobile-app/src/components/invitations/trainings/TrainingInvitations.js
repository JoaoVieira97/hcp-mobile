import React, {Component} from 'react';

import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {connect} from "react-redux";
import {ListItem} from "react-native-elements";
import moment from 'moment';
import {colors} from "../../../styles/index.style";

import ConvertTime  from '../../ConvertTime';

class TrainingItem extends React.PureComponent {

    render() {

        const training = this.props.training;

        const colorText = !training.canChangeAvailability ? '#919391' : '#0d0d0d' ;
        const colorBackground = !training.canChangeAvailability ? colors.lightGrayColor : '#fff';
        const iconName = !training.canChangeAvailability ?  'md-done-all' : 'md-hourglass';
        const iconSize = !training.canChangeAvailability ?  22 : 28;

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: colorText}}>
                            {'Treino ' + training.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {training.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + training.hours}
                        </Text>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Duração: ' + training.duration + ' min'}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                training.place ?
                                    'Local: ' + training.place[1] :
                                    'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={iconName} size={iconSize} color={colorText} />)}
                chevron
                containerStyle={{
                    backgroundColor: colorBackground
                }}
                onPress={() => { this.props.navigation.navigate('OpenedTrainingInvitations', {training: training})}}
            />
        )
    }
}

class TrainingInvitations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            trainings: [],
            date: '',
        };
    }

    async componentDidMount() {

        const date = moment().format();
        await this.setState({date: date});

        // fetch data
        await this.fetchTrainings(20);

        await this.setState({isLoading: false});
    }

    /**
     * Define navigator name.
     */
    static navigationOptions = {
        title: 'Treinos',
    };

    /**
     * Fetch all opened trainings. Maximum of limit items.
     * @param limit
     * @param clear
     * @returns {Promise<void>}
     */
    async fetchTrainings(limit=20, clear=false) {

        if(clear) {
            await this.setState({trainings: []});
        }

        const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');
        if(athleteInfo) {

            const athleteId = athleteInfo[0].id;
            const idsFetched = this.state.trainings.map(training => {return training.id});

            const params = {
                domain: [
                    ['id', 'not in', idsFetched],
                    ['atletas', 'in', athleteId]
                ],
                fields: ['id', 'atletas', 'display_start', 'local', 'escalao', 'duracao', 'convocatorias','treinador', 'seccionistas'],
                limit: limit,
                order: 'display_start DESC',
            };

            const response = await this.props.odoo.search_read('ges.treino', params);
            if (response.success && response.data.length > 0) {

                let trainings = [];
                const convertTime = new ConvertTime();
                response.data.forEach(item => {

                    convertTime.setDate(item.display_start);
                    const date = convertTime.getTimeObject();

                    let canChangeAvailability = moment(convertTime.getDate()).isAfter(this.state.date);

                    const training = {
                        id: item.id,
                        place: item.local,
                        echelon: item.escalao,
                        duration: item.duracao,
                        date: date.date,
                        hours: date.hour,
                        athleteIds : item.atletas,
                        invitationIds: item.convocatorias,
                        coachIds: item.treinador,
                        secretaryIds: item.seccionistas,
                        canChangeAvailability: canChangeAvailability,
                    };

                    trainings.push(training);
                });

                this.setState(state => ({
                    trainings: [...state.trainings, ...trainings]
                }));
            }
        }
    }

    /**
     * PureComponent used for rendering items of FlatList.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem =  ({item, index}) => (
        <TrainingItem
            key={item.id + item.date}
            training={item}
            index={index}
            navigation={this.props.navigation} />
    );

    /**
     * Add more trainings if they exist.
     * @returns {Promise<void>}
     */
    handleMoreData = async () => {

        this.setState({isLoading: true});
        await this.fetchTrainings();
        this.setState({isLoading: false});
    };

    /**
     * Renders ActivityIndicator if is loading.
     * @returns {*}
     */
    renderFooter = () => {

        return (
            <View style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#ced0ce'
            }}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={'#ced0ce'}
                    />
                }
            </View>
        );
    };

    /**
     * Renders separator line.
     * @returns {*}
     */
    renderSeparator = () => (
        <View style={{
            height: 1,
            width: '100%',
            backgroundColor: '#ced0ce',
        }}/>
    );

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

    render() {

        return (
            <FlatList
                keyExtractor={item => item.id + item.date}
                data={this.state.trainings}
                renderItem={this.renderItem}
                ItemSeparatorComponent={this.renderSeparator}
                onEndReached={this.handleMoreData}
                onEndReachedThreshold={0.1}
                ListFooterComponent={this.renderFooter}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
            />
        );
    }
}

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TrainingInvitations);

