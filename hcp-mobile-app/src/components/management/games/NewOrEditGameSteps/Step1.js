import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import {colors} from "../../../../styles/index.style";
import RNPickerSelect from 'react-native-picker-select';
import {
    setCompetitionID,
    setSeasonID,
    setOpponentID
} from "../../../../redux/actions/newOrEditGame";


class Step1 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            competition: false,
            season: false,
            team: false,
        }
    }

    async componentDidMount() {

        if(this.props.newOrEditGame.rawCompetitionID !== undefined)
            await this.setState({competition: true});

        if(this.props.newOrEditGame.rawSeasonID !== undefined)
            await this.setState({season: true});

        if(this.props.newOrEditGame.rawOpponentID !== undefined)
            await this.setState({team: true});

        if(this.state.competition && this.state.season && this.state.team)
            this.props.setStepDisabled(false);
    }

    isStepReady = () => {

        if(this.state.competition && this.state.season && this.state.team) {
            this.props.setStepDisabled(false);
        }
        else {
            this.props.setStepDisabled(true);
        }
    };

    handleCompetitionPicked = async (value) => {

        if(value !== null) {
            this.props.setCompetitionID(value);
            await this.setState({competition: true});
        }

        this.isStepReady();
    };

    handleSeasonPicked = async (value) => {

        if(value !== null) {
            this.props.setSeasonID(value);
            await this.setState({season: true});
        }

        this.isStepReady();
    };

    handleTeamPicked = async (value) => {

        if(value !== null) {
            this.props.setOpponentID(value);
            await this.setState({team: true});
        }

        this.isStepReady();
    };


    render() {

        const competitions = this.props.newOrEditGame.allCompetitions.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name,
            color: '#000'
        }));

        const seasons = this.props.newOrEditGame.allSeasons.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name,
            color: '#000'
        }));

        const teams = this.props.newOrEditGame.allTeams.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name,
            color: '#000'
        }));


        return (
            <React.Fragment>
                <Animatable.View style={{margin: 20}} animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Competição"
                            subtitle="Defina todos os campos."
                            left={(props) =>
                                <Ionicons name="md-trophy" size={20} color={'#000'} {...props} />
                            }
                        />
                        <Card.Content>
                            <View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.contentTitle}>Nome</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Selecione uma competição...',
                                                value: null,
                                                color: colors.darkGrayColor,
                                            }}
                                            items={competitions}
                                            onValueChange={this.handleCompetitionPicked.bind(this)}
                                            value={this.props.newOrEditGame.rawCompetitionID}
                                        />
                                    </View>
                                </View>
                                <View style={{marginTop: 15}}>
                                    <Text style={styles.contentTitle}>Época</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Selecione uma época...',
                                                value: null,
                                                color: colors.darkGrayColor,
                                            }}
                                            items={seasons}
                                            onValueChange={this.handleSeasonPicked.bind(this)}
                                            value={this.props.newOrEditGame.rawSeasonID}
                                        />
                                    </View>
                                </View>
                                <View style={{marginTop: 15}}>
                                    <Text style={styles.contentTitle}>Adversário</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Selecione uma equipa...',
                                                value: null,
                                                color: colors.darkGrayColor,
                                            }}
                                            items={teams}
                                            onValueChange={this.handleTeamPicked.bind(this)}
                                            value={this.props.newOrEditGame.rawOpponentID}
                                        />
                                    </View>
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
    }
});

Step1.propTypes = {
    setStepDisabled: PropTypes.func.isRequired
};

const mapStateToProps = state => ({

    newOrEditGame: state.newOrEditGame
});

const mapDispatchToProps = dispatch => ({
    setCompetitionID: (id) => {
        dispatch(setCompetitionID(id));
    },
    setSeasonID: (id) => {
        dispatch(setSeasonID(id));
    },
    setOpponentID: (id) => {
        dispatch(setOpponentID(id));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Step1);