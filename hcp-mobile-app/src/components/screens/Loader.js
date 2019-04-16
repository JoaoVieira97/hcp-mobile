import React from 'react';
import {
    StyleSheet,
    View,
    Modal,
    ActivityIndicator,
} from 'react-native';

import {colors} from "../../styles/index.style";


const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    activityIndicatorHolder: {
        //backgroundColor: '#FFFFFF',
        height: 100,
        width: 100,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
});


const Loader = (props) => {
    const {
        isLoading,
        ...attributes
    } = props;

    return (
        <Modal
            transparent
            animationType={'none'}
            visible={isLoading}
            onRequestClose={() => { console.log('Noop'); }}
        >
            <View style={{...styles.modalBackground}}>
                <View style={styles.activityIndicatorHolder}>
                    <ActivityIndicator
                        animating={isLoading}
                        size={"large"}
                        color={colors.loadingColor}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default Loader;
