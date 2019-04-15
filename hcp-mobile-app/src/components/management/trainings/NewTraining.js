import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity
} from 'react-native';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";
import Wizard from '../router/Wizard';

import NewTrainingStep1 from './newTrainingSteps/NewTrainingStep1';
import NewTrainingStep2 from "./newTrainingSteps/NewTrainingStep2";


class NewTraining extends Component {

    constructor(props) {
        super(props);

        this.state = {

        };
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
                marginLeft: 10}} onPress = {() => navigation.goBack()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'} />
            </TouchableOpacity>,
    });

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
                component: (
                    <View style={styles.container}>
                        <CustomText type={'bold'} children={'Step 3'} />
                    </View>
                )
            },
        ];

        return (
            <View style={styles.root}>
                <Wizard
                    initialValues={{
                        username: '',
                        email: '',
                        avatar: '',
                    }}
                >
                    {forms.map(el => (
                        <Wizard.Step key={el.name}>
                            {el.component}
                        </Wizard.Step>
                    ))}
                </Wizard>
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
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NewTraining);
