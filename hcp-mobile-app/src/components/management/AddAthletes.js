import React, {Component} from 'react';
import {FlatList, View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {closeButton, headerTitle} from "../navigation/HeaderComponents";
import {colors} from "../../styles/index.style";
import RNPickerSelect from "react-native-picker-select";
import {Avatar, Badge, CheckBox, ListItem} from "react-native-elements";



class AddAthletes extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedEchelonID: null
        }
    }

    componentDidMount() {

        this.addAthlete = this.props.navigation.getParam('addAthlete');
        this.removeAthlete = this.props.navigation.getParam('removeAthlete');
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'ADICIONAR ATLETAS'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        )
    });

    /**
     * List header handler
     * @param value
     */
    handleEchelonPicked = (value) => {

        if(value != null) {
            this.setState({
                selectedEchelonID: value
            });
        }
    };

    /**
     * List header with echelons picker.
     * @returns {*}
     */
    renderHeader = () => {

        let echelons = [];
        if(this.props.newOrEditGame.allEchelons.length > 0) {

            echelons = this.props.newOrEditGame.allEchelons.map(item => ({
                label: item.name,
                value: item.id,
                color: '#000'
            }));
        }
        else {
            echelons = this.props.newOrEditTraining.allEchelons.map(item => ({
                label: item.name,
                value: item.id,
                color: '#000'
            }));
        }

        return (
            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    placeholder={{
                        label: 'Selecione um escalão...',
                        value: null,
                        color: colors.darkGrayColor,
                    }}
                    items={echelons}
                    onValueChange={this.handleEchelonPicked.bind(this)}
                    value={this.state.selectedEchelonID}
                />
            </View>
        );
    };

    /**
     * List empty component.
     */
    renderEmptyComponent = () => {

        return (
            <View style={{padding: 10}}>
                <Text style={{fontSize: 15}}>{'Nenhum atleta disponível.'}</Text>
            </View>
        );
    };

    /**
     * Athlete image for list item.
     * @param img
     * @param squad_number
     * @returns {*}
     */
    leftAvatar = (img, squad_number) => {

        let avatar;

        if (img) {
            avatar = (
                <Avatar
                    rounded
                    source={{
                        uri: `data:image/png;base64,${img}`,
                    }}
                    size="medium"
                />
            );
        } else {
            avatar = (
                <Avatar
                    rounded
                    source={require('../../../assets/user-account.png')}
                    size="medium"
                />
            );
        }

        return (
            <View>
                {avatar}
                <Badge
                    value={squad_number}
                    badgeStyle={{backgroundColor: '#000' }}
                    containerStyle={{ position: 'absolute', bottom: -4, right: -4 }}
                />
            </View>
        );
    };

    /**
     * When user change invitation state.
     */
    handleChangeInvitation = (id, value) => {

        if(value) {

            // remove
            this.removeAthlete(id);
        }
        else {

            // add
            this.addAthlete(id);
        }
    };

    /**
     * Athlete item.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem =  ({item, index}) => {

        let isChecked = false;
        if(this.props.newOrEditGame.rawAthletesIDs.length > 0) {

            if(this.props.newOrEditGame.rawAthletesIDs.includes(item.id))
                isChecked = true;
        }
        else if (this.props.newOrEditTraining.rawAthletesIDs.length > 0){

            if(this.props.newOrEditTraining.rawAthletesIDs.includes(item.id))
                isChecked = true;
        }

        const checkbox = (
            <CheckBox
                iconRight
                checked={isChecked}
                onPress={() => this.handleChangeInvitation(item.id, isChecked)}
                size = {30}
                containerStyle={{ marginRight: 5, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                checkedColor={colors.availableColor}
                uncheckedColor={colors.notAvailableColor}
            />
        );

        return (
            <ListItem
                title={item.name}
                subtitle={item.echelon}
                leftAvatar={this.leftAvatar(item.image, item.squadNumber.toString())}
                rightElement={checkbox}
                containerStyle={{
                    backgroundColor: index % 2 === 0 ? colors.lightGrayColor : '#fff'
                }}
            />
        );
    };

    render() {

        let athletes = [];
        if(this.state.selectedEchelonID !== null) {

            if(this.props.newOrEditGame.allAthletes[this.state.selectedEchelonID.toString()]) {

                const aux = this.props.newOrEditGame.allAthletes[this.state.selectedEchelonID.toString()];
                athletes = aux.athletes;
            }
            else if(this.props.newOrEditTraining.allAthletes[this.state.selectedEchelonID.toString()]) {

                const aux = this.props.newOrEditTraining.allAthletes[this.state.selectedEchelonID.toString()];
                athletes = aux.athletes;
            }
        }


        return (
            <FlatList
                keyExtractor={item => item.id + item.name}
                data={athletes}
                renderItem={this.renderItem}
                ListHeaderComponent={this.renderHeader}
                ListEmptyComponent={this.renderEmptyComponent}
                extraData = {[this.state.selectedEchelonID, this.props.newOrEditGame, this.props.newOrEditTraining]}
            />
        );
    }
}

const styles = StyleSheet.create({
    pickerContainer: {
        backgroundColor: colors.lightGrayColor,
        marginBottom: 10,
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

    newOrEditGame: state.newOrEditGame,
    newOrEditTraining: state.newOrEditTraining
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AddAthletes);