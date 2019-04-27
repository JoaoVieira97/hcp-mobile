import React, {Component} from 'react';

import {View, FlatList, ActivityIndicator, Alert} from 'react-native';
import {ListItem, Avatar, Badge, SearchBar} from 'react-native-elements';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";
import _ from 'lodash';

class EchelonsScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            fullData: [],
            isLoading: true,
            isRefreshing: false,
            searchText: ''
        }
    };

    componentDidMount() {

        this.getEchelons();
    }


    async getEchelons() {

        const params = {
            domain: [
                ['id', '>=', '0'],

            ],
            fields: [ 'id', 'designacao'],
            order: 'id ASC',
        };

        let response = await this.props.odoo.search_read('ges.escalao', params);

        if(response.success){

            const paramsAthletes = {
                domain: [
                    ['id', '>=', '0'],

                ],
                fields: ['id', 'escalao'],
            };

            let athletes = await this.props.odoo.search_read('ges.atleta', paramsAthletes);
            const sizeAthletes = athletes.data.length;
            let numberAthletes = 0;

            const size = response.data.length;

            for (let i = 0; i < size; i++) {

                const responseEchelon = response.data[i];

                if (athletes.success) {

                    numberAthletes=0;

                    for (let j = 0; j < sizeAthletes; j++) {

                        const responseAthlete = athletes.data[j];

                        if (responseAthlete.escalao[0] === responseEchelon.id) numberAthletes++;
                    }
                }

                if(numberAthletes > 0) {

                    const echelon = {
                        'id': responseEchelon.id,
                        'denomination': responseEchelon.designacao,
                        'numberAthletes': numberAthletes,
                    };

                    this.setState(state => {

                        const data = [...state.data, echelon];

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

            this.setState({
                isLoading: false,
                isRefreshing: false
            });

        }

        else{

            this.setState({
                isLoading: false,
                isRefreshing: false
            });
        }

    }

    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.denomination + '   ( '+ item.numberAthletes+' )'}
                //subtitle={item.echelon}
                chevron={() => (
                    <Ionicons name="ios-arrow-up" color={'#c7c7c7'} size={13} />
                )}
                onPress={() => (
                    this.props.navigation.navigate('AthletesScreen', {echelon: item})
                )}
            />
        );
    };


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
                this.getEchelons()
            });
    };

    render() {

        return (
            <FlatList
                keyExtractor={item => item.denomination}
                data={this.state.data}
                renderItem={this.renderItem}
                ItemSeparatorComponent={this.renderSeparator}
                ListFooterComponent={this.renderFooter}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh}
            />
        );
    }
}



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(EchelonsScreen);