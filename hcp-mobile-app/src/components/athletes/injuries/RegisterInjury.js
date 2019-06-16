import React, {Component} from 'react';
import {connect} from 'react-redux';
import {AntDesign} from "@expo/vector-icons";
import {
    Alert,
    Picker,
    View,
    Text,
    StyleSheet,
    TextInput, KeyboardAvoidingView
} from 'react-native';
import 'moment/locale/pt'
import {Card, Button} from "react-native-paper";
import * as Animatable from "react-native-animatable";
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";


class RegisterInjury extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isDisabled: true,

            athleteId: -1,
            eventId: undefined,
            eventType: undefined,
            athletes: [],
            text: ''
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff', 'REGISTAR LESÃO'
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
    });

    async componentDidMount(){

        await this.setState({
            eventId: this.props.navigation.state.params.eventId,
            eventDate: this.props.navigation.state.params.eventDate,
            eventType: this.props.navigation.state.params.eventType,
            athletes: this.props.navigation.state.params.athletes,
            isLoading: false
        });
    }

    /**
     * Handler for athlete.
     * @param athleteId
     * @private
     */
    _handleAthletePicked = async (athleteId) => {

        if(athleteId !== -1)
            await this.setState({athleteId: athleteId});

        if(this.state.athleteId !== -1 && this.state.text !== '')
            this.setState({isDisabled: false});
        else
            this.setState({isDisabled: true});
    };

    /**
     * Handler for observations text.
     * @param text
     * @private
     */
    _handleOnChangeText = async (text) => {

        await this.setState({text: text});

        if(this.state.athleteId !== -1 && this.state.text !== '')
            this.setState({isDisabled: false});
        else
            this.setState({isDisabled: true});
    };

    /**
     * Create a new injury.
     * @returns {Promise<void>}
     */
    saveInjury = async () => {

        if (this.state.athleteId !== -1 && this.state.text !== '') {

            await this.setState({isLoading: true});

            let params = {
                atleta: this.state.athleteId,
                ocorreu_num: this.state.eventType,
                observacoes_ocor: this.state.text,
                data_ocorrencia: this.state.eventDate,
                state: 'diagnostico'
            };

            // check event type
            if (this.state.eventType === 'treino')
                params.treino = this.state.eventId;
            else
                params.jogo = this.state.eventId;

            // create
            const response = await this.props.odoo.create('ges.lesao', params);
            await this.setState({isLoading: false});
            if (response.success){

                Alert.alert('Sucesso', 'A lesão foi registada com sucesso.',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.goBack()}
                    ],
                    {cancelable: false},
                );
            }
            else {
                Alert.alert('Erro', 'Ocorreu um erro ao tentar registar a lesão. ' +
                    'Por favor, tente mais tarde.',
                    [
                        {text: 'OK', onPress: () => this.props.navigation.goBack()}
                    ],
                    {cancelable: false},
                );
            }
        }
        else {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
        }
    };

    render() {

        const pickerText= (
            <Picker.Item label={"Selecione um atleta"} value={-1} key={-1} />
        );
        const athletesListAux = this.state.athletes.map((data) => (
            <Picker.Item label={data.name} value={data.id} key={data.id} />
        ));
        const athletesList = [pickerText, ...athletesListAux];

        return (
            <KeyboardAvoidingView style={styles.container} behavior={'position'} >
                <Animatable.View animation={"fadeIn"}>
                    <View style={{width: '100%'}} >
                        <Card elevation={6}>
                            <Card.Title
                                title={"Registar lesão"}
                                left={(props) =>
                                    <AntDesign name="filetext1" size={20} color={'#000'} {...props}/>
                                }
                            />
                            <Card.Content>
                                <View style={{marginTop: 15}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Atleta</Text>
                                    <View style={{
                                        borderRadius: 5,
                                        backgroundColor: '#f2f2f2',
                                        justifyContent: 'center'
                                    }}>
                                        <Picker
                                            selectedValue={
                                                this.state.athleteId ?
                                                    this.state.athleteId :
                                                    -1
                                            }
                                            onValueChange={this._handleAthletePicked}>
                                            {athletesList}
                                        </Picker>
                                    </View>
                                </View>
                                <View style={{marginTop: 30}}>
                                    <Text style={{fontSize: 18, fontWeight: '400'}}>Observações</Text>
                                    <View style={styles.textAreaContainer} >
                                        <TextInput
                                            style={styles.textArea}
                                            placeholder={
                                                "Introduza algumas observaçõe sobre a lesão..."
                                            }
                                            numberOfLines={7}
                                            multiline={true}
                                            onChangeText={text => this._handleOnChangeText(text)}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>
                    <View style={{width: '100%'}} >
                        <Button
                            color={'rgba(173, 46, 83, 0.8)'}
                            mode="contained"
                            contentStyle={styles.saveButtonInside}
                            style={styles.saveButtonOutside}
                            onPress={this.saveInjury.bind(this)}
                            loading={this.state.isLoading}
                            disabled={this.state.isDisabled}
                        >
                            GUARDAR
                        </Button>
                    </View>
                </Animatable.View>
            </KeyboardAvoidingView>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    textAreaContainer: {
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
        padding: 5
    },
    textArea: {
        height: 150,
        justifyContent: "flex-start",
        textAlignVertical: 'top'
    },
    saveButtonInside: {
        height: 50,
    },
    saveButtonOutside: {
        marginTop: 20
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterInjury);