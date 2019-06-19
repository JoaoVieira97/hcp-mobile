import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Text, View} from 'react-native';
import {Ionicons} from "@expo/vector-icons";
import {colors} from "../../styles/index.style";
import {ListItem} from "react-native-elements";



export default class EventItem extends PureComponent {

    /**
     * When user press event item.
     * @param type
     */
    handlePress = (type) => {

        const {event, athleteID, athleteIsChild} = this.props;
        const eventState = event.isOver;

        if (type === 'Treino') {

            let trainingScreen;
            if (eventState === 'opened') {
                trainingScreen = 'OpenedInvitation';
            } else {
                trainingScreen = 'OtherInvitation';
            }

            this.props.navigation.navigate(trainingScreen, {
                training: event,
                athleteID: athleteID,
                athleteIsChild: athleteIsChild
            });
        }
        else {

            let gameScreen;
            if (eventState === 'opened') {
                gameScreen = 'OpenedGameInvitation';
            } else {
                gameScreen = 'OtherGameInvitation';
            }

            this.props.navigation.navigate(gameScreen, {
                game: event,
                athleteID: athleteID,
                athleteIsChild: athleteIsChild
            });
        }
    };


    render() {

        const {event, type} = this.props;

        let colorText='#0d0d0d', colorBackground='#ffffff', iconSize=25, iconName;
        let duration_antecedence;

        if(type === 'Treino') {
            duration_antecedence = (
                <Text style={{color: colors.darkGrayColor}}>
                    {'Duração: ' + event.duration + ' min'}
                </Text>
            )
        }
        else {
            duration_antecedence = (
                <Text style={{color: colors.darkGrayColor}}>
                    {'Antecedência: ' + event.antecedence + ' h'}
                </Text>
            )
        }



        if(event.isOver === 'finished') {

            colorText = '#919391';
            colorBackground = colors.lightGrayColor;
            iconName = 'md-done-all';
            iconSize = 22;

        } else if (event.isOver === 'closed') {
            iconName = 'md-lock';

        } else {
            iconName = 'md-hourglass';
        }

        return (
            <ListItem
                title={(
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: colorText}}>
                            {type + ' ' + event.echelon[1] + ' | '}
                        </Text>
                        <Text style={{fontSize: 16, fontWeight: '400', color: colorText}}>
                            {event.date}
                        </Text>
                    </View>
                )}
                subtitle={(
                    <View  style={{flex: 1, flexDirection: 'column'}}>
                        <Text style={{color: colors.darkGrayColor}}>
                            {'Início: ' + event.hours}
                        </Text>
                        {duration_antecedence}
                        <Text numberOfLines={1} ellipsizeMode='tail' style={{color: colors.darkGrayColor}}>
                            {
                                event.place ?
                                    'Local: ' + event.place[1] :
                                    'Nenhum local atribuído'
                            }
                        </Text>
                    </View>
                )}
                leftAvatar={(<Ionicons name={iconName} size={iconSize} color={colorText} />)}
                chevron={true}
                containerStyle={{
                    backgroundColor: colorBackground
                }}
                onPress={() => this.handlePress(type)}
            />
        );
    }
}

EventItem.propTypes = {
    navigation: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
    event: PropTypes.object.isRequired,
    athleteID: PropTypes.number.isRequired,
    athleteIsChild: PropTypes.bool.isRequired,
};
