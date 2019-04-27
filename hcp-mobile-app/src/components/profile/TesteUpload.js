import React, { Component } from 'react';
import { View, Text, Image, Button } from 'react-native';
import ImagePicker from 'react-native-image-picker';

import {connect} from "react-redux";
import {setOdooInstance} from "../../redux/actions/odoo";
import {setUserData, setUserGroups, setUserImage} from "../../redux/actions/user";


class TesteUpload extends Component {
   /* state = {
        photo: null,
    };

    handleChoosePhoto = () => {
        const options = {
            noData: true,
        };
        ImagePicker.launchImageLibrary(options, response => {
            if (response.uri) {
                this.setState({ photo: response });
            }
        });
    };

    render()  {
        const { photo } = this.state;
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {photo && (
                    <Image
                        source={{ uri: photo.uri }}
                        style={{ width: 300, height: 300 }}
                    />
                )}
                <Button title="Choose Photo" onPress={this.handleChoosePhoto} />
            </View>
        );
    }*/

    state = {
        avatarSource: null,
    };

    /*
    componentDidMount() {
        this.test();
    }*/

    test(){
       const options = {
           title: 'Select Avatar',
           customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
           storageOptions: {
               skipBackup: true,
               path: 'images',
           },
       };

       /**
        * The first arg is the options object for customization (it can also be null or omitted for default options),
        * The second arg is the callback which sends object: response (more info in the API Reference)
        */
       ImagePicker.showImagePicker(options, (response) => {
           console.log('Response = ', response);

           if (response.didCancel) {
               console.log('User cancelled image picker');
           } else if (response.error) {
               console.log('ImagePicker Error: ', response.error);
           } else if (response.customButton) {
               console.log('User tapped custom button: ', response.customButton);
           } else {
               const source = { uri: response.uri };

               // You can also display the image using data:
               // const source = { uri: 'data:image/jpeg;base64,' + response.data };

               this.setState({
                   avatarSource: source,
               });
           }
       });
   }

    render()  {
        const { avatarSource } = this.state;
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {avatarSource && (
                    <Image
                        source={this.state.avatarSource}
                        style={{ width: 300, height: 300 }}
                    />
                )}
                <Button title="Choose Photo" onPress={this.test} />
            </View>
        );
    }

}

const mapStateToProps = state => ({

    odoo: state.odoo.odoo,
    user: state.user
});

const mapDispatchToProps = dispatch => ({

    setOdooInstance: (odoo) => {
        dispatch(setOdooInstance(odoo))
    },
    setUserData: (id, user) => {
        dispatch(setUserData(id, user))
    },
    setUserImage: (image) => {
        dispatch(setUserImage(image))
    },
    setUserGroups: (groups) => {
        dispatch(setUserGroups(groups))
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(TesteUpload);