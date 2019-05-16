import React, { Component } from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import { connect } from 'react-redux';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";
import AthleteInjuriesHeader from "./AthleteInjuriesHeader";
import {colors} from "../../styles/index.style";
import Loader from "../screens/Loader";
import {Text} from "react-native-paper";

class DiagnosisInjury extends React.PureComponent {

    render() {
        return (
            <View>
                <Text>Em diagnóstico</Text>
            </View>
        );
    }
}

class TreatmentInjury extends React.PureComponent {

    render() {
        return (
            <View>
                <Text>Em tratamento</Text>
            </View>
        );
    }
}

class TreatedInjury extends React.PureComponent {

    render() {
        return (
            <View>
                <Text>Tratada</Text>
            </View>
        );
    }
}

class AthleteInjury extends Component {

    constructor(props) {
        super(props);

        this.state = {
            injury: {},
            type: "",
            athleteId: "",
            athleteName: "",
            athleteImage: false,
            isLoading: true,
        }
    }

    /**
     * Define navigation properties.
     * @param navigation
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'LESÃO'}
                style={{
                    color: '#ffffff',
                    fontSize: 16
                }}
            />,
        headerLeft:
            <TouchableOpacity style={{
                width: 42,
                height: 42,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 10
            }} onPress={() => navigation.goBack()}>
                <Ionicons
                    name="md-arrow-back"
                    size={28}
                    color={'#ffffff'}/>
            </TouchableOpacity>
    });

    async componentWillMount() {

        await this.setState({
            injury: this.props.navigation.getParam('injury'),
            type: this.props.navigation.getParam('type'),
            athleteId: this.props.navigation.getParam('athleteId'),
            athleteName: this.props.navigation.getParam('athleteName'),
            athleteImage: this.props.navigation.getParam('athleteImage'),
        });
    }

    componentDidMount() {

        this.setState({isLoading: false});
    }

    render() {

        let injuryType = null;
        if (!this.state.isLoading) {

            if(this.state.type === 'Em diagnóstico') {
                injuryType = (
                    <DiagnosisInjury />
                );
            }
            else if(this.state.type === 'Em tratamento') {
                injuryType = (
                    <TreatmentInjury />
                );
            }
            else {
                injuryType = (
                    <TreatedInjury />
                );
            }
        }

        return (
            <View style={styles.container}>
                <Loader isLoading={this.state.isLoading} />
                <AthleteInjuriesHeader
                    athleteImage={this.state.athleteImage}
                    athleteName={this.state.athleteName}
                />
                {injuryType}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.grayColor,
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AthleteInjury);