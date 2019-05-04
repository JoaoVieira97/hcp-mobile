import React, {Component} from 'react';

import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {connect} from "react-redux";
import {ListItem} from "react-native-elements";
import moment from 'moment';


// import styles from './styles';

class TrainingInvitations extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            trainings: [],
            date:'',
        };
    }

    async componentDidMount() {

        const date = moment().format();

        await this.setState({
            date: date,
        });

        await this.fetchTrainings(20);
    }

    async fetchTrainings(limit=20) {

        const athleteInfo = this.props.user.groups.filter(group => group.name === 'Atleta');

        const athleteId = athleteInfo[0].id;

        const params = {
            domain: [
                ['id','>=','0'],
                //[idAtleta,'in','atletas'], //NAO DÁ
            ],
            fields: ['id', 'atletas', 'display_start', 'local', 'escalao', 'duracao', 'convocatorias','treinador'],
            limit: limit,
            order: 'display_start DESC',
        };

        const response = await this.props.odoo.search_read('ges.treino', params);

        if (response.success && response.data.length > 0) {

            //Get athlete trainings (with previous athleteId)
            let athleteTrainings = response.data.filter(training => training.atletas.indexOf(athleteId) >= 0);
            //FALTA REDUX E FETCH MORE DATA!

            let trainings = [];

            athleteTrainings.forEach(item => {

                const splitItemDate =  item.display_start.split(/[ :-]/);
                const date = splitItemDate[2] + '/' + splitItemDate[1] + '/' + splitItemDate[0];
                const hours = splitItemDate[3] + ':' + splitItemDate[4];

                const isoItemDate = item.display_start.replace(" ","T");

                let canChangeAvailability = moment(isoItemDate).isAfter(this.state.date);

                const training = {
                    id: item.id,
                    place: item.local,
                    echelon: item.escalao,
                    duration: item.duracao,
                    date: date,
                    hours: hours,
                    athleteIds : item.atletas,
                    invitationIds: item.convocatorias,
                    coachIds: item.treinador,
                    canChangeAvailability: canChangeAvailability,
                };

                trainings.push(training);
            });


            this.setState(state => ({
                trainings: [...state.trainings, ...trainings]
            }));

            //LATER TO INDISPONIBILITY
           /*
            const idsInvitations = response.data[0].convocatorias;

            const params2 = {
                domain: [
                    ['id','in',idsInvitations],
                ],
                fields: [],
                //limit: 1,
            };

            const response2 = await this.props.odoo.search_read('ges.linha_convocatoria', params2);

            if (response2.success) console.log(response2);
            */
        }

        await this.setState({
            isLoading: false,
            isRefreshing: false
        });
    }

    static navigationOptions = {
        title: 'Treinos',
    };

    renderItem =  ({item, index}) => {

        let colorText = !item.canChangeAvailability? '#919391' : '#0d0d0d' ;
        let colorBackground = !item.canChangeAvailability? '#efefef' : '#fff';
        let iconName = !item.canChangeAvailability?  'md-done-all' : 'md-hourglass';
        let iconSize = !item.canChangeAvailability?  22 : 28;

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: colorText}}>
                            {'Treino ' + item.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {item.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{color: '#919391'}}>
                                {item.place[1] + ' - ' + item.hours + 'h'}
                            </Text>
                        </View>
                        <Text style={{color: '#919391'}}>
                            {item.duration + ' min'}
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={iconName} size={iconSize} color={colorText} />)}
                chevron
                containerStyle={{
                    backgroundColor: colorBackground
                }}
                onPress={() => { this.props.navigation.navigate('OpenedTrainingInvitations', {training: item})}}
                //disabled = {disabled}
            />
        )
    };

    handleMoreData = () => {
        this.setState({
                isLoading: true
            },
            async () => {
                await this.fetchTrainings();
            });
    };

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


    renderSeparator = () => (
        <View style={{
            height: 1,
            width: '100%',
            backgroundColor: '#ced0ce',
        }}/>
    );


    handleRefresh = () => {
        this.setState({
                trainings: [],
                isRefreshing: true,
                isLoading: false
            },
            async () => {
                await this.fetchTrainings(20);
            });
    };

    render() {

        return (
            <FlatList
                keyExtractor={item => item.id.toString()}
                data={this.state.trainings}
                renderItem={this.renderItem}
                ItemSeparatorComponent={this.renderSeparator}
                //ListHeaderComponent={this.renderHeader}
                //onEndReached={this.handleMoreData}
                //onEndReachedThreshold={0.1}
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

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(TrainingInvitations);

