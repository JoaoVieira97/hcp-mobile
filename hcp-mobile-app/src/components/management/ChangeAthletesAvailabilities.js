import React, { Component } from 'react';

import {FlatList, TouchableOpacity, View} from 'react-native';
import CustomText from "../CustomText";
import {Ionicons} from "@expo/vector-icons";
import {Avatar, Badge, CheckBox, ListItem} from "react-native-elements";
import {colors} from "../../styles/index.style";
import { Snackbar } from 'react-native-paper';


export default class ChangeAthletesAvailabilities extends Component {

    constructor(props) {
        super(props);

        this.state = {
            athletes: [],
            stateChanged: false,
            snackIsVisible: false,
        };
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
                children={'DISPONIBILIDADES'}
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

    async componentWillMount() {

        await this.setState({
            athletes: this.props.navigation.state.params.athletes
        });
    }

    /**
     * Change athlete availability.
     * @param athleteId
     * @returns {Promise<void>}
     */
    async changeAvailability(athleteId) {

        // call component function
        const response = await this.props.navigation.state.params.availabilityFunction(athleteId);

        if(response.success) {

            await this.setState({athletes: response.athletes});

            await this.setState((state) => ({
                stateChanged: !state.stateChanged
            }));

        } else {
            this.setState({snackIsVisible: true});
        }
    }

    /**
     * Athlete image for list item.
     * @param img
     * @param squad_number
     * @returns {*}
     */
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

    /**
     * Athlete item.
     * @param item
     * @param index
     * @returns {*}
     */
    renderItem =  ({item, index}) => {

        const checkbox = (
            <CheckBox
                iconRight
                checked={item.available}
                onPress={async () => {await this.changeAvailability(item.id)}}
                size = {30}
                containerStyle={{ marginRight: 5, padding: 0, backgroundColor: 'transparent', borderColor: 'transparent'}}
                checkedColor={colors.availableColor}
                uncheckedColor={colors.notAvailableColor}
            />
        );

        return (
            <ListItem
                title={item.name}
                subtitle={item.echelon}
                leftAvatar={this.leftAvatar(item.image, item.squad_number.toString())}
                rightElement={checkbox}
                containerStyle={{
                    backgroundColor: index % 2 === 0 ? colors.lightGrayColor : '#fff'
                }}
            />
        );
    };

    render() {
        return (
            <View>
                <FlatList
                    keyExtractor={item => item.id + item.name}
                    data={this.state.athletes}
                    extraData = {this.state.stateChanged}
                    renderItem={this.renderItem}
                />
                <Snackbar
                    visible={this.state.snackIsVisible}
                    onDismiss={() => this.setState({ visible: false })}
                    action={{
                        label: 'Ok',
                        onPress: () => {this.setState({snackIsVisible: false})},
                    }}
                    theme={{ colors: { accent: colors.redColor }}}
                >
                    {'Ocorreu um erro ao alterar a disponibilidade.'}
                </Snackbar>
            </View>
        );
    }
}