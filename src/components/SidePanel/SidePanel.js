import React, { Component } from "react";
import { Menu } from "semantic-ui-react";
import UserPanel from "./UserPanel.js";
import Channels from "./Channels.js";
import DirectMessages from "./DirectMessages.js";
import Starred from "./Starred.js";

export default class SidePanel extends Component {
  render() {
    const { currentUser, primaryColor } = this.props
    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: primaryColor, fontSize: "1.2rem" }}
      >
        <UserPanel primaryColor={primaryColor} currentUser={currentUser} />
        <Starred currentUser={currentUser} />
        <Channels currentUser={currentUser} />
        <DirectMessages
          currentUser={currentUser}
        />
      </Menu>
    );
  }
}
