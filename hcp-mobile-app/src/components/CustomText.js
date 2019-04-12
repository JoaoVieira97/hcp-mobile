import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default class CustomText extends Component {
    setFontType = type => {
        switch (type) {
            case 'bold':
                return 'Montserrat-Bold';
            case 'semi-bold':
                return 'Montserrat-SemiBold';
            case 'extra-light':
                return 'Montserrat-ExtraLight';
            default:
                return 'Montserrat-Regular';
        }
    };

    render() {
        const font = this.setFontType(this.props.type ? this.props.type : 'normal');
        const style = [{fontFamily: font}, this.props.style || {}];
        const allProps = Object.assign({}, this.props, {style: style});
        return <Text {...allProps}>{this.props.children}</Text>;
    }
}
