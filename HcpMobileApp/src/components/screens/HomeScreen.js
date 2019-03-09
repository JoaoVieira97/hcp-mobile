import React from 'react';
import {
    Button,
    View,
    Image,
    StyleSheet,
    Text,
} from 'react-native';

import {connect} from 'react-redux';


class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: null,
            image: null,
            roles: []
        }
    }

    static navigationOptions = {
        headerTitle: 'Início',
    };


    async componentDidMount() {

        this.setState({
            'name': this.props.user.name,
            'image': this.props.user.image,
            'roles': []
        });

        const params = {
            ids: this.props.user.roles,
            fields: ['id', 'full_name'],
        };

        const userRoles = await this.props.odoo.get(
            'res.groups',
            params
        );

        for (let i = 0; i < userRoles.data.length; i++) {

            //if (userRoles.data[i].id >= 24 && userRoles.data[i].id <= 35) {

                const info = userRoles.data[i].full_name.split(" / ");

                this.setState({
                    roles: [...this.state.roles, {name: info[1]}]
                });
            //}
        }
    }

    async handlePress() {

        let params = {
            domain: [['id', '>=', '0']],
            fields: ['id'],
        };

        const allGroupsIDs = await this.props.odoo.search(
            'res.groups',
            params
        );

        params = {
            ids: allGroupsIDs.data,
            fields: ['id', 'full_name'],
        };

        const allGroupsNames = await this.props.odoo.get(
            'res.groups',
            params
        );

        console.log(allGroupsNames.data);
    };

    render() {

        const displayRoles = this.state.roles.map((data, index) => {
            return (
                <Text key={index}>
                    {data.name}
                </Text>
            );
        });

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
                <View style={{paddingTop: 20}}>
                    {displayRoles}
                </View>
            </View>
        );
    }
}


const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 25,
        paddingRight: 25,
    }
});