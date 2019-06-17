import React, {Component} from 'react';
import {View, Alert, StyleSheet, FlatList} from 'react-native';
import {connect} from 'react-redux';
import {headerTitle, closeButton} from "../../navigation/HeaderComponents";
import {colors} from "../../../styles/index.style";
import {TouchableOpacity} from "react-native-gesture-handler"; // NÃO INSTALAR OU COLOCAR NO PACKAGE JSON
import CustomText from "../../CustomText";
import BottomSheet from 'reanimated-bottom-sheet';
import {Entypo, Ionicons} from "@expo/vector-icons";
import {ListItem} from "react-native-elements";
import Loader from "../../screens/Loader";
import { Dropdown } from 'react-native-material-dropdown';
//import NumericInput from 'react-native-numeric-input';

class AddSummary extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            trainingID: undefined,
            trainingDuration: undefined,
            allCategories: [],
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

        const {params = {}} = navigation.state;
        return ({
            headerTitle: headerTitle(
                '#ffffff', 'ADICIONAR SUMÁRIO'
            ),
            headerLeft: closeButton(
                '#ffffff', navigation
            ),
            headerRight:
                <TouchableOpacity
                    style={{
                        width: 50,
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 5
                    }}
                    onPress = {() => params.savingSummary()}
                >
                    <Entypo
                        name="save"
                        size={28}
                        color={'#ffffff'}
                    />
                </TouchableOpacity>
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
            fields: ['id', 'name',],
            order:  'name ASC',
        };

        const response = await this.props.odoo.search_read('ges.categoria_treino', params);
        if(response.success && response.data.length > 0) {

            await this.setState({
                allCategories: response.data.map(item => {item.visible=true; return item}),
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

    /**
     * Saving summary.
     * @returns {Promise<void>}
     */
    savingSummary = async () => {

        await this.setState({isLoading: true});

        let responses = [];
        for (let i = 0; i < this.state.summary.length; i++) {

            const category = this.state.summary[i];
            const data = {
                categoria_treino: category.id,
                treino: this.state.trainingID,
                duracao: category.value
            };

            const response = await this.props.odoo.create('ges.linha_categoria_treino', data);
            responses.push(response.success);
        }

        await this.setState({isLoading: false});

        if(responses.every(item => item === true)) {
            Alert.alert(
                'Sucesso',
                'O sumário foi guardado com sucesso.',
                [
                    {
                        text: 'Voltar',
                        onPress: () => {this.props.navigation.pop(2)}
                    },
                ],
                {cancelable: true},
            );
        }
        else {
            Alert.alert(
                'Erro',
                'Ocorreu um erro ao guardar o sumário.',
                [
                    {
                        text: 'Voltar',
                        onPress: () => {this.props.navigation.pop(2)}
                    },
                ],
                {cancelable: true},
            );
        }
    };


    addCategory = async (category) => {

        if(this.state.totalDuration < this.state.trainingDuration) {
            // set default
            category.value = 0;

            // remove selected category
            const allCategories = this.state.allCategories.map(item => {
                if (item.id === category.id)
                    item.visible = false;
                return item;
            });

            // add new category to summary
            await this.setState(state => ({
                allCategories: allCategories,
                summary: [...state.summary, category]
            }));

            this._bottomSheet.snapTo(1);
        }
    };

    removeCategory = async (category) => {

        // remove selected category
        const summary = this.state.summary.filter(item => item.id !== category.id);

        let duration = 0;
        for (let i = 0; i < summary.length; i++) {
            duration += summary[i].value;
        }


        // add selected category
        const allCategories = this.state.allCategories.map(item => {
            if (item.id === category.id)
                item.visible = true;
            return item;
        });

        // add new category to summary
        await this.setState(({
            allCategories: allCategories,
            summary: summary,
            totalDuration: duration
        }));

        this._bottomSheet.snapTo(1);
    };

    changeDuration = async (category, value) => {

        const auxTotal = this.state.totalDuration + (value - category.value);

        if(value >= 0 && (auxTotal <= this.state.trainingDuration)) {

            // remove selected category
            const summary = this.state.summary.map(item => {
                let aux = item;
                if(item.id === category.id) {
                    aux.value = value;
                }
                return aux;
            });

            let duration = 0;
            for (let i = 0; i < summary.length; i++) {
                duration = duration + summary[i].value;
            }

            if(duration === this.state.trainingDuration)
                this._bottomSheet.snapTo(2);
            else
                this._bottomSheet.snapTo(1);

            await this.setState({totalDuration: duration, summary: summary});
        }
    };


    /**
     * Header of Bottom Sheet.
     * @returns {*}
     */
    bottomSheetHeader = () => {
        return (
            <View style={styles.bottomSheetHeaderContainer}>
                <View style={styles.bottomSheetHeaderButton}/>
            </View>
        )
    };

    /**
     * Inner content of Bottom Sheet.
     * @returns {*}
     */
    bottomSheetInner = () => {
        return (
            <View style={styles.panel}>
                {this.state.allCategories.map(item => {
                    if(item.visible)
                        return (
                            <View key={item.id}  style={{marginBottom: 15}}>
                                <TouchableOpacity
                                    style={styles.panelButton}
                                    onPress={() => this.addCategory(item)}
                                >
                                    <CustomText
                                        type={'bold'}
                                        numberOfLines={2}
                                        ellipsizeMode='tail'
                                        children={item.name}
                                        style={styles.panelButtonTitle}
                                    />
                                </TouchableOpacity>
                            </View>
                        );
                    else
                        return null;
                })}
            </View>
        )
    };

    renderItem = ({ item, index }) => {

        const category = this.state.summary.find(i => i.id === item.id);

        let data = [];
        const diff = this.state.trainingDuration - this.state.totalDuration;
        if (diff >= category.value)
            for (let i = 1; i<(diff+1)/5; i++) {data.push({value: i*5})}
        else
            for (let i = 1; i<(category.value+1)/5; i++) {data.push({value: i*5})}

        return (
            <ListItem
                title={item.name}
                titleStyle={{fontWeight: 'bold'}}
                containerStyle={{
                    backgroundColor: index % 2 === 0 ? '#fff' : colors.lightGrayColor
                }}
                leftElement={(
                    <TouchableOpacity
                        onPress={() => this.removeCategory(item)}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 30
                        }}>
                        <Ionicons name={"md-close"} size={26} color={colors.redColor}/>
                    </TouchableOpacity>
                )}
                rightElement={() => {

                    return (
                        <View style={{width: 80, height: 45, justifyContent: 'center'}}>
                            <Dropdown
                                label='min'
                                data={data}
                                value={category.value}
                                onChangeText={(value) => this.changeDuration(item, parseInt(value))}
                            />
                        </View>
                        /*
                        <NumericInput
                            value={category.value}
                            onChange={(value) => this.changeDuration(item, value)}
                            minValue={0}
                            maxValue={this.state.trainingDuration}
                            totalWidth={150}
                            totalHeight={45}
                            iconSize={25}
                            step={5}
                            valueType={'integer'}
                            editable={false}
                            type={'plus-minus'}
                            rounded={true}
                            textColor='#000'
                            iconStyle={{ color: 'white' }}
                            borderColor={colors.darkGrayColor}
                            leftButtonBackgroundColor={colors.darkGrayColor}
                            rightButtonBackgroundColor={colors.darkGrayColor}
                        />
                         */
                    )
                }}
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
                    //data={this.state.summary}
                    data={this.state.summary.sort((a, b) => (a.name).localeCompare(b.name))}
                    extraData={[this.state.summary, this.state.totalDuration]}
                    renderItem={this.renderItem.bind(this)}
                    /*
                    ListHeaderComponent={(
                        <View style={{alignItems: 'center', textAlign: 'center'}}>
                            <CustomText
                                type={'bold'}
                                style={[styles.topHeaderValue, {fontSize: 20}]}
                            >
                                {'Categorias'}
                            </CustomText>
                        </View>
                    )}
                     */
                />
                <BottomSheet
                    ref={ref => this._bottomSheet = ref}
                    snapPoints={['65%', '25%', '5%']}
                    renderContent={this.bottomSheetInner}
                    renderHeader={this.bottomSheetHeader}
                    enabledInnerScrolling={true}
                    initialSnap={0}
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

export default connect(mapStateToProps, mapDispatchToProps)(AddSummary);