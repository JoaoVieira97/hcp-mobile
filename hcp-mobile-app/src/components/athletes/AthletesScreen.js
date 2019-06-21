import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator, StyleSheet} from 'react-native';
import {ListItem, Avatar, Badge, SearchBar} from 'react-native-elements';
import {connect} from 'react-redux';
import _ from 'lodash';
import CustomText from "../CustomText";
import moment from 'moment';
import {headerTitle, closeButton} from "../navigation/HeaderComponents";
import {MaterialCommunityIcons, MaterialIcons} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";


class AthletesScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            echelon: {},
            position: '',
            data: [],
            fullData: [],
            isLoading: true,
            isRefreshing: false,
            searchText: ''
        }
    };

    /**
     * Define navigations header components.
     * @param navigation
     * @returns {{headerLeft: *, headerTitle: *}}
     */
    static navigationOptions = ({navigation}) => ({
        headerTitle: headerTitle(
            '#ffffff',
                navigation.state.params.echelon.denomination === 'Iniciação' ?
                'INICIAÇÃO' :
                _.upperCase(navigation.state.params.echelon.denomination)
        ),
        headerLeft: closeButton(
            '#ffffff', navigation
        ),
    });

    async componentDidMount() {

        await this.setState({
            echelon: this.props.navigation.getParam('echelon'),
        });

        await this.getAthletes();
    }

    /**
     * Get athletes of current echelon.
     * @returns {Promise<void>}
     */
    async getAthletes() {

        const params = {
            fields: ['id', 'user_id', 'display_name', 'image', 'escalao', 'numerocamisola', 'posicao', 'birthdate', 'email'],
            domain: [['escalao', '=', this.state.echelon.id]],
            order:  'posicao DESC, numerocamisola ASC',
        };

        const response = await this.props.odoo.search_read('ges.atleta', params);
        if (response.success) {

            let athletes = [];
            const size = response.data.length;
            const currDate = moment();

            for (let i = 0; i < size; i++) {

                const athleteInfo = response.data[i];
                let athleteAge;
                let athleteBirth = null;
                let athleteBirthay = null;
                if(athleteInfo.birthdate) {
                    athleteBirth = moment(athleteInfo.birthdate);
                    athleteAge = currDate.diff(athleteBirth, 'years');

                    athleteBirthay =
                        athleteInfo.birthdate.slice(8,10) + '/' +
                        athleteInfo.birthdate.slice(5,7) + '/' +
                        athleteInfo.birthdate.slice(0,4);
                }

                const athlete = {
                    'id': athleteInfo.id,
                    'name': athleteInfo.display_name,
                    'email': athleteInfo.email ? athleteInfo.email : 'Não definido',
                    'birthday': athleteInfo.birthdate ? athleteBirthay : 'Não definida',
                    'age': athleteInfo.birthdate ? athleteAge + ' anos' : "Idade não definida",
                    'image': athleteInfo.image,
                    'squadNumber': athleteInfo.numerocamisola,
                    'echelon': this.state.echelon.denomination,
                    'user_id': athleteInfo.user_id[0],
                    'position': athleteInfo.posicao,
                };

                athletes.push(athlete);
            }

            this.setState({
                data: athletes,
                fullData: athletes
            });
        }

        this.setState({
            isLoading: false,
            isRefreshing: false
        });
    }

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

    renderPosition = (athlete) => {

        let atualPosition = athlete.position;
        let flag = false;
        let previousPosition;
        const size = this.state.fullData.length;

        for(let i = 0 ; i< size && flag===false ; i++){

            let aux = this.state.fullData[i];

            if( athlete.user_id ===  aux.user_id) {
                flag = true;
                if( i > 0 ) previousPosition = this.state.fullData[i-1].position;
                else return(
                    <CustomText>
                        {atualPosition}
                    </CustomText>
                );
            }
        }

        if(atualPosition !== previousPosition){
            return(
                <CustomText>
                    {atualPosition}
                </CustomText>
            )
        }

        else return(
            <CustomText style={{color: '#fff'}}>
                {atualPosition}
            </CustomText>
        )
    };

    renderItem =  ({item, index}) => {

        let color = item.position !== 'GR' ?'#fff' : '#efefef';
        let text = item.position === 'GR' ? item.age + ' | Guarda-Redes' : item.age;

        return (
            <ListItem
                title={item.name}
                subtitle={text}
                leftElement={() => {
                    if (item.position === 'GR')
                        return (
                            <MaterialCommunityIcons
                                name={'hand'}
                                size={25}
                                color={colors.redColor}
                            />
                        );
                    /*
                    else return (
                        <MaterialCommunityIcons
                            name={'human-handsup'}
                            size={27}
                            color={colors.redColor}
                        />
                    )
                     */
                }}
                leftAvatar={this.leftAvatar(item.image, item.squadNumber.toString())}
                chevron={true}
                onPress={() => (
                    this.props.navigation.navigate('AthleteScreen', {athlete: item})
                )}
                containerStyle={{
                    backgroundColor: color
                }}
            />
        );
    };

    handleSearchClear = () => {

        //this.setState({searchText: ''});
        this.setState({
            data: this.state.fullData
        });
    };

    contains = ({name}, query) => {

        return !!name.includes(query);
    };

    handleSearch = (text) => {
        const formatText = _.capitalize(text);
        const data = _.filter(this.state.fullData, user => {
            return this.contains(user, formatText);
        });
        this.setState({
            searchText: text,
            data: data
        });
    };

    renderHeader = () => (
        <SearchBar
            placeholder={"Pesquisar por nome"}
            lightTheme
            round
            onClear={this.handleSearchClear}
            onChangeText={this.handleSearch}
            value={this.state.searchText}
        />
    );

    renderFooter = () => {

        return (
            <View style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#ced0ce'
            }}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={'#ced0ce'}
                    />
                }
            </View>
        );
    };

    renderSeparator = () => (
        <View style={{
            height: 1,
            width: '100%',
            backgroundColor: '#ced0ce',
        }}/>
    );

    handleRefresh = () => {
        this.setState({
            data: [],
            isRefreshing: true,
            isLoading: false
        },
        async () => {
            await this.getAthletes();
        });
    };

    render() {

        return (
            <FlatList
                keyExtractor={item => item.id + item.name}
                data={this.state.data}
                renderItem={this.renderItem}
                ItemSeparatorComponent={this.renderSeparator}
                ListHeaderComponent={this.renderHeader}
                ListFooterComponent={this.renderFooter.bind(this)}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
            />
        );
    }
}

const styles = StyleSheet.create({
    athleteValue: {
        color: '#fff',
    },
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(AthletesScreen);