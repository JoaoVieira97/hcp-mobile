import React from 'react';
import {
    AsyncStorage,
    Button,
    StyleSheet, View
} from 'react-native';


import Icon from 'react-native-vector-icons/FontAwesome';
import { BottomNavigation, Text } from 'react-native-paper';

export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state  = {
            index: 0,
            routes: [
                { key: 'music', title: 'Music', icon: 'queue-music', color: '#3F51B5' },
                { key: 'albums', title: 'Albums', icon: 'album', color: '#009688' },
                { key: 'recents', title: 'Recents', icon: 'history', color: '#795548' },
                { key: 'purchased', title: 'Purchased', icon: 'shopping-cart', color: '#607D8B' },
            ]
        };
    }

    MusicRoute = () => (<View style={{flex: 1, justifyContent: 'center'}}>
        <Button
            onPress={this.handlePress.bind(this)}
            title="Logout"
            color="#ad2e53"
            accessibilityLabel="Learn more about this purple button"
        />
    </View>);

    _handleIndexChange = index => this.setState({ index });

    _renderScene = BottomNavigation.SceneMap({
        music: this.MusicRoute,
        albums: AlbumsRoute,
        recents: RecentsRoute,
        purchased: PurchasedRoute
    });


    async handlePress () {

        const odoo = this.props.navigation.getParam('odoo', null);

        if(odoo) {
            const  params = {
                ids: [1,2,3,4,5],
                fields: [ 'name' ],
            };

            await odoo.get('res.partner', params)
                .then(response => { console.log(response) })
                .catch(e => {});
        }

        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    };

    render() {

        const handlePress = () => {
            this.props.navigation.navigate('Other');
        };

        const myIcon = <Icon name="rocket" size={30} color="#900" />;

        return (
            <BottomNavigation
                navigationState={this.state}
                onIndexChange={this._handleIndexChange}
                renderScene={this._renderScene}
            />
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    loginButton: {
        backgroundColor: '#ad2e53',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
        height: 50,
        width: "100%",

        flexDirection: 'row',

    },
    loginText: {
        textTransform: 'uppercase',
        textAlign: 'center',
        fontWeight: "600",
        fontSize: 18,
        color: "#fff"
    }
});


const AlbumsRoute = () => <Text>Albums</Text>;

const RecentsRoute = () => <Text>Recents</Text>;

const PurchasedRoute = () => <Text>Purchased</Text>;