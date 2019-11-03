import React, { Component } from "react";
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from "semantic-ui-react";
import firebase from '../../firebase'
import { connect } from 'react-redux'
import AvatarEditor from 'react-avatar-editor'

class UserPanel extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      user: this.props.currentUser,
      modal: false,
      previewImage: "",
      croppedImage: "",
      uploadedCroppedImage: "",
      blod: null,
      storageRef: firebase.storage().ref(),
      userRef: firebase.auth().currentUser,
      usersRef: firebase.database().ref("users"),
      metadata: {
        contentType: "image/jpeg"
      },
      
    }
  }
  openModal = () => this.setState({ modal: true });
  closeModal = () => this.setState({ modal: false });
  handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader(); 
    if(file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({
          previewImage: reader.result
        });
      })
    }
  }
  dropdownOptions = () => {
    return [
      {
        key: "user",
        text: (
          <span>
            Signed in as &nbsp;
            <strong>
              {this.state.user.displayName}
            </strong>
          </span>
        ),
        disabled: true
      },
      {
        key: "avatar",
        text: <span onClick={this.openModal}>Change Avatar</span>
      },
      {
        key: "signout",
        text: <span onClick={this.handleSignout} >Sign Out</span>
      }
    ];
  };
  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('signed out');
      })
  }
  handleCropImage = () => {
    if(this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blod => {
        let imageUrl = URL.createObjectURL(blod);
        this.setState({
          croppedImage: imageUrl,
          blod: blod
        });
      })
    }
  }
  uploadCroppedImage = () => {
    const { storageRef, userRef, blod, metadata } = this.state;
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blod, metadata)
      .then(snap => {
        snap.ref.getDownloadURL().then(downloadURL => {
          this.setState({
            uploadedCroppedImage: downloadURL
          }, () => this.changeAvatar());
        })
      })
  }
  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL: this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log("Photo...");
        this.closeModal();
      })
      .catch(err => {
        console.error(err);
      })
    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar: this.state.uploadedCroppedImage })
      .then(() => {
        console.log("user avatar updated");
      })
      .catch(err => {
        console.error(err);
      })
  }
  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;
    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* App header */}
            <Header inverted floated="left" as="h2">
              <Icon name="codepen" />
              <Header.Content>DevChat</Header.Content>
            </Header>
            <Header style={{ padding: "0.25em" }} as="h4" inverted>
              {/* User dropdown */}
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
          {/* change user avatar modal */}
          <Modal
            basic
            open={modal}
            onClose={this.closeModal}
          >
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
                onChange={this.handleChange}
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {/* Image Preview */}
                    { previewImage && (
                      <AvatarEditor
                        ref={node => (this.avatarEditor = node)}
                        image={previewImage}
                        width={200}
                        height={200}
                        border={40}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {/* choose image preview */}
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {
                croppedImage &&
                <Button color="green" inverted onClick={this.uploadCroppedImage} >
                  <Icon name="save" /> Change Avatar
                </Button>
              }
              <Button color="green" inverted onClick={this.handleCropImage} >
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal} >
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    currentUser: state.user.currentUser
  }
}
export default connect(mapStateToProps, null, null)(UserPanel)