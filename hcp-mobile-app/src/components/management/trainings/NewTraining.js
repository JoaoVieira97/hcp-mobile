import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
} from 'react-native';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../../CustomText";
import Wizard from '../router/Wizard';
import Input from '../router/Input';


import NewTrainingStep1 from './newTrainingSteps/NewTrainingStep1';


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
                            {({ onChangeValue, values }) => {
                                if(el.name === 'step1') {
                                    return (
                                        <NewTrainingStep1 onChangeValue={onChangeValue} values={values}/>
                                    );
                                }
                                else {
                                    return (
                                        <View style={styles.container}>
                                            <Input
                                                onChangeValue={onChangeValue}
                                                placeholder={el.placeholder}
                                                value={values[el.name]}
                                                name={el.name}
                                            />
                                        </View>
                                    );
                                }
                            }}
                        </Wizard.Step>
                    ))}
                </Wizard>
            </View>
        );
    }
}

const forms = [
    {
        placeholder: 'Username here...',
        name: 'step1',
    },
    {
        placeholder: 'Username here...',
        name: 'username2',
    },
    {
        placeholder: 'Email here...',
        name: 'email',
    },
    {
        placeholder: 'Avatar here...',
        name: 'avatar',
    },
    {
        placeholder: 'Avatar here...',
        name: 'avatar',
    },
    {
        placeholder: 'Avatar here...',
        name: 'avatar',
    },
    {
        placeholder: 'Avatar here...',
        name: 'avatar',
    },
];

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 20
    },
});



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(NewTraining);
