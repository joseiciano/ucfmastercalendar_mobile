import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView} from 'react-native';
import {Divider} from 'react-native-elements';
import {useHistory} from 'react-router-native';
import axios from 'axios';
import firebase from 'firebase';
import 'firebase/auth';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {ClubFormInfo} from './ClubFormInfo';

const ClubModalForm = ({isVisible, toggle, clubList, changeClubList}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('email');
  const [meetingInfo, setMeetingInfo] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [other, setOther] = useState('other');
  const [uid, setuid] = useState('');
  const history = useHistory();

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setuid(user.uid);
      }
    });
  }, []);

  const openGallery = () => {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;

    ImagePicker.openPicker({
      includeBase64: true,
      mediaType: 'photo',
      cropping: true,
      cropperCircleOverlay: true,
    }).then(image => {
      const imagePath = image.path;
      let uploadBlob = null;
      let mime = 'image/jpg';
      const imageRef = firebase
        .storage()
        .ref('clubs/coverImage')
        .child(uid);

      fs.readFile(imagePath, 'base64')
        .then(data => {
          return Blob.build(data, {type: `${mime};BASE64`});
        })
        .then(blob => {
          uploadBlob = blob;
          return imageRef.put(blob, {contentType: mime});
        })
        .then(() => {
          uploadBlob.close();
          return imageRef.getDownloadURL();
        })
        .then(url => {
          setCoverImage(url);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  const reset = () => {
    setName('');
    setDescription('');
    setWebsite('');
    setInstagram('');
    setFacebook('');
    setTwitter('');
  };

  const handleSubmit = () => {
    const newinfo = {
      name: name,
      description: description,
      meetingInfo: meetingInfo,
      website: website,
      instagram: instagram,
      facebook: facebook,
      twitter: twitter,
      coverImage: coverImage
        ? coverImage
        : 'https://i.redd.it/2l2av8at5sn31.jpg',
      other: other,
      userId: uid,
      email: email,
    };
    axios
      .post(
        `https://us-central1-ucf-master-calendar.cloudfunctions.net/webApi/api/v1/clubs`,
        newinfo,
      )
      .then(res => {
        // toggle();
        // changeClubList([...clubList, ]))
        // history.push('/BigBrain');
      })
      .then(res => history.push('/Clubs'))
      .catch(e => console.log('Error posting to server', e.response));
  };

  return (
    <Modal
      isVisible={isVisible}
      animationType="slide"
      onModalWillShow={reset}
      transparent={true}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      onBackButtonPress={toggle}
      onBackdropPress={toggle}>
      <ScrollView
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: 'white',
        }}>
        <View
          style={{
            flex: 1,
            paddingLeft: '8%',
            paddingRight: '8%',
            paddingTop: '8%',
          }}>
          <Text
            style={{fontFamily: 'Pacifico', fontSize: 20, textAlign: 'center'}}>
            Connecting Club To Account
          </Text>
          <Divider
            style={{height: '0.15%', marginTop: '5%', backgroundColor: 'black'}}
          />

          <ClubFormInfo
            nameValue={name}
            onChangeName={text => setName(text)}
            descValue={description}
            onChangeDesc={text => setDescription(text)}
            meetValue={meetingInfo}
            onChangeMeet={text => setMeetingInfo(text)}
            webValue={website}
            onChangeWeb={text => setWebsite(text)}
            instaValue={instagram}
            onChangeInsta={text => setInstagram(text)}
            faceValue={facebook}
            onChangeFace={text => setFacebook(text)}
            twitValue={twitter}
            onChangeTwit={text => setTwitter(text)}
            imageGallery={openGallery}
            coverImage={coverImage}
            handleSubmit={handleSubmit}
            handleDelete={() => console.log('pepega')}
            showTwoButtons={false}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

export {ClubModalForm};