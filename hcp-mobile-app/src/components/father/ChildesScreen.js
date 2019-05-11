import React, { Component } from 'react';
import { connect } from 'react-redux';

import {ActivityIndicator, Alert, FlatList, View} from 'react-native';
import {ListItem, Avatar, Badge} from 'react-native-elements';
import moment from 'moment';
import {colors} from "../../styles/index.style";


class ChildesScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            isRefreshing: false,
            childes: []
        }
    }

    async componentDidMount() {

        await this.fetchChildes();

        await this.setState({isLoading: false});
    }

    /**
     * Fetch father's childes.
     * @returns {Promise<void>}
     */
    async fetchChildes () {

        // get user father id
        const fatherInfo = this.props.user.groups.filter(group => group.name === 'Pai');
        if(fatherInfo) {

            const fatherId = fatherInfo[0].id;

            const params = {
                ids: [fatherId],
                fields: ['filhos']
            };

            const response = await this.props.odoo.get('ges.pai', params);
            if (response.success && response.data.length > 0) {

                const childesIds = response.data[0].filhos;
                if (childesIds.length > 0) {
                    await this.fetchChildesInfo(childesIds);
                    return ;
                }
            }

            Alert.alert(
                'Erro',
                'Não existem filhos associados. Por favor, contacte o administrador.',
                [
                    {text: 'OK', onPress: () => this.props.navigation.goBack()}
                ],
                {cancelable: false},
            );
        }
    }

    /**
     * Fetch childes information.
     * @param ids
     * @returns {Promise<void>}
     */
    async fetchChildesInfo(ids) {

        const params = {
            ids: ids,
            fields: ['id', 'display_name', 'escalao', 'numerocamisola', 'image', 'birthdate', 'email']
        };

        const response = await this.props.odoo.get('ges.atleta', params);
        if (response.success && response.data.length > 0) {

            const currDate = moment();
            const childes = response.data.map(item => {

                let childAge;
                let childBirth = null;
                let childBirthay = null;
                if(item.birthdate) {
                    childBirth = moment(item.birthdate);
                    childAge = currDate.diff(childBirth, 'years');

                    childBirthay =
                        item.birthdate.slice(8,10) + '/' +
                        item.birthdate.slice(5,7) + '/' +
                        item.birthdate.slice(0,4);
                }

                return {
                    'id': item.id,
                    'name': item.display_name,
                    'email': item.email ? item.email : 'Não definido',
                    'birthday': item.birthdate ? childBirthay : 'Não definida',
                    'age': item.birthdate ? childAge + ' anos' : "Idade não definida",
                    'squadNumber': item.numerocamisola,
                    'echelon': item.escalao[1],
                    'image': item.image
                }
            });

            if(childes.length > 0)
                this.setState({childes: childes});
        }
    }

    /**
     * Left Avatar for the childes list.
     * @param image
     * @param squadNumber
     * @returns {*}
     */
    leftAvatar = (image, squadNumber) => {

        let avatar;

        if (image) {
            avatar = (
                <Avatar
                    rounded
                    source={{
                        uri: `data:image/png;base64,${image}`,
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
                    value={squadNumber}
                    badgeStyle={{backgroundColor: '#000' }}
                    containerStyle={{ position: 'absolute', bottom: -4, right: -4 }}
                />
            </View>
        );
    };

    /**
     * Render list item
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem = ({item, index}) => {

        const bgColor = index%2===0 ? colors.lightGrayColor : '#fff';
        return (
            <ListItem
                title={item.name}
                subtitle={item.age}
                leftAvatar={this.leftAvatar(item.image, item.squadNumber.toString())}
                chevron={true}
                containerStyle={{backgroundColor: bgColor}}
                onPress={() => this.props.navigation.navigate('ChildScreen', {child: item})}
            />
        );
    };

    /**
     * Render list footer.
     * @returns {*}
     */
    renderFooter = () => {
        return (
            <View style={{paddingVertical: 20,}}>
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

    /**
     * When user refreshes the screen.
     * @returns {Promise<void>}
     */
    handleRefresh = async () => {

        await this.setState({
            childes: [],
            isRefreshing: true,
            isLoading: false
        });

        await this.fetchChildes();

        this.setState({isRefreshing: false});
    };

    render() {

        return (
            <FlatList
                keyExtractor={item => item.id + item.name}
                data={this.state.childes}
                renderItem={this.renderItem}
                ListFooterComponent={this.renderFooter.bind(this)}
                refreshing={this.state.isRefreshing}
                onRefresh={this.handleRefresh.bind(this)}
                onEndReachedThreshold={0}
            />
        );
    }
}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ChildesScreen);