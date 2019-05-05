import React, { Component } from 'react';
import {Picker, StyleSheet, Text, View, Alert, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";

import {colors} from "../../../../styles/index.style";
import {
    addSecretary,
    addSecretaryFlag, addStepReady,
    increaseStep,
    removeSecretary, setStepReady
} from "../../../../redux/actions/newTraining";
import {Avatar, ListItem} from "react-native-elements";

class NewTrainingStep3 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            invalidSecretaryId: -1, //used in Picker list
        };
    }

    async componentDidMount() {

        // Add new step to redux store
        if(this.props.newTraining.isStepReady.length === 2) {
            await this.props.addStepReady();
        }
    }

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        const secretariesFiltered = this.props.newTraining.allSecretaries.filter(sec => sec.id === item);
        if (secretariesFiltered.length > 0) {
            if(item !== this.state.invalidSecretaryId) {

                return (
                    <ListItem
                        title={secretariesFiltered[0].display_name}
                        subtitle={secretariesFiltered[0].email}
                        leftAvatar={() => {
                            if(secretariesFiltered[0].image){
                                return (
                                    <Avatar
                                        rounded
                                        source={{
                                            uri: `data:image/png;base64,${secretariesFiltered[0].image}`,
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
                                onPress={async () => {
                                    await this.onSecretaryRemove(item);
                                }}
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
        }

        return null;
    };

    /**
     * Add secretary to the selected list.
     * @param id
     * @returns {Promise<void>}
     */
    onSecretarySelect = async (id) => {

        await this.props.addSecretary(id);

        if (this.props.newTraining.secretaries.length > 0)
            this.props.setStepReady(true);
        else if(this.props.newTraining.isStepReady[this.props.newTraining.stepId])
            this.props.setStepReady(false);
    };

    /**
     * Remove secretary that was selected.
     * @param id
     * @returns {Promise<void>}
     */
    onSecretaryRemove = async (id) => {

        await this.props.removeSecretary(id);

        if (this.props.newTraining.secretaries.length === 0)
            this.props.setStepReady(false);
    };


    render() {

        const allSecretariesFiltered = this.props.newTraining.allSecretaries.filter(item => item.visible);
        const allSecretaries = allSecretariesFiltered.map(item =>
            <Picker.Item label={item.display_name} value={item.id} key={item.id} />
        );

        const pickerText= (
            <Picker.Item
                label={"Selecione um seccionista"}
                value={this.state.invalidSecretaryId}
                key={this.state.invalidSecretaryId}
            />
        );
        const secretaries = [pickerText, ...allSecretaries];

        let firstTitle;
        const secretariesSelectedCount = this.props.newTraining.secretaries.length;
        if (secretariesSelectedCount === 1)
            firstTitle = (
                <Text style={{fontSize: 18, fontWeight: '400'}}>
                    {secretariesSelectedCount + ' selecionado'}
                </Text>
            );
        else {
            firstTitle = (
                <Text style={{fontSize: 18, fontWeight: '400'}}>
                    {secretariesSelectedCount + ' selecionados'}
                </Text>
            );
        }

        return (
            <View style={styles.container}>
                <Animatable.View animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Seccionistas"
                            subtitle="Adicione seccionistas a este treino."
                            left={(props) => <Ionicons name="md-clipboard" size={20} color={'#000'} {...props}/>}
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
                                        data={this.props.newTraining.secretaries}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Nenhum seccionista selecionado.</Text>
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
                                        selectedValue={this.state.invalidSecretaryId}
                                        onValueChange={
                                            itemValue => (this.onSecretarySelect(itemValue))
                                        }>
                                        {secretaries}
                                    </Picker>
                                </View>
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
        padding: 20
    },
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({

    addSecretary: (secretaryId) => {
        dispatch(addSecretary(secretaryId))
    },
    removeSecretary: (secretaryId) => {
        dispatch(removeSecretary(secretaryId))
    },
    increaseStep: () => {
        dispatch(increaseStep())
    },
    addSecretaryFlag: (flag) => {
        dispatch(addSecretaryFlag(flag))
    },
    addStepReady: () => {
        dispatch(addStepReady())
    },
    setStepReady: (ready) => {
        dispatch(setStepReady(ready))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep3);