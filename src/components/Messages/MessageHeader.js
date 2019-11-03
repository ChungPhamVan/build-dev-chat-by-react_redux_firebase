import React, { Component } from "react";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

export default class MessageHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      searchLoading,
      isPrivateChannel,
      isChannelStarred,
      handleStar
    } = this.props;
    return (
      <Segment clearing>
        {/* channel title */}
        <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
          <span>
            {channelName}&nbsp;&nbsp;&nbsp;&nbsp;
            {
              !isPrivateChannel &&  
              <Icon 
                name={isChannelStarred ? "star" : "star outline"} 
                color={isChannelStarred ? "blue" : "black"}
                onClick={handleStar}
                style={{cursor:'pointer'}}
              />
            }
            
          </span>
          <Header.Subheader>{numUniqueUsers}</Header.Subheader>
        </Header>

        {/* channel search input */}
        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="searchItem"
            placeholder="Search Message"
            onChange={handleSearchChange}
            loading={searchLoading}
          />
        </Header>
      </Segment>
    );
  }
}
