import React, {Component} from 'react';
import {View, Alert, StyleSheet, FlatList} from 'react-native';
import {connect} from 'react-redux';
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import {colors} from "../../../styles/index.style";
import CustomText from "../../CustomText";
import {ListItem} from "react-native-elements";
import Loader from "../../screens/Loader";
import {MaterialCommunityIcons} from "@expo/vector-icons";

class Summary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            trainingID: undefined,
            trainingDuration: undefined,
            summary: [],
            totalDuration: 0,
        }
    }

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => {

        return ({
            headerTitle: headerTitle(
                '#ffffff', 'SUMÁRIO'
            ),
            headerLeft: closeButton(
                '#ffffff', navigation
            )
        })

    };

    async componentDidMount() {

        this.props.navigation.setParams({
            savingSummary: this.savingSummary
        });

        await this.setState({
            trainingID: this.props.navigation.state.params.trainingID,
            trainingDuration: this.props.navigation.state.params.trainingDuration
        });

        await this.fetchCategories();
    }

    /**
     * Get all categories available.
     * @returns {Promise<void>}
     */
    fetchCategories = async () => {

        const params = {
            domain: [['treino', '=', this.state.trainingID]],
            fields: ['id', 'categoria_treino', 'duracao'],
        };

        const response = await this.props.odoo.search_read('ges.linha_categoria_treino', params);
        if(response.success) {

            const values = response.data.map(item => item.duracao);
            await this.setState({
                summary: response.data.map(item => ({
                    id: item.id,
                    name: item.categoria_treino[1],
                    duration: item.duracao + ' min'
                })),
                totalDuration: values.reduce(function(acc, val) { return acc + val; }, 0),
                isLoading: false
            });
        }
        else {

            await this.setState({isLoading: false});

            Alert.alert(
                'Erro',
                'Ocorreu um erro ao obter as categorias de um treino.',
                [
                    {
                        text: 'Voltar',
                        onPress:  () => {this.props.navigation.goBack()}
                    },
                ],
                {cancelable: true},
            );
        }
    };

    renderItem = ({ item, index }) => {

        return (
            <ListItem
                title={item.name}
                subtitle={item.duration}
                titleStyle={{fontWeight: 'bold'}}
                containerStyle={{
                    backgroundColor: index % 2 === 0 ? '#fff' : colors.lightGrayColor
                }}
                leftAvatar={(<MaterialCommunityIcons name={'timer'} size={28} />)}
            />
        )
    };

    render() {
        return (
            <View style={styles.container}>
                <Loader isLoading={this.state.isLoading}/>
                <View style={styles.topHeader}>
                    <View style={{width: '50%', alignItems: 'center', justifyContent: 'center'}}>
                        <CustomText type={'bold'} style={styles.topHeaderTitle}>DURAÇÃO</CustomText>
                    </View>
                    <View style={{width: '50%', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <CustomText
                            type={'bold'}
                            style={[styles.topHeaderValue, {fontSize: 20}]}>
                            {this.state.totalDuration + '/'}
                        </CustomText>
                        <CustomText
                            type={'semi-bold'}
                            style={[styles.topHeaderValue, {fontSize: 12, marginTop: 16}]}
                        >
                            {this.state.trainingDuration}
                        </CustomText>
                        <CustomText
                            type={'normal'}
                            style={[styles.topHeaderValue, {fontSize: 15, marginLeft: 10}]}
                        >
                            {'minutos'}
                        </CustomText>
                    </View>
                </View>
                <FlatList
                    keyExtractor={item => item.id + item.name}
                    data={this.state.summary.sort((a, b) => (a.name).localeCompare(b.name))}
                    renderItem={this.renderItem.bind(this)}
                />
            </View>
        );
    }
}

const bgColor = 'rgba(52, 52, 52, 0.8)';
const buttonColor = '#292929';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    topHeader: {
        flexDirection: 'row',
        width: '100%',
        height: 60,
        marginBottom: 10,
        paddingVertical: 10,
        backgroundColor: colors.grayColor,
        justifyContent: 'center',
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    topHeaderTitle: {
        color: '#000',
        fontSize: 15,
        letterSpacing: 5
    },
    topHeaderValue: {
        color: colors.redColor,
    },
    bottomSheetHeaderContainer: {
        paddingVertical: 10,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomSheetHeaderButton: {
        width: 40,
        height: 5,
        borderRadius: 20,
        backgroundColor: buttonColor
    },
    panel: {
        padding: 20,
        backgroundColor: bgColor,
    },
    panelButton: {
        height: 55,
        borderRadius: 10,
        backgroundColor: buttonColor,
        alignItems: 'center',
        justifyContent: 'center',
        //marginVertical: 10,
    },
    panelButtonTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
    },
});


const mapStateToProps = state => ({

    odoo: state.odoo.odoo
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Summary);