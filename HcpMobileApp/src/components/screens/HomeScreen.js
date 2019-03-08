import React from 'react';
import {
    AsyncStorage,
    Button,
    View,
    Image,
    StyleSheet,
    Text
} from 'react-native';





export default class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            image: null
        }
    }

    static navigationOptions = {
        headerTitle: 'Início',
    };

    async componentDidMount() {

        // Get User image
        if(global.odoo) {

            const userID = await AsyncStorage.getItem('userid');

            const  params = {
                ids: [parseInt(userID)],
                fields: [ 'image', 'name' ],
            };

            let response = await odoo.get('res.users', params );
            if(response.success) {

                this.setState({
                    'image': response.data[0].image,
                    'name': response.data[0].name
                });
            }
        }
    }

    async handlePress() {

        if (global.odoo) {

            let params = {
                domain: [['id', '>=', '0']],
                fields: ['id'],
            };

            const allGroupsIDs = await global.odoo.search('res.groups', params);

            params = {
                ids: allGroupsIDs.data,
                fields: ['id', 'full_name'],
            };

            const allGroupsNames = await global.odoo.get('res.groups', params);
            console.log(allGroupsNames.data);
        }

        // this.props.navigation.navigate('TestScreen');
    };

    render() {

        return (

            <View style={styles.container}>
                <Text style={{fontWeight: '600', fontSize: 18}}>{this.state.name}</Text>
                <Image style={{ width: 250, height: 200, marginBottom: 20}}
                       source={{uri: `data:image/png;base64,${this.state.image}`}}/>
                <Button
                    onPress={this.handlePress.bind(this)}
                    title="GET DATA"
                    color="#ad2e53"
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 25,
        paddingRight: 25,
    }
});