import React, {Component} from 'react';

import {View, Text, FlatList} from 'react-native';
import {ListItem, Avatar, Badge} from 'react-native-elements';
import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";


class AthletesScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            athletes_sub_20: []
        }
    };

    static navigationOptions = {
        headerTitle: 'Atletas',
    };

    async componentDidMount() {

        await this.getAthletesSub20();
    }


    async getAthletesSub20() {

        const params = {
            domain: [
                ['id', '>=', '0'], // ['posicao', '=', 'CP']

            ],
            fields: ['id', 'display_name', 'image', 'escalao', 'numerocamisola' ],
            order:  'numerocamisola ASC',
        };

        let response = await this.props.odoo.search_read('ges.atleta', params);
        if (response.success) {

            const size = response.data.length;
            for (let i = 0; i < size; i++) {

                const aux = response.data[i];
                if (aux.escalao[0] === 8) {

                    console.log(aux);
                    const athlete = {
                        'name': aux.display_name,
                        'image': aux.image,
                        'squad_number': aux.numerocamisola,
                        'echelon': aux.escalao[1]
                    };

                    this.setState(state => {

                        const athletes_sub_20 = [...state.athletes_sub_20, athlete];

                        return {
                            athletes_sub_20
                        }
                    });
                }
            }
        }
    }

    leftAvatar = (img, squad_number) => {

        if (img) {
            return (
                <View>
                    <Avatar
                        rounded
                        source={{
                            uri: `data:image/png;base64,${img}`,
                        }}
                        size="medium"
                    />

                    <Badge
                        value={squad_number}
                        status="primary"
                        badgeStyle={{backgroundColor: '#000' }}
                        containerStyle={{ position: 'absolute', bottom: 4, right: -4 }}

                    />
                </View>
            );
        }

        return (
            <View>
                <Ionicons name="md-person" color={'#979797'} size={65} />
                <Badge
                    value={squad_number}
                    status="primary"
                    badgeStyle={{backgroundColor: '#000' }}
                    containerStyle={{ position: 'absolute', bottom: 4, right: -4 }}

                />
            </View>
        );
    };

    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.name}
                subtitle={item.echelon}
                leftAvatar={this.leftAvatar(item.image, item.squad_number.toString())}
            />
        );
    };


    render() {
        return (
            <View style={{flex: 1}}>
                <FlatList
                    keyExtractor={item => item.name}
                    data={this.state.athletes_sub_20}
                    renderItem={this.renderItem}
                />
            </View>
        );
    }
}



const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(AthletesScreen);