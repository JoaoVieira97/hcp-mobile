import React from 'react';
import {
    AsyncStorage,
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Text} from 'react-native';

import Logo from '../components/Logo';

export default class OtherScreen extends React.Component {

    render() {

        const _signOutAsync = async () => {
            await AsyncStorage.clear();
            this.props.navigation.navigate('Auth');
        };

        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <Logo size={"big"}/>
                <View style={{marginTop: 20}}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={_signOutAsync}>
                        <Text
                            style={styles.loginText}>
                            {'Logout'.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#fea484"
    },
    loginButton: {
        backgroundColor: '#ad2e53',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
        height: 50,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    loginText: {
        textTransform: 'uppercase',
        fontWeight: "600",
        fontSize: 18,
        color: "#fff"
    }
});