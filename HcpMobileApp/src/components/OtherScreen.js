import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet
} from 'react-native';
import {Agenda} from 'react-native-calendars';

export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {
        '2019-03-06': [
            {name: 'Treino sub-13', height: 50},
            {name: 'Jogo', height: 100}
        ],
        '2019-03-07': [],
        '2019-03-08': [
            {name: 'Treino sub-15', height: 10},
            {name: 'Jogo Benjamins', height: 60}
        ],
        '2019-03-09': [],
        '2019-03-10': [
            {name: 'Treino sub-19', height: 100},
            {name: 'Jogo Treino', height: 60}
        ],
      }
    };
  }

  render() {
    return (
      <Agenda
        items={this.state.items}
        selected={'2019-03-06'}
        renderItem={this.renderItem.bind(this)}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
      />
    );
  }
  renderItem(item) {
    return (
      <View style={[styles.item, {height: item.height}]}><Text>{item.name}</Text></View>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}></View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }

}

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex:1,
    paddingTop: 30
  }
});