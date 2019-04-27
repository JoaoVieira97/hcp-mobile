import { StyleSheet } from 'react-native';

export const colors = {

    grayColor: '#dbdbdb',
    darkGrayColor: '#919391',
    redColor: '#ad2e53',
    blueColor: '#0000e5',

    // GRADIENT COLORS
    gradient1: '#ad2e53', // used in AppNavigator
    gradient2: '#2f2d3b',

    // LOADING INDICATOR
    loadingColor: '#ced0ce', //'#0000e5'

    // TRAINING and GAME COLORS
    gameColor: '#ef9c88', //'#fab1a0',
    trainingColor: '#30c9c9', //'#81ecec'

    // DELETE
    // --------------------------------------------
    background1: '#d7e8ff', // used in LoginScreen

    blueText: '#0000e5',
    redText: '#ad2e53',
    greyText: '#a2a2a2',
    // --------------------------------------------
};


export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background1
    }
});