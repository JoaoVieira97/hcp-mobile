import React, {Component} from 'react';

import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {addTrainings, clearAllTrainings, setTrainings} from "../../../redux/actions/openedTrainings";
import {connect} from "react-redux";
import {ListItem} from "react-native-elements";

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

        let date = new Date().getDate(); //Current Date
        let month = new Date().getMonth() + 1; //Current Month
        let year = new Date().getFullYear(); //Current Year
        let hours = new Date().getHours(); //Current Hours
        let min = new Date().getMinutes(); //Current Minutes
        let sec = new Date().getSeconds(); //Current Seconds

        await this.setState({
            date: date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec,
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
/*
            const params2 = {
                ids: [1],
                fields: ['name'],
            };

            const response2 = await this.props.odoo.get('ges.treinador', params2);

            console.log(response2);

            console.log(athleteTrainings[0].escalao);

            let primeirosAtletas = athleteTrainings[1].atletas;

            const params2 = {
                domain: [
                    ['id','in',primeirosAtletas],
                    //[idAtleta,'in','atletas'], //NAO DÁ
                ],
                fields: ['id', 'escalao', 'posicao'],
            };

            const response2 = await this.props.odoo.search_read('ges.atleta', params2);

            console.log("ATLETA:");
            console.log(response2);*/

            //FALTA REDUX E FETCH MORE DATA!

            this.setState(state => ({
                trainings: [...state.trainings, ...athleteTrainings]
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

        const splitItemDate =  item.display_start.split(/[ :-]/);

        const date = splitItemDate[2] + '/' + splitItemDate[1] + '/' + splitItemDate[0];
        const hours = splitItemDate[3] + ':' + splitItemDate[4];

        let itemYear = parseInt(splitItemDate[0],10) ;
        let itemMonth =  parseInt(splitItemDate[1],10) ;
        let itemDay = parseInt(splitItemDate[2],10) ;
        let itemHour =  parseInt(splitItemDate[3],10) ;
        let itemMinutes = parseInt(splitItemDate[4],10) ;
        let itemSeconds = parseInt(splitItemDate[5],10) ;

        let splitActualDate = this.state.date.split(/[ :/]/);

        let actualYear =  parseInt(splitActualDate[2],10) ;
        let actualMonth =  parseInt(splitActualDate[1],10) ;
        let actualDay =  parseInt(splitActualDate[0],10) ;
        let actualHour =  parseInt(splitActualDate[3],10) ;
        let actualMinutes =  parseInt(splitActualDate[4],10) ;
        let actualSeconds =  parseInt(splitActualDate[5],10) ;

        let itemDateBigger = true; // item's date is bigger

        if(actualYear > itemYear ) itemDateBigger = false;
        else if(actualYear == itemYear){

            if (actualMonth > itemMonth) itemDateBigger=false;
            else if(actualMonth == itemMonth){

                if (actualDay > itemDay) itemDateBigger=false;
                else if(actualDay == itemDay){

                    if(actualHour > itemHour) itemDateBigger=false;
                    else if(actualHour == itemHour){
                         if(actualMinutes> itemMinutes) itemDateBigger=false;
                         else if(actualMinutes== itemMinutes){
                            if(actualSeconds > itemSeconds) itemDateBigger=false;
                         }

                    }

                }

            }

        }

        let colorText = !itemDateBigger ? '#919391' : '#0d0d0d' ;
        let colorBackground = !itemDateBigger? '#efefef' : '#fff';
        let iconName = !itemDateBigger?  'md-done-all' : 'md-hourglass';
        let iconSize = !itemDateBigger?  22 : 28;

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: colorText}}>
                            {'Treino ' + item.escalao[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{color: '#919391'}}>
                                {item.local[1] + ' - '}
                            </Text>
                            <Text style={{color: '#919391'}}>
                                {hours + 'h'}
                            </Text>
                        </View>
                        <Text style={{color: '#919391'}}>
                            {item.duracao + ' min'}
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

export default connect(mapStateToProps, mapDispatchToProps)(TrainingInvitations);

