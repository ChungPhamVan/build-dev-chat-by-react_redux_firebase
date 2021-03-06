import React, { Component } from 'react'
import { Segment, Button, Input } from 'semantic-ui-react'
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
import { Picker, emojiIndex } from 'emoji-mart'
import '../../css/emoji.css'

export default class MessageForm extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      message: "",
      loading: false,
      channel: this.props.channel,
      user: this.props.user,
      errors: [],
      modal: false,
      uploadState: "",
      uploadTask: null,
      storageRef: firebase.storage().ref(),
      percentUpload: 0,
      typingRef: firebase.database().ref("typing"),
      emojiPicker: false
    }
  }
  openModal = () => {
    this.setState({
      modal: true
    });
  }
  closeModal = () => {
    this.setState({
      modal: false
    });
  }
  handleChange = (event) => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({
      [name]: value
    });
  }
  handleKeyDown = (event) => {
    if(event.keyCode === 13) {
      this.sendMessage();
    }
    const { message, typingRef, channel, user } = this.state;
    if(message) {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .set(user.displayName)
    } else {
      typingRef
        .child(channel.id)
        .child(user.uid)
        .remove();
    }
  }
  createMessage = (fileUrl = null) => {
    const { user } = this.state;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };
    if(fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }
    return message;
  }
  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, typingRef, user } = this.state;
    if (message) {
      this.setState({
        loading: true
      });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            loading: false,
            message: "",
            errors: []
          });
          typingRef
            .child(channel.id)
            .child(user.uid)
            .remove()
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        })
    } else {
      this.setState({
        errors: this.state.errors.concat({
          message: "Errors: Add a message"
        })
      });
    }
  }
  getPath = () => {
    if(this.props.isPrivateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  }
  uploadFile = (file, metaData) => {
    const pathToUpLoad = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
    this.setState({
      uploadState: 'uploading',
      uploadTask: this.state.storageRef.child(filePath).put(file, metaData)
    },
      () => {
        this.state.uploadTask.on(
          "state_changed", 
          snap => {
            const percentUpload = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            this.props.isProgressBarVisible(percentUpload);
            this.setState({
              percentUpload: percentUpload
            });
          },
          err => {
            console.error(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadTask: null,
              uploadState: "error"
            });
          },
          () => {
            this.state.uploadTask
              .snapshot.ref
              .getDownloadURL()
              .then(downloadUrl => {
                this.sendFileMessage(downloadUrl, ref, pathToUpLoad);
              })
              .catch(err => {
                console.error(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null
                });
              });
          }
        );
      }
    );
  }
  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({
          uploadState: "done"
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({
          errors: this.state.errors.concat(err)
        });
      })

  }
  handleTogglePicker = () => {
    this.setState({
      emojiPicker: !this.state.emojiPicker
    });
  }
  handleAddEmoji = emoji => {
    const oldMessage = this.state.message;
    const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
    this.setState({ message: newMessage, emojiPicker: false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };
  messageInputRef = () => {}
  colonToUnicode = message => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };
  componentWillUnmount() {
    if(this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }
  
  render() {
    const { message, errors, loading, modal, percentUpload, uploadState, emojiPicker } = this.state;
    return (
      <Segment className="message_form" >
        {
          emojiPicker && (
            <Picker
              set="apple"
              className="emojipicker"
              title="Pick your emoji"
              emoji="point_up"
              onSelect={this.handleAddEmoji}
            />
          )
        }
        <Input
          fluid
          name="message"
          style={{ marginBottom: '0.7em' }}
          placeholder="write your message"
          labelPosition="left"
          label={
            <Button 
              icon={emojiPicker ? "close" : "add"} 
              onClick={this.handleTogglePicker} 
              content={emojiPicker ? "Close" : null}
            />
          }
          onChange={(event) => this.handleChange(event)}
          onKeyDown={this.handleKeyDown}
          value={message}
          className={
            errors.some(error => error.message.includes("message")) ? "error" : ""
          }
          ref={node => (this.messageInputRef = node)}
        />
        <Button.Group icon widths={2} >
          <Button
            color="orange"
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            onClick={() => this.sendMessage()}
            disabled={loading}
          />
          <Button
            color="teal"
            disabled={uploadState === "uploading"}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />
          <FileModal
            modal={modal}
            closeModal={() => {this.closeModal()}}
            uploadFile={(file, metaData) => {this.uploadFile(file, metaData)}}
          />
        </Button.Group>
        <ProgressBar
          uploadState={uploadState}
          percentUpload={percentUpload}
        />
      </Segment>
    )
  }
}
