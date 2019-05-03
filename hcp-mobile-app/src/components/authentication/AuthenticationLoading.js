import React from 'react';
import Loader from '../screens/Loader';
import Authentication from './Authentication';
import {View} from "react-native-animatable";
import {Alert, AsyncStorage} from "react-native";


export default class AuthenticationLoading extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true
        };
    }

    async componentDidMount() {

        const auth = new Authentication();
        const isAuthenticated = await auth.checkIfUserIsAuthenticated();

        await this.setState({isLoading: false}, async () => {

            if (isAuthenticated) {
                const isSuccess = await auth.userLogin(isAuthenticated);

                if(isSuccess === "success") {
                    this.props.navigation.navigate('AppStack');
                }
                else if(isSuccess === "fail") {

                    Alert.alert(
                        "Erro",
                        "Ocorreu um erro durante o arranque da aplicação. Por favor, efetue login novamente."
                    );
                    await AsyncStorage.clear();
                    this.props.navigation.navigate('Authentication');
                }
                else {
                    Alert.alert("Erro", "A conexão ao servidor foi interrompida.");
                    await AsyncStorage.clear();
                    this.props.navigation.navigate('Authentication');
                }
            }
            else {
                await AsyncStorage.clear();
                this.props.navigation.navigate('Authentication');
            }
        });
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Loader isLoading={this.state.isLoading}/>
            </View>
        );
    }
}