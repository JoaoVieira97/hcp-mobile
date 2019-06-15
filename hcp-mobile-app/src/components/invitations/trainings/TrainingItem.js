import React, { PureComponent } from "react";
import {colors} from "../../../styles/index.style";
import {ListItem} from "react-native-elements";
import {Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default class TrainingItem extends PureComponent {

    render() {

        const training = this.props.training;
        const child = this.props.child;

        let colorText, colorBackground, iconName, iconSize;
        if(training.isOver === 'finished') {

            colorText = '#919391';
            colorBackground = colors.lightGrayColor;
            iconName = 'md-done-all';
            iconSize = 22;

        } else if (training.isOver === 'closed') {

            colorText ='#0d0d0d';
            colorBackground = '#fff';
            iconName = 'md-lock';
            iconSize = 25;

        } else {

            colorText ='#0d0d0d';
            colorBackground = '#fff';
            iconName = 'md-hourglass';
            iconSize = 25;
        }

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