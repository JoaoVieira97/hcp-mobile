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
    setAllSecretaries,
    addSecretary,
    removeSecretary
} from "../../../../redux/actions/newOrEditTraining";
import {Avatar, ListItem} from "react-native-elements";



class Step3 extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            secretaries: true
            //secretaries: false,
        }
    }

    componentDidMount() {

        if(this.props.newOrEditTraining.rawSecretariesIDs.length > 0) {

            this.props.setStepDisabled(false);
            this.setState({secretaries: true});

            const allSecretaries = this.props.newOrEditTraining.allSecretaries.map(item => {
                if(this.props.newOrEditTraining.rawSecretariesIDs.includes(item.id)) {
                    item.visible = false;
                }
                return item;
            });
            this.props.setAllSecretaries(allSecretaries);
        }

        this.setState({isLoading: false});
    }

    isStepReady = () => {

        if(this.state.secretaries) {
            this.props.setStepDisabled(false);
        }
        else {
            this.props.setStepDisabled(true);
        }
    };

    handleSecretaryPicked = async (value) => {

        if(value !== null) {
            this.props.addSecretary(value);
            //await this.setState({secretaries: true});
        }

        this.isStepReady();
    };

    handleRemoveSecretary = async (value) => {

        /*
        if(this.props.newOrEditTraining.rawSecretariesIDs.length === 1){
            await this.setState({secretaries: false});
        }
         */

        this.props.removeSecretary(value);
        this.isStepReady();
    };

    /**
     * Render list item.
     * @param {Object} item
     */
    renderItem = ({ item }) => {

        const secretariesFiltered = this.props.newOrEditTraining.allSecretaries.filter(secretary => secretary.id === item);
        if (secretariesFiltered.length > 0) {
            return (
                <ListItem
                    title={secretariesFiltered[0].name}
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
                                await this.handleRemoveSecretary(item);
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

        const secretariesFiltered = this.props.newOrEditTraining.allSecretaries.filter(item => item.visible);
        const secretaries = secretariesFiltered.map(item => ({
            label: item.name,
            value: item.id,
            key: item.id + item.name
        }));

        let firstTitle;
        const size = this.props.newOrEditTraining.rawSecretariesIDs.length;
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
                            title="Seccionistas"
                            subtitle="Adicione seccionistas a este treino."
                            left={(props) =>
                                <Ionicons name="md-clipboard" size={20} color={'#000'} {...props} />
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
                                        data={this.props.newOrEditTraining.rawSecretariesIDs}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={() => (
                                            <Text>Nenhum seccionista selecionado.</Text>
                                        )}
                                    />
                                </View>
                                <View style={{marginTop: 15}}>
                                    <Text style={styles.contentTitle}>Adicionar</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            placeholder={{
                                                label: 'Selecione um seccionista...',
                                                value: null,
                                                color: colors.darkGrayColor,
                                            }}
                                            items={secretaries}
                                            onValueChange={this.handleSecretaryPicked.bind(this)}
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

Step3.propTypes = {
    setStepDisabled: PropTypes.func.isRequired
};

const mapStateToProps = state => ({

    newOrEditTraining: state.newOrEditTraining
});

const mapDispatchToProps = dispatch => ({
    setAllSecretaries: (allSecretaries) => {
        dispatch(setAllSecretaries(allSecretaries))
    },
    addSecretary: (id) => {
        dispatch(addSecretary(id))
    },
    removeSecretary: (id) => {
        dispatch(removeSecretary(id))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Step3);