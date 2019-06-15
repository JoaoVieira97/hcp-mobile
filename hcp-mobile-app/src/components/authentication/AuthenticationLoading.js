import React from 'react';
import Loader from '../screens/Loader';
import Authentication from './Authentication';
import {View} from "react-native-animatable";
import {Alert, AsyncStorage, Image, StyleSheet, ActivityIndicator, Dimensions} from "react-native";
import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";


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
                    const stackName = await Authentication.getUserDrawerNavigator();
                    this.props.navigation.navigate(stackName);
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
            <View style={styles.container}>
                <Image style={styles.img} source={require('../../../assets/logo.png')} />
                <View style={styles.activityContainer}>
                    <ActivityIndicator
                        size={25}
                        color={colors.blueColor}
                    />
                </View>
                <View style={styles.activityContainer}>
                    <CustomText
                        type={'bold'}
                        children={'A CARREGAR...'}
                        style={styles.activityTitle}
                    />
                </View>
            </View>
        );
    }
}

const window = Dimensions.get('window');
const IMAGE_HEIGHT = window.width / 3;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.grayColor
    },
    img: {
        height: IMAGE_HEIGHT,
        resizeMode: 'contain'
    },
    activityContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    activityTitle: {
        color: colors.blueColor,
        fontSize: 10,
        letterSpacing: 3
    },
});
