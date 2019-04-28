import React, {Component} from 'react';

import {View, FlatList, ActivityIndicator, Alert, TouchableOpacity, StyleSheet} from 'react-native';
import {ListItem, Avatar, Badge, SearchBar, Icon} from 'react-native-elements';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import _ from 'lodash';
import CustomText from "../CustomText";


class AthletesScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            echelon:{},
            position:'',
            data: [],
            fullData: [],
            isLoading: true,
            isRefreshing: false,
            searchText: ''
        }
    };

    async componentDidMount() {

        await this.setState({
            echelon: this.props.navigation.getParam('echelon'),
        });

        console.log(this.state.echelon);

        await this.getAthletesByEchelon(this.state.echelon.id);
    }

    /**
     * Define header navigation options.
     */

    static navigationOptions = ({navigation}) => ({
        //transitionConfig: () => fromBottom(600),
        headerTitle: //'Atletas',
            <CustomText
                type={'bold'}
                children={'ATLETAS'}
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

    async getAthletesByEchelon(echelonId) {

        const params = {
            domain: [
                ['id', '>=', '0'],

            ],
            fields: ['id', 'user_id', 'display_name', 'image', 'escalao', 'numerocamisola', 'posicao'],

            order:  'posicao DESC, numerocamisola ASC',
        };

        await this.props.odoo.search_read('ges.atleta', params)
            .then(async response => {

                if (response.success) {
                    const size = response.data.length;
                    for (let i = 0; i < size; i++) {

                        const aux = response.data[i];
                        if (aux.escalao[0] === echelonId) {

                            const athlete = {
                                'name': aux.display_name,
                                'image': aux.image,
                                'squad_number': aux.numerocamisola,
                                'echelon': this.state.echelon.denomination,
                                'user_id': aux.user_id[0],
                                'position': aux.posicao,
                            };

                            this.setState(state => {

                                const data = [...state.data, athlete];

                                return {
                                    data
                                }
                            }, () => {
                                this.setState({
                                    fullData: this.state.data
                                });
                            });
                        }
                    }
                }
            })
            .then(() => {
                this.setState({
                    isLoading: false,
                    isRefreshing: false
                });
            })
            .catch(error => {
                this.setState({
                    isLoading: false,
                    isRefreshing: false
                });
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
                    status="primary"
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
    }

    renderItem =  ({item}) => {
        return (
            <ListItem
                title={item.name}
                subtitle={item.echelon}
                leftElement={this.renderPosition(item)}
                leftAvatar={this.leftAvatar(item.image, item.squad_number.toString())}
                chevron={() => (
                    <Ionicons name="ios-arrow-up" color={'#c7c7c7'} size={13}/>
                )}
                onPress={() => (
                    this.props.navigation.navigate('AthleteScreen', {athlete: item})
                )}
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

        if(!this.state.isLoading) {
            return null;
        }

        return (
            <View style={{
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#ced0ce'
            }}>
                <ActivityIndicator
                    size={'large'}
                    color={'#ced0ce'}
                />
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
        () => {
            this.getAthletesByEchelon(this.state.echelon.id)
        });
    };

    render() {

        return (
            <FlatList
                keyExtractor={item => item.name}
                data={this.state.data}
                renderItem={this.renderItem}
                ItemSeparatorComponent={this.renderSeparator}
                ListHeaderComponent={this.renderHeader}
                ListFooterComponent={this.renderFooter}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
                //onEndReached={this.handleLoadMore}
                //onEndReachedThreshold={0.15}
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