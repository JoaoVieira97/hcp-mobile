import React, { Component } from 'react';

import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../CustomText";
import {Avatar, ListItem} from "react-native-elements";
import {colors} from "../../styles/index.style";


class AthleteInjuriesTypes extends Component {

    constructor(props) {
        super(props);

        this.state = {
            athleteId: "",
            athleteName: "",
            athleteImage: false,
            inDiagnosisCounter: 0,
            inTreatmentCounter: 0,
            treatedCounter: 0,
            inDiagnosis: [],
            inTreatment: [],
            treated: [],
            isLoading: true,
            isRefreshing: false
        }
    };

    /**
     * Define navigation properties.
     * @param navigation
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'LESÕES'}
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

    async componentWillMount() {

        await this.setState({
            athleteId: this.props.navigation.getParam('athleteId'),
            athleteName: this.props.navigation.getParam('athleteName'),
            athleteImage: this.props.navigation.getParam('athleteImage')
        });
    }

    async componentDidMount() {

        await this.fetchAthleteInjuriesNumber();

        this.setState({isLoading: false});
    }

    async fetchAthleteInjuriesNumber () {

        const params = {
            fields: [
                'id',
                'ocorreu_num',
                'treino', 'jogo', 'outro',
                'create_date', 'data_ocorrencia',
                'state'
            ],
            domain: [['atleta', 'in', [this.state.athleteId]]]
        };

        const response = await this.props.odoo.search_read('ges.lesao', params);
        if(response.success && response.data.length > 0) {

            let inDiagnosisCounter = 0, inTreatmentCounter = 0, treatedCounter = 0;
            let inDiagnosis = [], inTreatment = [], treated = [];

            response.data.forEach(item => {
                if(item.state === 'diagnostico') {
                    inDiagnosisCounter += 1;
                    inDiagnosis.push(item);
                }
                else if(item.state === 'tratamento') {
                    inTreatmentCounter += 1;
                    inTreatment.push(item);
                }
                else {
                    treatedCounter += 1;
                    treated.push(item);
                }
            });

            this.setState({
                inDiagnosisCounter: inDiagnosisCounter,
                inTreatmentCounter: inTreatmentCounter,
                treatedCounter: treatedCounter,
                inDiagnosis: inDiagnosis,
                inTreatment: inTreatment,
                treated: treated,
            });
        }
    }

    /**
     * Refresh screen.
     */
    handleRefresh = () => {
        this.setState({
                isRefreshing: true,
                isLoading: false
            },
            async () => {

                await this.fetchAthleteInjuriesNumber();

                this.setState({
                    isRefreshing: false
                });
            });
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.name}
                subtitle={item.subtitle}
                leftAvatar={
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 30,
                        width: 30
                    }}>
                        <Ionicons name={item.icon} size={27}/>
                    </View>
                }
                badge={{
                    value: item.value,
                    badgeStyle: {
                        backgroundColor: colors.gradient1
                    }
                }}
                chevron={true}
                disabled={item.value === 0}
                onPress={() => {

                    let injuriesList;
                    let type;
                    if(item.name === 'Em diagnóstico') {
                        injuriesList = this.state.inDiagnosis;
                        type = 'Em diagnóstico';
                    }
                    else if(item.name === 'Em tratamento') {
                        injuriesList = this.state.inTreatment;
                        type = 'Em tratamento';
                    }
                    else {
                        injuriesList = this.state.treated;
                        type = 'Tratadas';
                    }

                    this.props.navigation.navigate(
                        'ChildInjuriesScreen',
                        {
                            athleteId: this.state.athleteId,
                            type: type,
                            injuries: injuriesList
                        }
                    );
                }}
            />
        );
    };

    render() {

        const list = [{
            name: 'Em diagnóstico',
            icon: 'md-eye',
            subtitle: 'Lesões registadas e à espera de diagnóstico.',
            value: this.state.inDiagnosisCounter,
            onPress: 'NewTraining'
        }, {
            name: 'Em tratamento',
            icon: 'md-hand',
            subtitle: 'Lesões em processo de tratamento.',
            value: this.state.inTreatmentCounter,
            onPress: 'OpenedTrainings'
        }, {
            name: 'Tratadas',
            icon: 'md-done-all',
            subtitle: 'Lesões que já foram registadas como tratadas.',
            value: this.state.treatedCounter,
            onPress: 'PendingTrainings'
        }];

        let childImage;
        if(this.state.athleteImage !== false) {
            childImage = (
                <Avatar
                    size={65}
                    rounded
                    source={{uri: `data:image/png;base64,${this.state.athleteImage}`}}
                />
            );
        }
        else{
            childImage = (
                <Avatar
                    size={65}
                    rounded
                    source={require('../../../assets/user-account.png')}
                />
            )
        }

        return (
            <View style={styles.container}>
                <View style={styles.athleteContainer}>
                    {childImage}
                    <CustomText
                        style={{marginTop: 10}}
                        type={'bold'}
                        children={this.state.athleteName} />
                </View>
                <FlatList
                    keyExtractor={item => item.name}
                    data={list}
                    renderItem={this.renderItem}
                    refreshing={this.state.isRefreshing}
                    onRefresh={this.handleRefresh}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayColor,
    },
    athleteContainer: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        //shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteInjuriesTypes);