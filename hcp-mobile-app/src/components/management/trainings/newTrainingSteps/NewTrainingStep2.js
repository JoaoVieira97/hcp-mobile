import React, { Component } from 'react';
import {Picker, StyleSheet, Text, View, Alert, FlatList, ScrollView, TouchableOpacity} from 'react-native';
import { connect } from 'react-redux';
import * as Animatable from 'react-native-animatable';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";

import Loader from "../../../screens/Loader";
import {colors} from "../../../../styles/index.style";
import {addSecretary, removeSecretary, setAllSecretaries} from "../../../../redux/actions/newTraining";
import {Avatar, ListItem} from "react-native-elements";

class NewTrainingStep2 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            invalidSecretaryId: -1, //used in Picker list
        };
    }

    async componentDidMount() {

        // Fetch all locals
        if(this.props.newTraining.allSecretaries.length === 0)
            await this.fetchAllSecretaries();

        this.setState({
            isLoading: false
        });
    }

    /**
     * Fetch all secretaries. (seccionistas)
     * @returns {Promise<void>}
     */
    fetchAllSecretaries = async () => {

        const  params = {
            fields: ['id', 'display_name', 'email'],
            order: 'display_name ASC'
        };

        const response = await this.props.odoo.search_read('ges.seccionista', params);
        if (response.success && response.data.length > 0) {

            const allSecretaries = response.data.map(item => (
                {
                    ...item,
                    visible: true
                }
            ));
            this.props.setAllSecretaries(allSecretaries);
        }
        else {
            this.setState({
                'isLoading': false
            }, () => {
                Alert.alert(
                    'Erro',
                    'Não existem seccionistas disponíveis.',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.goBack()},
                    ],
                    {cancelable: false},
                );
            });
        }
    };

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
                        leftAvatar={() => (
                            <Avatar
                                rounded
                                source={require('../../../../../assets/user-account.png')}
                                size="small"
                            />
                        )}
                        rightAvatar={() => (
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.removeSecretary(item);
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

        this.props.addSecretary(id);
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
                {
                    !this.state.isLoading &&
                    <Animatable.View animation={"fadeIn"}>
                        <Card elevation={6}>
                                <Card.Title
                                    title="Seccionistas"
                                    subtitle="Adicione pelo menos um seccionista a este treino."
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
                                                    <Text>Nenhum secretário selecionado.</Text>
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
                }
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
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({

    setAllSecretaries: (secretaries) => {
        dispatch(setAllSecretaries(secretaries))
    },
    addSecretary: (secretaryId) => {
        dispatch(addSecretary(secretaryId))
    },
    removeSecretary: (secretaryId) => {
        dispatch(removeSecretary(secretaryId))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewTrainingStep2);