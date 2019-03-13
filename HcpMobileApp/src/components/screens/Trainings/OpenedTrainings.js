import React, {Component} from 'react';
import {View, FlatList, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {ListItem, Button} from 'react-native-elements';

import {connect} from 'react-redux';
import {Ionicons} from "@expo/vector-icons";



class OpenedTrainings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            trainingInfoList: [],
            trainingsFetched: 0,
            isLoaded: false,
            isRefreshing: false
        };
    }

    async componentDidMount() {

        await this.setState({
            trainingIds: this.props.navigation.getParam('ids', [])
        });


        if(this.state.trainingIds.length > 0) {

            for (let i = 0; i < this.state.trainingIds.length && i < 10; i++) {

                const training = await this.getTraining(this.state.trainingIds[i]);

                if (training) {

                    this.setState(state => {

                        const trainingInfoList = [...state.trainingInfoList, training];

                        return {
                            trainingInfoList
                        }
                    });
                }
            }

            await this.setState({
                isLoaded: true,
                trainingsFetched:  this.state.trainingIds.length > 10 ? 10 : 0
            });

            console.log(this.state.trainingsFetched);
        }
    }

    async getTraining(id) {

        const params = {
            ids: [id],
            fields: [
                'id',
                'display_start',
                'local',
                'escalao',
                'duracao',
                'convocatorias'],
        };

        const response = await this.props.odoo.get('ges.evento_desportivo', params);
        if (response.success) {

            return response.data[0];
        }

        return null;
    }

    async fetchMoreData() {

        if(this.state.trainingIds.length > this.state.trainingsFetched) {

            for (let i = this.state.trainingsFetched; i < this.state.trainingIds.length; i++) {

                const training = await this.getTraining(this.state.trainingIds[i]);

                if (training) {

                    this.setState(state => {

                        const trainingInfoList = [...state.trainingInfoList, training];

                        return {
                            trainingInfoList
                        }
                    });
                }
            }

            await this.setState({
                trainingsFetched:  this.state.trainingIds.length
            });

            console.log("MORE")
        }
    }



    icon = (type) => (<Ionicons name={type} size={27} style={{paddingBottom: 5}}/>);

    subtitle = (local, echelon) => (
        <View>
            <Text style={{color: '#919391'}}>{local}</Text>
            <Text style={{color: '#919391'}}>{echelon}</Text>
        </View>
    );

    renderItem = ({ item }) => {

        return (
            <ListItem
                title={item.display_start}
                subtitle={this.subtitle(item.local[1], item.escalao[1])}
                leftAvatar={this.icon('md-hourglass')}
                chevron
            />
        );
    };

    render() {

        if (this.state.isLoaded) {

            return (
                <View>
                    <FlatList
                        keyExtractor={item => item.id.toString()}
                        data={this.state.trainingInfoList}
                        renderItem={this.renderItem}
                        refreshing={this.state.isRefreshing}
                        onRefresh={() => (console.log("Refreshed!"))}
                        onEndReached={() => (console.log("End Reached"))}
                        onEndReachedThreshold={0.5}
                        //ListFooterComponent={}
                    />
                </View>
            );
        }

        return (
            <View style={styles.container}>
                <ActivityIndicator
                    size={'large'}
                    color={'#ced0ce'}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    }
});

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedTrainings);