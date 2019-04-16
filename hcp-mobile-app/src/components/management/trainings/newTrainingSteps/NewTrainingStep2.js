import React, { Component } from 'react';
import {Picker, StyleSheet, Text, View, Alert, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";

import Loader from "../../../screens/Loader";
import {colors} from "../../../../styles/index.style";
import {
    addCoach,
    removeCoach,
    setAllCoaches
} from "../../../../redux/actions/newTraining";
import {Avatar, ListItem} from "react-native-elements";

class NewTrainingStep2 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            coachId: -1,
            invalidCoachId: -1, //used in Picker list
        };
    }

    async componentDidMount() {

        const coachInfo = this.props.user.groups.filter(item => item.name === 'Treinador');
        if(coachInfo.length > 0) {

            this.setState({
                isLoading: false,
                coachId: coachInfo[0].id
            });
        }
    }

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        const coachesFiltered = this.props.newTraining.allCoaches.filter(coach => coach.id === item);
        if (coachesFiltered.length > 0) {
            if(item !== this.state.invalidCoachId) {

                if(item !== this.state.coachId)
                    return (
                        <ListItem
                            title={coachesFiltered[0].display_name}
                            subtitle={coachesFiltered[0].email}
                            leftAvatar={() => {
                                if(coachesFiltered[0].image){
                                    return (
                                        <Avatar
                                            rounded
                                            source={{
                                                uri: `data:image/png;base64,${coachesFiltered[0].image}`,
                                            }}
                                            size="small"
                                        />
                                    );
                                }
                                else
                                    return (
                                        <Avatar
                                            rounded
                                            source={require('../../../../../assets/user-account.png')}
                                            size="small"
                                        />
                                    );
                            }}
                            rightAvatar={() => (
                                <TouchableOpacity
                                    onPress={() => {
                                        this.props.removeCoach(item);
                                    }}
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 20,
                                        width: 40,
                                    }}>
                                    <Ionicons name={"md-close"} size={26} color={colors.redText}/>
                                </TouchableOpacity>
                            )}
                        />
                    );
                else {
                    return (
                        <ListItem
                            disabled
                            title={coachesFiltered[0].display_name}
                            subtitle={coachesFiltered[0].email}
                            leftAvatar={() => {
                                if(coachesFiltered[0].image){
                                    return (
                                        <Avatar
                                            rounded
                                            source={{
                                                uri: `data:image/png;base64,${coachesFiltered[0].image}`,
                                            }}
                                            size="small"
                                        />
                                    );
                                }
                                else
                                    return (
                                        <Avatar
                                            rounded
                                            source={require('../../../../../assets/user-account.png')}
                                            size="small"
                                        />
                                    );
                            }}
                        />
                    );
                }
            }
        }

        return null;
    };

    /**
     * Add coach to the selected list.
     * @param id
     * @returns {Promise<void>}
     */
    onCoachSelect = async (id) => {

        this.props.addCoach(id);
    };

    render() {

        const allCoachesFiltered = this.props.newTraining.allCoaches.filter(item => item.visible);
        const allCoaches = allCoachesFiltered.map(item =>
            <Picker.Item label={item.display_name} value={item.id} key={item.id} />
        );

        const pickerText= (
            <Picker.Item
                label={"Selecione um treinador"}
                value={this.state.invalidCoachId}
                key={this.state.invalidCoachId}
            />
        );
        const coaches = [pickerText, ...allCoaches];

        let firstTitle;
        const coachesSelectedCount = this.props.newTraining.coaches.length;
        if (coachesSelectedCount === 1)
            firstTitle = (
                <Text style={{fontSize: 18, fontWeight: '400'}}>
                    {coachesSelectedCount + ' selecionado'}
                </Text>
            );
        else {
            firstTitle = (
                <Text style={{fontSize: 18, fontWeight: '400'}}>
                    {coachesSelectedCount + ' selecionados'}
                </Text>
            );
        }

        return (
            <View style={styles.container}>
                <Animatable.View animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Treinadores"
                            subtitle="Adicione treinadores a este treino."
                            left={(props) => <Ionicons name="md-contacts" size={20} color={'#000'} {...props}/>}
                        />
                        <Card.Content>
                            <View style={{
                                maxHeight: 200,
                                borderBottomWidth: 1,
                                borderBottomColor: '#000'
                            }}>
                                {firstTitle}
                                <ScrollView>
                                    <FlatList
                                        keyExtractor={item => item.toString()}
                                        data={this.props.newTraining.coaches}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Nenhum treinador selecionado.</Text>
                                        )}
                                    />
                                </ScrollView>
                            </View>
                            <View style={{marginTop: 30}}>
                                <Text style={{fontSize: 18, fontWeight: '400'}}>Adicionar</Text>
                                <View style={{
                                    borderRadius: 5,
                                    backgroundColor: '#f2f2f2',
                                    justifyContent: 'center'
                                }}>
                                    <Picker
                                        selectedValue={this.state.invalidCoachId}
                                        onValueChange={
                                            itemValue => (this.onCoachSelect(itemValue))
                                        }>
                                        {coaches}
                                    </Picker>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </Animatable.View>
                <Loader isLoading={this.state.isLoading}/>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user,
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({

    setAllCoaches: (coaches) => {
        dispatch(setAllCoaches(coaches))
    },
    addCoach: (coachId) => {
        dispatch(addCoach(coachId))
    },
    removeCoach: (coachId) => {
        dispatch(removeCoach(coachId))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep2);