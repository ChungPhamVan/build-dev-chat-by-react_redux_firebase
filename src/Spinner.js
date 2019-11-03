import { Loader, Dimmer } from 'semantic-ui-react'
import React, { Component } from 'react'

export default class Spinner extends Component {
  render() {
    return (
      <Dimmer active>
        <Loader size="huge" content="Preparing Chat..." />
      </Dimmer>
    )
  }
}
