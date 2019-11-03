import React, { Component } from 'react'
import { Modal, Input, Button, Icon } from 'semantic-ui-react'
import mime from 'mime-types'

export default class FileModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      file: null,
      authorized: [ "image/jpeg", "image/png" ]
    }
  }
  addFile = (event) => {
    let file = event.target.files[0];
    if(file) {
      this.setState({
        file: file
      });
    }
  }
  isAuthorized = (fileName) => {
    return this.state.authorized.includes(mime.lookup(fileName));
  }
  sendFile = (file) => {
    const { uploadFile, closeModal } = this.props;
    if(file !== null) {
      if(this.isAuthorized(file.name)) {
        // send file
        const metaData = { contentType: mime.lookup(file.name) };
        uploadFile(file, metaData);
        closeModal();
        this.clearFile();
      }
    }
  }
  clearFile = () => {
    this.setState({
      file: null
    });
  }
  render() {
    const { modal, closeModal } = this.props;
    const { file } = this.state;
    return (
      <Modal
        basic
        open={modal}
        onClose={() => {closeModal()}}
      >
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            fluid
            label="FIle types: jpg, png"
            name="file"
            type="file"
            onChange={event => {this.addFile(event)}}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="green"
            inverted
            onClick={() => {this.sendFile(file)}}
          >
            <Icon name="checkmark" />
            Send
          </Button>
          <Button
            color="red"
            inverted
            onClick={() => {closeModal()}}
          >
            <Icon name="remove" />
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
