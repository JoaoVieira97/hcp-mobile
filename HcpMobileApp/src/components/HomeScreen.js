import React from 'react';
import {
    AsyncStorage,
    Button,
    View,
    Text
} from 'react-native';





export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    async handlePress () {

        //const odoo = this.props.navigation.getParam('odoo', null);

        if(global.odoo) {
            const  params = {
                ids: [1,2,3,4,5],
                fields: [ 'name' ],
            };

            await global.odoo.get('res.partner', params)
                .then(response => { console.log(response) })
                .catch(e => {console.log(e)});
        }

        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    };

    render() {

        return (

            <View style={{flex: 1, justifyContent: 'center'}}>
                <Button
                    onPress={this.handlePress.bind(this)}
                    title="Logout"
                    color="#ad2e53"
                />
                <Text>OLA</Text>
            </View>
        );
    }
}
