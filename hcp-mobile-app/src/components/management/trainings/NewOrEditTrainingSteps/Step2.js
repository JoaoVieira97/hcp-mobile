import React, {Component} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import PropTypes from "prop-types";
import {connect} from 'react-redux';
import {colors} from "../../../../styles/index.style";
import * as Animatable from "react-native-animatable";
import {Card} from "react-native-paper";
import {Ionicons} from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import Loader from "../../../screens/Loader";
import {
    setAllCoaches,
    addCoach,
    removeCoach
} from "../../../../redux/actions/newOrEditTraining";
import {Avatar, ListItem} from "react-native-elements";



class Step2 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            coaches: false,
        }
    }

    componentDidMount() {

        if(this.props.newOrEditTraining.rawCoachesIDs.length > 0) {

            this.props.setStepDisabled(false);
            this.setState({coaches: true});

            const allCoaches = this.props.newOrEditTraining.allCoaches.map(item => {
                if(this.props.newOrEditTraining.rawCoachesIDs.includes(item.id)) {
                    item.visible = false;
                }
                return item;
            });
            this.props.setAllCoaches(allCoaches);
        }

        this.setState({isLoading: false});
    }

    isStepReady = () => {

        if(this.state.coaches) {
            this.props.setStepDisabled(false);
        }
        else {
            this.props.setStepDisabled(true);
        }
    };

    handleCoachPicked = async (value) => {

        if(value !== null) {
            this.props.addCoach(value);
            await this.setState({coaches: true});
        }

        this.isStepReady();
    };

    handleRemoveCoach = async (value) => {

        if(this.props.newOrEditTraining.rawCoachesIDs.length === 1){
            await this.setState({coaches: false});
        }

        this.props.removeCoach(value);
        this.isStepReady();
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        const coachesFiltered = this.props.newOrEditTraining.allCoaches.filter(coach => coach.id === item);
        if (coachesFiltered.length > 0) {
            return (
                <ListItem
                    title={coachesFiltered[0].name}
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
                            onPress={async () => {
                                await this.handleRemoveCoach(item);
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

        const coachesFiltered = this.props.newOrEditTraining.allCoaches.filter(item => item.visible);
        const coaches = coachesFiltered.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name,
            color: '#000'
        }));

        let firstTitle;
        const size = this.props.newOrEditTraining.rawCoachesIDs.length;
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
                <Loader isLoading={this.state.isLoading} />
                <Animatable.View style={{margin: 20}} animation={"fadeIn"}>
                    <Card elevation={6}>
                        <Card.Title
                            title="Treinadores"
                            subtitle="Adicione treinadores a este treino."
                            left={(props) =>
                                <Ionicons name="md-contacts" size={20} color={'#000'} {...props} />
                            }
                        />
                        <Card.Content>
                            <View>
                                <View style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#000'
                                }}>
                                    {firstTitle}
                                    <FlatList
                                        keyExtractor={item => item.toString()}
                                        data={this.props.newOrEditTraining.rawCoachesIDs}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Nenhum treinador selecionado.</Text>
                                        )}
                                    />
                                </View>
                                <View style={{marginTop: 15}}>
                                    <Text style={styles.contentTitle}>Adicionar</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Selecione um treinador...',
                                                value: null,
                                                color: colors.darkGrayColor,
                                            }}
                                            items={coaches}
                                            onValueChange={this.handleCoachPicked.bind(this)}
                                            value={null}
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

Step2.propTypes = {
    setStepDisabled: PropTypes.func.isRequired
};

const mapStateToProps = state => ({

    newOrEditTraining: state.newOrEditTraining
});

const mapDispatchToProps = dispatch => ({
    setAllCoaches: (allCoaches) => {
        dispatch(setAllCoaches(allCoaches))
    },
    addCoach: (id) => {
        dispatch(addCoach(id))
    },
    removeCoach: (id) => {
        dispatch(removeCoach(id))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Step2);