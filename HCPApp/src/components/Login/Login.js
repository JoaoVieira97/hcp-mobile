import React, { Component } from 'react';
import { StyleSheet, View, Image, Text, KeyboardAvoidingView } from 'react-native';
import LoginForm from './LoginForm'

export default class Login extends Component {
    render() {
        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../images/hcp.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.description}>
                        Construído a pensar em si e no seu clube!
                    </Text>
                </View>
                <View style={styles.formContainer}>
                    <LoginForm />
                </View>
                <View style={styles.helpContainer}>
                    <Text style={styles.helpText}>
                        Precisa de ajuda?
                    </Text>
                    <Text style={styles.helpText}>
                        Contacte a direção do clube: direcao@hcp.pt
                    </Text>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#dfe4ea'
    },
    logo: {
        width: 150,
        height: 150,
    },
    logoContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center',
        marginTop: 30
    },
    description: {
        color: '#4834d4',
        opacity: 0.8,
        width: 200,
        marginTop: 15,
        textAlign: 'center'
    },
    helpContainer: {
        marginBottom: 5
    },
    helpText: {
        color: '#4834d4',
        opacity: 0.6,
        textAlign: 'center'
    }
});