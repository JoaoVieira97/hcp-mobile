import React, {Component} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import {colors} from "../../../../styles/index.style";
import * as Animatable from "react-native-animatable";
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import {
    setEchelon,
    setAthletes,
    addAthlete,
    removeAthlete
} from "../../../../redux/actions/newOrEditTraining";
import {Avatar, ListItem} from "react-native-elements";


class Step4 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            echelon: false,
            athletes: false,
        }
    }

    async componentDidMount() {

        if(this.props.newOrEditTraining.rawEchelonID) {
            await this.setState({echelon: true});
        }
        if(this.props.newOrEditTraining.rawAthletesIDs.length > 0) {
            await this.setState({athletes: true});
        }

        this.isStepReady();
    }

    isStepReady = () => {

        if(this.state.echelon && this.state.athletes && this.props.newOrEditTraining.rawAthletesIDs.length > 0) {
            this.props.setStepDisabled(false);
        }
        else {
            this.props.setStepDisabled(true);
        }
    };

    handleEchelonPicked = async (value) => {

        if(value !== null) {

            this.props.setEchelon(value);
            await this.setState({echelon: true});

            const athletes = this.props.newOrEditTraining.allAthletes[value];
            if(athletes) {
                this.props.setAthletes(athletes.athletes.map(item => item.id));

                await this.setState({athletes: true});
            }
        }

        this.isStepReady();
    };

    handleRemoveAthlete = async (value) => {

        if(this.props.newOrEditTraining.rawAthletesIDs.length === 1){
            await this.setState({athletes: false});
            this.props.setEchelon(null);
        }

        this.props.removeAthlete(value);
        this.isStepReady();
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        let athletes = []; let echelonID;
        for (echelonID in this.props.newOrEditTraining.allAthletes) {
            athletes = [...athletes, ...this.props.newOrEditTraining.allAthletes[echelonID].athletes];
        }

        const athletesFiltered = athletes.filter(a => a.id === item);
        if (athletesFiltered.length > 0) {
            return (
                <ListItem
                    title={athletesFiltered[0].name}
                    subtitle={athletesFiltered[0].echelon}
                    leftAvatar={() => {
                        if(athletesFiltered[0].image){
                            return (
                                <Avatar
                                    rounded
                                    source={{
                                        uri: `data:image/png;base64,${athletesFiltered[0].image}`,
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
                                await this.handleRemoveAthlete(item);
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
            )
        }

        return null;
    };

    render() {

        const echelons = this.props.newOrEditTraining.allEchelons.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name
        }));

        let firstTitle;
        const size = this.props.newOrEditTraining.rawAthletesIDs.length;
        if (size === 1)
            firstTitle = (
                <Text style={{fontSize: 18, fontWeight: '400'}}>
                    {'1 selecionado'}
                </Text>
            );
        else {
            firstTitle = (
                <Text style={{fontSize: 18, fontWeight: '400'}}>
                    {size + ' selecionados'}
                </Text>
            );
        }

        return (
            <React.Fragment>
                <Animatable.View style={{margin: 20}} animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Atletas"
                            subtitle="Adicione atletas a este treino."
                            left={(props) =>
                                <Ionicons name="md-done-all" size={20} color={'#000'} {...props} />
                            }
                        />
                        <Card.Content>
                            <View>
                                <View>
                                    <Text style={styles.contentTitle}>Escalão</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Selecione um escalão...',
                                                value: null,
                                                color: colors.darkGrayColor,
                                            }}
                                            items={echelons}
                                            onValueChange={this.handleEchelonPicked.bind(this)}
                                            value={this.props.newOrEditTraining.rawEchelonID}
                                        />
                                    </View>
                                </View>
                                <View style={{marginTop: 15}}>
                                    <TouchableOpacity
                                        //onPress={this.showDateTimeEndPicker.bind(this)}
                                        style={styles.buttonContainer}
                                    >
                                        <Text style={{fontSize: 16, textAlign: 'center'}}>ADICIONAR OUTROS ATLETAS</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#000',
                                    marginTop: 15
                                }}>
                                    {firstTitle}
                                    <FlatList
                                        keyExtractor={item => item.toString()}
                                        data={this.props.newOrEditTraining.rawAthletesIDs}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Nenhum atleta selecionado.</Text>
                                        )}
                                    />
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </Animatable.View>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    contentTitle: {
        fontSize: 18,
        fontWeight: '400',
        letterSpacing: 3
    },
    pickerContainer: {
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
    },
    buttonContainer: {
        borderRadius: 5,
        backgroundColor: colors.lightRedColor,
        padding: 15,
        justifyContent: 'center'
    }
});

Step4.propTypes = {
    setStepDisabled: PropTypes.func.isRequired
};

const mapStateToProps = state => ({

    newOrEditTraining: state.newOrEditTraining
});

const mapDispatchToProps = dispatch => ({
    setEchelon: (id) => {
        dispatch(setEchelon(id));
    },
    setAthletes: (ids) => {
        dispatch(setAthletes(ids))
    },
    addAthlete: (id) => {
        dispatch(addAthlete(id))
    },
    removeAthlete: (id) => {
        dispatch(removeAthlete(id))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Step4);