import React from 'react';
import Authentication from './Authentication';
import {View} from "react-native-animatable";
import {Alert, AsyncStorage, Image, StyleSheet, ActivityIndicator, Dimensions, BackHandler} from "react-native";
import {colors} from "../../styles/index.style";
import CustomText from "../CustomText";
import {connect} from "react-redux";


class AuthenticationLoading extends React.Component {

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

        const auth = new Authentication();
        const isAuthenticated = await auth.checkIfUserIsAuthenticated();

        await this.validateAuthentication(auth, isAuthenticated);
    }


    async validateAuthentication (auth, isAuthenticated) {

        if (isAuthenticated) {
            const isSuccess = await auth.userLogin(isAuthenticated);

            if(isSuccess === "app-error") {

                Alert.alert(
                    "Erro da aplicação",
                    "Ocorreu um erro inesperado. Recomendamos que limpe a cache da aplicação."
                );
                this.props.navigation.navigate('Authentication');
                //await AsyncStorage.clear();
                await auth.userLogout();
            }
            else if(isSuccess === "success") {

                // if user has a valid groups
                if(this.props.user.groups.length > 0) {
                    const stackName = await Authentication.getUserDrawerNavigator();
                    this.props.navigation.navigate(stackName);
                }
                else {
                    Alert.alert(
                        "Erro de autenticação",
                        "Por favor, verifique com o administrador os acessos à aplicação."
                    );
                    //await AsyncStorage.clear();
                    await auth.userLogout();
                    this.props.navigation.navigate('Authentication');
                }
            }
            else if(isSuccess === "fail") {

                Alert.alert(
                    "Erro de autenticação",
                    "A sua autenticação já não é válida. Por favor, efetue login novamente."
                );
                //await AsyncStorage.clear();
                await auth.userLogout();
                this.props.navigation.navigate('Authentication');
            }
            else {
                Alert.alert(
                    "Erro de conexão",
                    "Não é possível estabelecer uma conexão com o servidor.",
                    [
                        {
                            text: 'Fechar',
                            style: 'cancel',
                            onPress: () => {
                                BackHandler.exitApp();
                            },
                        }, {
                            text: 'Voltar a tentar',
                            onPress: async () => {
                                await this.validateAuthentication(auth, isAuthenticated);
                            }
                        },
                    ],
                    {cancelable: true},
                );
            }
        }
        else {
            //await AsyncStorage.clear();
            await auth.userLogout();
            this.props.navigation.navigate('Authentication');
        }
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

const mapStateToProps = state => ({user: state.user});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AuthenticationLoading);
