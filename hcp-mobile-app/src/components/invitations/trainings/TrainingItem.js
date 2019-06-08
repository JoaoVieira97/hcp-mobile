import React, { PureComponent } from "react";
import {colors} from "../../../styles/index.style";
import {ListItem} from "react-native-elements";
import {Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default class TrainingItem extends PureComponent {

    render() {

        const training = this.props.training;
        const child = this.props.child;

        const colorText = training.isOver ? '#919391' : '#0d0d0d' ;
        const colorBackground = training.isOver ? colors.lightGrayColor : '#fff';
        const iconName = training.isOver ?  'md-done-all' : 'md-hourglass';
        const iconSize = training.isOver ?  22 : 28;

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: colorText}}>
                            {'Treino ' + training.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {training.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + training.hours}
                        </Text>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Duração: ' + training.duration + ' min'}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                training.place ?
                                    'Local: ' + training.place[1] :
                                    'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={iconName} size={iconSize} color={colorText} />)}
                chevron
                containerStyle={{
                    backgroundColor: colorBackground
                }}
                onPress={() => { this.props.navigation.navigate('OpenedTrainingInvitations',
                                {training: training,
                                 child: child})}}
            />
        )
    }
}