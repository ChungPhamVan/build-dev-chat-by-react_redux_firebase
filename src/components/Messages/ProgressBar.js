import React, { Component } from 'react'
import { Progress } from 'semantic-ui-react'

export default class ProgressBar extends Component {
  render() {
    const { uploadState, percentUpload } = this.props;
    return (
      uploadState &&
      <Progress
        className="progress__bar"
        percent={percentUpload}
        progress
        indicating
        size="small"
        inverted
      >

      </Progress>
    )
  }
}
