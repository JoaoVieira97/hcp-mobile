import React, {Component} from 'react';

import {View, FlatList, ActivityIndicator, Text} from 'react-native';
import {ListItem, Avatar} from 'react-native-elements';
import {connect} from 'react-redux';
import {colors} from "../../styles/index.style";


class EchelonsScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            isLoading: true,
            isRefreshing: false
        }
    };

    async componentDidMount() {

        await this.getEchelons();
    }

    /**
     * Get all echelons.
     * @returns {Promise<void>}
     */
    async getEchelons() {

        const params = {
            fields: [ 'id', 'designacao', 'idade_min', 'idade_max'],
            order: 'id ASC',
        };

        const response = await this.props.odoo.search_read('ges.escalao', params);
        if(response.success && response.data.length > 0){

            let data = [];
            for (let i = 0; i < response.data.length; i++) {

                let echelon = response.data[i];
                const params = {
                    kwargs: {
                        context: this.props.odoo.context,
                    },
                    model: 'ges.atleta',
                    method: 'search_count',
                    args: [
                        [['escalao', '=', echelon.id]],
                    ]
                };

                const responseCount = await this.props.odoo.rpc_call('/web/dataset/call_kw', params);
                if (responseCount.success && responseCount.data > 0) {

                    data.push({
                        'id': echelon.id,
                        'denomination': echelon.designacao,
                        'numberAthletes': responseCount.data,
                        'minAge': echelon.idade_min,
                        'maxAge': echelon.idade_max,
                    });
                }
            }

            this.setState({
                data: data,
                isLoading: false,
                isRefreshing: false
            });
        }
        else {
            this.setState({
                isLoading: false,
                isRefreshing: false
            });
        }

    }

    renderItem = ({ item, index }) => {

        let color = index%2 ?'#fff' : '#efefef';
        let avatar;
        if (item.denomination.includes('Sub'))
        {
            const echelonNumber = (item.denomination.split(' '))[1];
            avatar = (
                <Avatar
                    size="small"
                    rounded
                    title={'S' + echelonNumber}
                    activeOpacity={0.7}
                />
            );
        }
        else
            avatar = (
                <Avatar
                    size="small"
                    rounded
                    title={item.denomination.slice(0,1)}
                    activeOpacity={0.7}
                />
            );

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700'}}>
                            {'Escalão | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400'}}>
                            {item.denomination}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Número de atletas: ' + item.numberAthletes}
                        </Text>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{color: colors.darkGrayColor}}>
                                {'Idades: '}
                            </Text>
                            <Text style={{color: colors.darkGrayColor}}>
                                {item.minAge + ' - ' + item.maxAge}
                            </Text>
                        </View>
                    </View>
                )}
                leftAvatar={avatar}
                chevron
                containerStyle={{
                    backgroundColor: color
                }}
                onPress={() => (
                    this.props.navigation.navigate('AthletesScreen', {echelon: item})
                )}
            />
        );
    };

    renderFooter = () => {

        return (
            <View style={{
                paddingVertical: 20,
                //borderTopWidth: 1,
                //borderTopColor: '#c9cbc9'
            }}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator
                        size={'large'}
                        color={colors.loadingColor}
                    />
                }
            </View>
        );
    };

    handleRefresh = () => {
        this.setState({
                data: [],
                isRefreshing: true,
                isLoading: false
            },
            async () => {
                await this.getEchelons()
            });
    };

    render() {

        return (
            <FlatList
                keyExtractor={item => item.denomination}
                data={this.state.data}
                renderItem={this.renderItem}
                ListFooterComponent={this.renderFooter.bind(this)}
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