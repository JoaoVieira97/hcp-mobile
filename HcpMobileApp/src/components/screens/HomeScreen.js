import React from 'react';
import {
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

            const info = userRoles.data[i].full_name.split(" / ");

            this.setState({
                roles: [...this.state.roles, {name: info[1]}]
            });
        }
    }

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
                <Text style={{fontWeight: '700', fontSize: 20}}>{this.state.name}</Text>
                <Image style={{ width: 150, height: 100, marginVertical: 20}}
                       source={{uri: `data:image/png;base64,${this.state.image}`}}/>
                <View>
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
        alignItems: 'center',
        paddingLeft: 25,
        paddingRight: 25,
    }
});