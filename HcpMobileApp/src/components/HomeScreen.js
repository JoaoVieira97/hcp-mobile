import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Text} from 'react-native';

import Logo from '../components/Logo';

export default class HomeScreen extends React.Component {

    render() {

        const handlePress = () => {
            this.props.navigation.navigate('Other');
        };

        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <Logo size={"big"}/>
                <View style={{marginTop: 20}}>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handlePress}>
                        <Text
                            style={styles.loginText}>
                            {'Continue'.toUpperCase()}
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
        width: '100%'
    },
    loginButton: {
        backgroundColor: '#ad2e53',
        shadowColor: 'rgba(0,0,0, .4)', // IOS
        shadowOffset: { height: 1, width: 1 }, // IOS
        shadowOpacity: 1, // IOS
        shadowRadius: 1, //IOS
        elevation: 2, // Android
        height: 50,
        width: "100%",

        flexDirection: 'row',

    },
    loginText: {
        textTransform: 'uppercase',
        textAlign: 'center',
        fontWeight: "600",
        fontSize: 18,
        color: "#fff"
    }
});