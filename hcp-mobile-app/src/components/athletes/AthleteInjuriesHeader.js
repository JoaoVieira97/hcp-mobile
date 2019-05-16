import React, { Component } from 'react';

import {StyleSheet, View} from 'react-native';
import CustomText from "../CustomText";
import {Avatar} from "react-native-elements";


export default class AthleteInjuriesHeader extends Component {
    render() {

        let childImage;
        if(this.props.athleteImage !== false) {
            childImage = (
                <Avatar
                    size={65}
                    rounded
                    source={{uri: `data:image/png;base64,${this.props.athleteImage}`}}
                />
            );
        }
        else{
            childImage = (
                <Avatar
                    size={65}
                    rounded
                    source={require('../../../assets/user-account.png')}
                />
            )
        }

        return (
            <View style={styles.athleteContainer}>
                {childImage}
                <CustomText
                    style={{marginTop: 10}}
                    type={'bold'}
                    children={this.props.athleteName}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    athleteContainer: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        //shadow
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