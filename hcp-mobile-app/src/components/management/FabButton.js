import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";


export default class FabButton extends Component {

    onPressHandler = () => {
        this.props.flatListRef.scrollToOffset({animated: true, offset: 0});
    };

    render() {
        return (
            <TouchableOpacity
                style={styles.fab}
                onPress={this.onPressHandler}>
                <Ionicons
                    name="md-arrow-up"
                    size={28}
                    color={'#fff'}/>
            </TouchableOpacity>
        );
    }
}

FabButton.propTypes = {
    flatListRef: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: colors.redColor,
        borderRadius: 30,
        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});