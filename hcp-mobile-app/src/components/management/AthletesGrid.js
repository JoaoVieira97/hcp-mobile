import React, { Component } from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {SectionGrid} from "react-native-super-grid";
import {colors} from "../../styles/index.style";



export default class AthletesGrid extends Component {

    constructor(props) {
        super(props);
    }

    /**
     * Render athlete item.
     * @param item
     * @returns {*}
     */
    renderItem = ({item}) => {

        let userImage;
        if (item.image)
            userImage = (
                <Image
                    source={{uri: `data:image/png;base64,${item.image}`}}
                    style={{width: '100%', height: '60%', opacity: 1,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
            );
        else
            userImage = (
                <Image
                    source={require('../../../assets/user-account.png')}
                    style={{width: '100%', height: '60%', opacity: 0.8,
                        borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                </Image>
            );

        let displayColor;
        if (item.displayColor === 'green')
            displayColor = colors.availableColor;
        else if (item.displayColor === 'red')
            displayColor = colors.notAvailableColor;
        else
            displayColor = colors.warningColor;

        return (
            <View style={[styles.itemContainer, {backgroundColor: displayColor}]}>
                {userImage}
                <View style={{flex: 1, padding: 5, justifyContent: 'center'}}>
                    <Text numberOfLines={2} ellipsizeMode='tail' style={styles.itemName}>
                        {item.name}
                    </Text>
                    {
                        (item.echelon !== 'erro') ?
                            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.itemCode}>
                                #{item.squad_number} - {item.echelon}
                            </Text>
                            :
                            <Text numberOfLines={1} ellipsizeMode='tail' style={styles.itemCode}>
                                #{item.squad_number}
                            </Text>
                    }
                </View>
            </View>
        );
    };

    render() {

        return(
            <SectionGrid
                itemDimension={100}
                spacing={10}
                sections={[{
                    title: this.props.title,
                    data: this.props.athletes,
                }]}
                style={styles.gridView}
                renderItem={this.renderItem}
                renderSectionHeader={({section}) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionText}>{section.title}</Text>
                    </View>
                )}
            />
        );
    }
}

const styles = StyleSheet.create({
    gridView: {
        marginTop: 10,
        flex: 1,
    },
    sectionHeader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: '#ad2e53',
        borderBottomWidth: 2,
        marginHorizontal: 20,
        padding: 5
    },
    sectionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#ad2e53',
    },
    itemContainer: {
        justifyContent: 'flex-start',
        borderRadius: 5,
        padding: 0,
        height: 150,
        //shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,
        elevation: 7,
    },
    itemName: {
        fontSize: 15,
        color: '#000',
        fontWeight: '500',
    },
    itemCode: {
        fontWeight: '600',
        fontSize: 12,
        color: '#000',
    }
});