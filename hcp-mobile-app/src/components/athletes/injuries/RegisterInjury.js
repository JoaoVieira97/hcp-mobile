import React, {Component} from 'react';
import {connect} from 'react-redux';
import CustomText from "../../CustomText";
import {Ionicons, AntDesign} from "@expo/vector-icons";
import {
    Alert, 
    Picker,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput
} from 'react-native';
import 'moment/locale/pt'
import {Card} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import Loader from "../../screens/Loader";

class RegisterInjury extends Component {

    constructor(props) {
        super(props);
        this.state = {
            eventId: {},
            eventType: {},
            athletes: [],
            athlete: {},
            isLoading: true,
            text: '',
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle:
            <CustomText
                type={'bold'}
                children={'REGISTAR LESÃO'}
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
            </TouchableOpacity>
    });

    async componentDidMount(){

        await this.setState({
            eventId: this.props.navigation.state.params.eventId,
            eventDate: this.props.navigation.state.params.eventDate,
            eventType: this.props.navigation.state.params.eventType,
            athletes: this.props.navigation.state.params.athletes,
            isLoading: false
        });

        //console.log(this.props.navigation.state.params.eventId);
        //console.log(this.props.navigation.state.params.eventDate);
        //console.log(this.props.navigation.state.params.eventType);
        //console.log(this.props.navigation.state.params.athletes);
    }

    /**
     * Handler for athlete.
     * @param athlete
     * @private
     */
    _handleAthletePicked = (athlete) => {
        this.setState({
            athlete: athlete
        })
    };

    saveInjury = async () => {
        
        //console.log(this.state.athlete)
        //console.log(this.state.text)

        var params = {
            atleta: this.state.athlete,
            ocorreu_num: this.state.eventType,
            observacoes_ocor: this.state.text,
            data_ocorrencia: this.state.eventDate,
            state: 'diagnostico'
        };

        (this.state.eventType == 'treino') ?
            params.treino = this.state.eventId :
            params.jogo = this.state.eventId

        console.log(params)
        
        response = await this.props.odoo.create('ges.lesao', params);
    
        if (response.success){

            Alert.alert('Sucesso', 'Lesão registada')
            this.props.navigation.goBack();

        } else{

            Alert.alert('Erro', 'Ocorreu um erro. Tente de novo.')
            
        }
    }
    
    render() {

        const list_athletes = this.state.athletes.map((data) => {
            return (
                <Picker.Item label={data.name} value={data.id} key={data.id} />
            );
        });

        return (
            <View style={styles.container}>
                {
                    !this.state.isLoading &&
                    <Animatable.View animation={"fadeIn"}>
                        <Card elevation={6}>
                            <Card.Title
                                title="Registar lesão de atleta"
                                subtitle="Defina todos os campos em baixo."
                                left={(props) => <AntDesign name="filetext1" size={20} color={'#000'} {...props}/>}
                            />
                            <Card.Content>
                                <View style={{marginTop: 30}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Atleta</Text>
                                    <View style={{
                                        borderRadius: 5,
                                        backgroundColor: '#f2f2f2',
                                        justifyContent: 'center'
                                    }}>
                                        <Picker
                                            selectedValue={this.state.athlete}
                                            onValueChange={this._handleAthletePicked}>
                                            {list_athletes}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={{marginTop: 30}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Observações</Text>
                                    <View style={{
                                        borderRadius: 5,
                                        backgroundColor: '#f2f2f2',
                                        justifyContent: 'center'
                                    }}>
                                        <TextInput
                                            style={{height: 100}}
                                            placeholder="Escreva as observações"
                                            onChangeText={(text) => this.setState({text})}
                                            editable={true}
                                            multiline={true}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </Animatable.View>
                }
                <Loader isLoading={this.state.isLoading}/>
                <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                }}>
                    <TouchableOpacity
                        onPress={this.saveInjury}
                        style={styles.saveButton}>
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>
                            {'GUARDAR'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    saveButton: {
        backgroundColor: 'rgba(173, 46, 83, 0.8)',
        padding: 10,
        width: '100%',
        borderRadius: 5,
        alignItems: 'center'
    }
});

const mapStateToProps = state => ({
    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterInjury);