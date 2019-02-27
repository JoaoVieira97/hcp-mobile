import React, { Component } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, StatusBar} from 'react-native';

export default class LoginForm extends Component {
    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#a5b1c2" />
                <TextInput
                    placeholder="E-mail"
                    placeholderTextColor="#fff"
                    onSubmitEditing={() => this.passwordInput.focus()}
                    keyboardType="email-address"
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#fff"
                    secureTextEntry
                    ref={(input) => this.passwordInput = input}
                    style={styles.input}
                />

                <TouchableOpacity style={styles.buttonContainer}>
                    <Text style={styles.buttonText}>LOGIN</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
    },
    input: {
        height: 50,
        backgroundColor: '#a5b1c2',
        marginBottom: 20,
        color: '#fff',
        paddingHorizontal: 10
    },
    buttonContainer: {
        backgroundColor: '#3742fa',
        borderColor: 'red',
        borderWidth: 3, borderRadius: 10,
        paddingVertical: 20,
        marginTop: 25,
        marginBottom: 50
    },
    buttonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
});