import React, {Component} from 'react';

import {TouchableOpacity, View} from 'react-native';

import {connect} from 'react-redux';
import {headerTitle} from "../../navigation/HeaderComponents";
import {Ionicons} from "@expo/vector-icons";
import Loader from "../../screens/Loader";
import {setStepID, setAllInformation} from "../../../redux/actions/newOrEditGame";
import {
    fetchAllLocals,
    fetchAllCoaches,
    fetchAllSecretaries,
    fetchAllEchelons,
    fetchAllAthletes
} from "../fetchFunctionsNewGameTraining";



class NewOrEditGame extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true
        }
    }

    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'CRIAR JOGO'
        ),
        headerLeft:
            <TouchableOpacity
                style={{
                    width: 42,
                    height: 42,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 5
                }}
                //onPress = {() => navigation.cancelTraining()}
            >
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'}/>
            </TouchableOpacity>,
    });

    async componentDidMount() {

        // define first step as 0
        this.props.setStepID(0);



        /*
        const game = this.props.navigation.getParam('game');
        if(game === undefined) {

        }
        */



        // get all information needed for creating new game
        await this.fetchAllInformation();
        this.setState({isLoading: false});
    }


    fetchAllInformation = async () => {

        let allLocals, allCoaches, allSecretaries,
            allEchelons, allAthletes, allTeams,
            allCompetitions, allSeasons;

        allLocals = await fetchAllLocals(this.props.odoo);
        if(allLocals.length > 0) {

            allCoaches = await fetchAllCoaches(this.props.odoo);
            if(allCoaches.length > 0) {

                allSecretaries = await fetchAllSecretaries(this.props.odoo);
                if(allSecretaries.length > 0) {

                    allEchelons = await fetchAllEchelons(this.props.odoo);
                    if(allEchelons.length > 0) {

                        allAthletes = await fetchAllAthletes(this.props.odoo);
                        console.log(allAthletes);
                    }
                }
            }
        }
    };

    render() {
        return (
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({
    setStepID: (id) => {
        dispatch(setStepID(id));
    },
    setAllInformation: (
        allLocals, allCoaches, allSecretaries,
        allEchelons, allAthletes, allTeams,
        allCompetitions, allSeasons
    ) => {
        dispatch(setAllInformation(
            allLocals, allCoaches, allSecretaries,
            allEchelons, allAthletes, allTeams,
            allCompetitions, allSeasons
        ));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewOrEditGame);