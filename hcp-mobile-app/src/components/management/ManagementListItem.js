import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {ListItem} from 'react-native-elements';
import {colors} from "../../styles/index.style";
import {Ionicons} from "@expo/vector-icons";
import FabButton from "./FabButton";



export default class ManagementListItem extends PureComponent {

    /**
     * This component is used both in item.and Game list.
     * Used in: Openeditem. and OpenedGames
     * 
     * titleType
     * item.echelon
     * item.date
     * item.hour
     * item.duration
     * item.local
     * 
     * index
     * navigateToFunction
     * @returns {*}
     */
    render() {
        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700'}}>
                            {this.props.titleType + this.props.item.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400'}}>
                            {this.props.item.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + this.props.item.hour}
                        </Text>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Duração: ' + this.props.item.duration + ' min'}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                this.props.item.local ?
                                    'Local: ' + this.props.item.local[1] :
                                    'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={'md-hourglass'} size={28} />)}
                chevron
                containerStyle={{
                    backgroundColor: this.props.index % 2 === 0 ? colors.lightGrayColor : '#fff'
                }}
                onPress={() => this.props.navigateToFunction(this)}
            />
        );
    }
}

ManagementListItem.propTypes = {
    titleType: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    navigateToFunction: PropTypes.func.isRequired
};