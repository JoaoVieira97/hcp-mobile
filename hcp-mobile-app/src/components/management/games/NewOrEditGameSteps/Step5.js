import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {colors} from "../../../../styles/index.style";



class Step5 extends Component {

    render() {
        return (
            <View>
                <Text>Step 5</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({

});

const mapStateToProps = state => ({

    newOrEditGame: state.newOrEditGame
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Step5);