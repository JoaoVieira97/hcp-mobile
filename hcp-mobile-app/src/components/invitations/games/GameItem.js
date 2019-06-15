import React, { PureComponent } from "react";
import {colors} from "../../../styles/index.style";
import {ListItem} from "react-native-elements";
import {Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";

export default class GameItem extends PureComponent {

    render() {

        const game = this.props.game;
        const child = this.props.child;

        let colorText, colorBackground, iconName, iconSize;
        if(game.isOver === 'finished') {

            colorText = '#919391';
            colorBackground = colors.lightGrayColor;
            iconName = 'md-done-all';
            iconSize = 22;

        } else if (game.isOver === 'closed') {

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
                            {'Jogo ' + game.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {game.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <View style={{flex: 1, flexDirection: 'row'}}>
                            <Text style={{fontWeight: '700', color: colors.darkGrayColor}}>
                                {'Adversário: '}
                            </Text>
                            <Text style={{fontWeight: '400', color: colors.darkGrayColor}}>
                                {game.opponent}
                            </Text>
                        </View>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + game.hours}
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                game.place ?
                                    'Local: ' + game.place[1] :
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
                onPress={() => { this.props.navigation.navigate('OpenedGameInvitations', {game: game,child: child})}}
            />
        )
    }
}