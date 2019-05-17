import React, { Component } from 'react';

import { View } from 'react-native';

import { connect } from 'react-redux';

// import styles from './styles';

class OpenedGame extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {

        console.log(this.props);
    return (
      <View />
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OpenedGame);