import React, { Component } from 'react';

import {FlatList, Picker, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { connect } from 'react-redux';
import * as Animatable from "react-native-animatable";
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import {
    addAthlete, addAthletes, addStepReady,
    removeAthlete,
    setAllEchelons,
    setAthletes,
    setEchelonId, setEchelonIsFetched, setStepReady
} from "../../../../redux/actions/newTraining";
import {Avatar, ListItem} from "react-native-elements";
import {colors} from "../../../../styles/index.style";
import Loader from "../../../screens/Loader";


class NewTrainingStep4 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            invalidEchelonId: -1,
        }
    }

    async componentDidMount() {

        // Add new step to redux store
        if(this.props.newTraining.isStepReady.length === 3)
            await this.props.addStepReady();

        this.setState({
            isLoading: false
        });
    }

    /**
     * Fetch echelon's athletes.
     * @returns {Promise<void>}
     */
    fetchAthletes = async (echelonId) => {

        const params = {
            fields: ['id', 'display_name', 'image', 'escalao', 'numerocamisola', 'posicao'],
            domain: [['escalao', '=', echelonId]],
            order:  'posicao DESC, numerocamisola ASC',
        };

        const response = await this.props.odoo.search_read('ges.atleta', params);
        if (response.success) {

            let athletes = [];
            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                const athleteInfo = response.data[i];
                const athlete = {
                    'id': athleteInfo.id,
                    'name': athleteInfo.display_name,
                    'image': athleteInfo.image,
                    'squad_number': athleteInfo.numerocamisola,
                    'echelonId': athleteInfo.escalao[0],
                    'echelonName': athleteInfo.escalao[1],
                    'position': athleteInfo.posicao,
                };

                athletes.push(athlete);
            }

            this.props.setAthletes(athletes);
        }
    };

    /**
     * Add athletes when user select echelon.
     * @param id
     * @returns {Promise<void>}
     */
    onEchelonSelect = async (id) => {

        if(id !== this.state.invalidEchelonId) {

            this.setState({isLoading: true});

            // Set echelon id
            this.props.setEchelonId(id);

            // remove current athletes
            // TODO: just clear athletes of old echelon
            await this.props.addAthletes([]);


            // fetch all athletes if needed
            const echelonsAux = this.props.newTraining.allEchelons.filter(item => item.id === id);
            if (echelonsAux.length > 0 && !echelonsAux[0].fetched) {
                await this.fetchAthletes(id);
                await this.props.setEchelonIsFetched(id)
            }

            // add athletes to redux store
            const athletesFiltered = this.props.newTraining.allAthletes.filter(item => item.echelonId === id);
            const athletesIds = athletesFiltered.map(item => item.id);
            await this.props.addAthletes(athletesIds);

            // step is ready
            this.props.setStepReady(true);

            this.setState({isLoading: false});

        } else {
            // REMOVE ALL ATHLETES from list
            await this.props.addAthletes([]);
        }
    };

    /**
     * When user removes a athlete.
     * @param id
     * @returns {Promise<void>}
     */
    onAthleteRemove = async (id) => {

        await this.props.removeAthlete(id);

        if(this.props.newTraining.athletes.length === 0)
            this.props.setStepReady(false);
        else if(!this.props.newTraining.isStepReady[this.props.newTraining.stepId])
            this.props.setStepReady(true);
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        const echelonsFiltered = this.props.newTraining.allAthletes.filter(athlete => athlete.id === item);
        if (echelonsFiltered.length > 0) {

            const athlete = echelonsFiltered[0];

            let athleteAvatar;
            if (athlete.image)
                athleteAvatar = (
                    <Avatar
                        rounded
                        source={{
                            uri: `data:image/png;base64,${athlete.image}`,
                        }}
                        size="small"
                    />
                );
            else
                athleteAvatar = (
                    <Avatar
                        rounded
                        source={require('../../../../../assets/user-account.png')}
                        size="small"
                    />
                );

            return (
                <ListItem
                    title={athlete.name}
                    subtitle={athlete.echelon}
                    leftAvatar={athleteAvatar}
                    rightAvatar={() => (
                        <TouchableOpacity
                            onPress={() => this.onAthleteRemove(item)}
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: 20,
                                width: 40,
                            }}>
                            <Ionicons name={"md-close"} size={26} color={colors.redColor}/>
                        </TouchableOpacity>
                    )}
                />
            );
        }
        return null;
    };

    render() {

        const allEchelons = this.props.newTraining.allEchelons.map(item =>
            <Picker.Item
                label={item.denomination}
                value={item.id}
                key={item.id} />
        );

        const pickerText= (
            <Picker.Item
                label={"Selecione um escalão"}
                value={this.state.invalidEchelonId}
                key={this.state.invalidEchelonId}
            />
        );
        const echelons = [pickerText, ...allEchelons];

        return (
            <View style={styles.container}>
                <Loader isLoading={this.state.isLoading}/>
                <Animatable.View animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Escalão e atletas"
                            subtitle="Defina os atletas a serem convocados."
                            left={(props) => <Ionicons name="md-done-all" size={20} color={'#000'} {...props}/>}
                        />
                        <Card.Content>
                            <View style={{marginTop: 10}}>
                                <Text style={{fontSize: 18, fontWeight: '400'}}>Escalão</Text>
                                <View style={{
                                    borderRadius: 5,
                                    backgroundColor: '#f2f2f2',
                                    justifyContent: 'center'
                                }}>
                                    <Picker
                                        selectedValue={this.props.newTraining.echelonId || this.state.invalidEchelonId}
                                        onValueChange={itemValue => (this.onEchelonSelect(itemValue))}
                                    >
                                        {echelons}
                                    </Picker>
                                </View>
                            </View>
                            <View style={{maxHeight: 200, marginTop: 20}}>
                                <Text style={{fontSize: 18, fontWeight: '400'}}>
                                    {
                                        (this.props.newTraining.athletes.length === 1) ?
                                            'Atletas (1 selecionado)':
                                            'Atletas (' + this.props.newTraining.athletes.length + ' selecionados)'
                                    }
                                </Text>
                                <ScrollView>
                                    <FlatList
                                        keyExtractor={item => item.toString()}
                                        data={this.props.newTraining.athletes}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Nenhum atleta adicionado.</Text>
                                        )}
                                    />
                                </ScrollView>
                            </View>
                        </Card.Content>
                    </Card>
                </Animatable.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user,
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({

    addStepReady: () => {
        dispatch(addStepReady())
    },
    setStepReady: (ready) => {
        dispatch(setStepReady(ready))
    },
    setEchelonIsFetched: (echelonId) => {
        dispatch(setEchelonIsFetched(echelonId))
    },
    setEchelonId: (echelonId) => {
        dispatch(setEchelonId(echelonId))
    },
    setAthletes: (allAthletes) => {
        dispatch(setAthletes(allAthletes))
    },
    addAthletes: (athletes) => {
        dispatch(addAthletes(athletes))
    },
    addAthlete: (athleteId) => {
        dispatch(addAthlete(athleteId))
    },
    removeAthlete: (athleteId) => {
        dispatch(removeAthlete(athleteId))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep4);