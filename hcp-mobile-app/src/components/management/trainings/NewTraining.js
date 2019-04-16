import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity, Alert
} from 'react-native';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";
import Wizard from './newTrainingSteps/wizard/Wizard';

import NewTrainingStep1 from './newTrainingSteps/NewTrainingStep1';
import NewTrainingStep3 from "./newTrainingSteps/NewTrainingStep3";
import {
    addCoach,
    resetTraining,
    setAllCoaches,
    setAllLocals,
    setAllSecretaries,
    setLocalId
} from "../../../redux/actions/newTraining";
import NewTrainingStep2 from "./newTrainingSteps/NewTrainingStep2";
import Loader from "../../screens/Loader";
import NewTrainingStep4 from "./newTrainingSteps/NewTrainingStep4";


class NewTraining extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true
        }
    }

    async componentDidMount() {

        // Define go back function
        // Used to cancel training
        this.props.navigation.cancelTraining = () => {
            this.props.navigation.goBack();
            this.props.resetTraining();
        };

        // Fetch locals, coaches and secretaries
        let success = false;
        if(this.props.newTraining.allLocals.length === 0)
        {
            success = await this.fetchAllLocals();

            if(success && this.props.newTraining.allCoaches.length === 0) {

                success = await this.fetchAllCoaches();

                if (success && this.props.newTraining.allSecretaries.length === 0) {

                    success = await this.fetchAllSecretaries();
                }
            }

            this.setState({isLoading: false});
        }
        if (!success) {
            this.setState({
                'isLoading': false
            }, () => {
                Alert.alert(
                    'Erro',
                    'Algo correu mal. Por favor, contacte o administrador.',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.cancelTraining()},
                    ],
                    {cancelable: false},
                );
            });
        }
    }

    /**
     * Define navigation settings.
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'CRIAR TREINO'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft:
            <TouchableOpacity style={{
                width:42,
                height:42,
                alignItems:'center',
                justifyContent:'center',
                marginLeft: 10}} onPress = {() => navigation.cancelTraining()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'} />
            </TouchableOpacity>,
    });

    /**
     * Fetch all locals. (locais)
     * @returns {Promise<boolean>}
     */
    fetchAllLocals = async () => {

        const  params = {
            fields: ['id', 'display_name'],
            order: 'descricao ASC'
        };

        const response = await this.props.odoo.search_read('ges.local', params);
        if (response.success && response.data.length > 0) {

            this.props.setAllLocals(response.data);
            this.props.setLocalId(response.data[0].id);

            return true;
        }

        return false;
    };

    /**
     * Fetch all coaches. (treinadores)
     * @returns {Promise<boolean>}
     */
    fetchAllCoaches = async () => {

        const coachInfo = this.props.user.groups.filter(item => item.name === 'Treinador');
        if(coachInfo.length > 0) {

            const coachId = coachInfo[0].id;

            const  params = {
                fields: ['id', 'display_name', 'email', 'image'],
                order: 'display_name ASC',

            };

            const response = await this.props.odoo.search_read('ges.treinador', params);
            if (response.success && response.data.length > 0) {

                const allCoaches = response.data.map(item => {

                    if(item.id !== coachId)
                        return {
                            ...item,
                            visible: true
                        };
                    else
                        return {
                            ...item,
                            visible: false
                        };
                });
                this.props.setAllCoaches(allCoaches);

                // Add current coach as default
                if(!this.props.newTraining.coaches.find(item => item === coachId))
                    this.props.addCoach(coachInfo[0].id);

                return true;
            }
        }

        return false;
    };

    /**
     * Fetch all secretaries. (seccionistas)
     * @returns {Promise<boolean>}
     */
    fetchAllSecretaries = async () => {

        const  params = {
            fields: ['id', 'display_name', 'email', 'image'],
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

            return true;
        }

        return false;
    };


    render() {

        const forms = [
            {
                name: 'step1',
                component: (<NewTrainingStep1 navigation={this.props.navigation} />)
            },
            {
                name: 'step2',
                component: (<NewTrainingStep2 navigation={this.props.navigation} />)
            },
            {
                name: 'step3',
                component: (<NewTrainingStep3 navigation={this.props.navigation} />)
            },
            {
                name: 'step4',
                component: (<NewTrainingStep4 navigation={this.props.navigation} />)
            },
        ];

        return (
            <View style={styles.root}>
                <Wizard navigation={this.props.navigation}>
                    {forms.map(el => (
                        <Wizard.Step key={el.name}>
                            {el.component}
                        </Wizard.Step>
                    ))}
                </Wizard>
                <Loader isLoading={this.state.isLoading}/>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user,
    newTraining: state.newTraining
});

const mapDispatchToProps = dispatch => ({
    resetTraining: () => {
        dispatch(resetTraining())
    },
    setAllLocals: (locals) => {
        dispatch(setAllLocals(locals))
    },
    setLocalId: (localId) => {
        dispatch(setLocalId(localId))
    },
    setAllCoaches: (coaches) => {
        dispatch(setAllCoaches(coaches))
    },
    addCoach: (coachId) => {
        dispatch(addCoach(coachId))
    },
    setAllSecretaries: (secretaries) => {
        dispatch(setAllSecretaries(secretaries))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(NewTraining);
