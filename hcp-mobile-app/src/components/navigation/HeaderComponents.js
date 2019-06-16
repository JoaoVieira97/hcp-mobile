import {TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import CustomText from "../CustomText";
import React from "react";
import {LinearGradient} from "expo";
import {colors} from "../../styles/index.style";

// ---------------------------------------------------------------------
// HEADER SETTINGS
// ---------------------------------------------------------------------

export const linearGradientHeader = () => {
    return (
        <LinearGradient
            colors={[colors.gradient1, colors.gradient2]}
            style={{ flex: 1 }}
            start={[0, 0]}
            end={[0.8, 0]}
        />
    );
};

export const openDrawerButton = (color, navigation) => {
    return (
        <TouchableOpacity style={{
            width: 50,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 10}} onPress = {() => navigation.openDrawer()}>
            <Ionicons
                name="md-menu"
                size={28}
                color={color}/>
        </TouchableOpacity>
    );
};

export const closeButton = (color, navigation) => {
    return (
        <TouchableOpacity style={{
            width: 50,
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 5}} onPress = {() => navigation.goBack()}>
            <Ionicons
                name="md-arrow-back"
                size={28}
                color={color} />
        </TouchableOpacity>
    );
};

export const headerTitle = (color, title) => {
    return (
        <CustomText
            type={'bold'}
            numberOfLines={1}
            ellipsizeMode='tail'
            children={title}
            style={{
                color: color,
                fontSize: 16
            }}
        />
    );
};