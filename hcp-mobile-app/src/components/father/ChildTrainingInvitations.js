import React, {Component} from 'react';

import {View, Text, FlatList, ActivityIndicator, TouchableOpacity} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {connect} from "react-redux";
import {ListItem} from "react-native-elements";
import moment from 'moment';
//import {colors} from "../../styles/index.style";

import ConvertTime  from '../ConvertTime';
import CustomText from "../athletes/injuries/AthleteInjuriesTypes";

/*
class TrainingItem extends React.PureComponent {

    render() {

        const training = this.props.training;

        const colorText = training.isOver ? '#919391' : '#0d0d0d' ;
        const colorBackground = training.isOver ? colors.lightGrayColor : '#fff';
        const iconName = training.isOver ?  'md-done-all' : 'md-hourglass';
        const iconSize = training.isOver ?  22 : 28;

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
*/

class ChildTrainingInvitations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            trainings: [],
            date: '',
            child: {},
        };
    }
/*
    async componentDidMount() {

        const date = moment().format();
        await this.setState({date: date});

        // fetch data
        await this.fetchTrainings(20);

        await this.setState({isLoading: false});
    }
*/
    /**
     * Define navigator name.
     */
    /*static navigationOptions = {
        title: 'Treinos',
    };*/

    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'CONVOCATÓRIAS'}
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
        title: 'Treinos',
    });

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
                fields: ['id', 'evento_desportivo', 'atletas', 'display_start', 'local', 'escalao', 'duracao', 'convocatorias','treinador', 'seccionistas', 'state'],
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

                    let canChangeAvailability;
                    let isOver;

                    if(!moment(convertTime.getDate()).isAfter(this.state.date)){
                        isOver = true;
                        canChangeAvailability = false;
                    }
                    else if(item.state === 'convocatorias_fechadas' ||
                        item.state === 'fechado'){

                        isOver = false;
                        canChangeAvailability = false;
                    }
                    else {
                        isOver = false;
                        canChangeAvailability = true;
                    }

                    /**
                     diff = difference in ms between actual date and game's date
                     oneDay = one day in ms
                     gameDayMidNight = gameDay + '00:00:00' -> To verify Hoje or Amanha
                     twoDaysLimit = actualDate + 2 days + '00:00:00' -> To verify Amanha
                     (se a data do jogo nao atual ultrapassar estes 2 dias de limite, data=Amanha)
                     */
                    let diff = moment(convertTime.getDate()).diff(moment(this.state.date));
                    let oneDay = 24 * 60 * 60 * 1000;
                    let gameDayMidNight = (convertTime.getDate().split('T'))[0] + 'T00:00:00';
                    let twoDaysLimit = (moment(this.state.date).add(2, 'days').format()
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
                        eventId: item.evento_desportivo[0],
                        place: item.local,
                        echelon: item.escalao,
                        duration: item.duracao,
                        date: date.date,
                        hours: date.hour,
                        state: item.state,
                        athleteIds : item.atletas,
                        invitationIds: item.convocatorias,
                        coachIds: item.treinador,
                        secretaryIds: item.seccionistas,
                        isOver: isOver,
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

        /*
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
        );*/
        return (
            <View>
                <Text> TREINO </Text>
            </View>
        )
    }
}

const mapStateToProps = state => ({

    user: state.user,
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChildTrainingInvitations);
