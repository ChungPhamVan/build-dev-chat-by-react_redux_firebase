import React, { Component } from "react";
import { Segment, Comment } from "semantic-ui-react";
import MessageForm from "./MessageForm";
import MessageHeader from "./MessageHeader";
import firebase from "../../firebase";
import Message from "./Message";
import { connect } from 'react-redux'
import { setUserPosts } from '../../actions/index'
import Typing from "./Typing";
import Skeleton from "./Skeleton";

class Messages extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      messageRef: firebase.database().ref("messages"),
      privateChannel: this.props.isPrivateChannel,
      channel: this.props.currentChannel,
      user: this.props.currentUser,
      messages: [],
      privateMessagesRef: firebase.database().ref("privateMessages"),
      messagesLoading: true,
      progressBar: false,
      numUniqueUsers: "",
      searchTerm: "",
      searchLoading: false,
      searchResults: [],
      isChannelStarred: false,
      userRef: firebase.database().ref("users"),
      typingRef: firebase.database().ref("typing"),
      typingUsers: [],
      connectedRef: firebase.database().ref(".info/connected"),
      listeners: []
    };
  }
  componentDidMount() {
    const { channel, user, listeners } = this.state;
    if (channel && user) {
      this.removeListener(listeners)
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user.uid);
    }
    if(this.messagesEnd) {
      this.scrollToBottom();
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if(this.messagesEnd) {
      this.scrollToBottom();
    }
  }
  componentWillUnmount() {
    this.removeListener(this.state.listeners);
    this.state.connectedRef.off();
  }
  removeListener = (listeners) => {
    listeners.forEach(listener => {
      listener.ref.child(listener.id).off(listener.event)
    });
  }
  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex(listener => {
      return listener.id === id && listener.ref === ref && listener.event === event
    })
    if(index === -1) {
      const newListener = { id, ref, event };
      this.setState({
        listeners: this.state.listeners.concat(newListener)
      });
    }
  }
  addUserStarsListener = (channelId, userId) => {
    this.state.userRef
      .child(userId)
      .child("starred")
      .once("value")
      .then(data => {
        if(data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({
            isChannelStarred: prevStarred
          });
        }
      })
  }
  addListeners = channelId => {
    this.addMessageListeners(channelId);
    this.addTypingListeners(channelId);
  };
  addTypingListeners = (channelId) => {
    let typingUsers = [];
    this.state.typingRef
      .child(channelId)
      .on("child_added", snap => {
        if(snap.key !== this.state.user.uid) {
          typingUsers = typingUsers.concat({
            id: snap.key,
            name: snap.val()
          })
          this.setState({ typingUsers: typingUsers });
        }
      });
    this.addToListeners(channelId, this.state.typingRef, "child_added");

    this.state.typingRef
      .child(channelId)
      .on("child_removed", snap => {
        const index= typingUsers.findIndex(user => user.id === snap.key);
        if(index !== -1) {
          typingUsers = typingUsers.filter(user => user.id !== snap.key);
          this.setState({
            typingUsers: typingUsers
          });
        }
      });
    
    this.addToListeners(channelId, this.state.typingRef, "child_removed");
    this.state.connectedRef
      .on("value", snap => {
        if(snap.val() === true) {
          this.state.typingRef
            .child(channelId)
            .child(this.state.user.uid)
            .onDisconnect()
            .remove(err => {
              if(err !== null) {
                console.error(err);
              }
            })
        }
      })
  }
  addMessageListeners = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
    this.addToListeners(channelId, ref, "child_added");
  };
  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if(message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  }
  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({
      numUniqueUsers: numUniqueUsers
    });
  };
  displayMessages = messages => {
    return (
      messages.length > 0 &&
      messages.map(message => (
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      ))
    );
  };
  getMessagesRef = () => {
    const { messageRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messageRef;
  }
  isProgressBarVisible = percentUpload => {
    if (percentUpload > 0) {
      this.setState({
        progressBar: true
      });
    }
  };
  displayChannelName = channel => {
    return channel ? `${this.state.privateChannel ? "@" : "#"}${channel.name}` : "";
  };
  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => {
        return this.handleSearchMessages();
      }
    );
  };
  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({
      searchResults: searchResults
    });
    setTimeout(() => this.setState({ searchLoading: false }), 700);
  };
  handleStar = () => {
    this.setState(prevState => ({
      isChannelStarred: !prevState.isChannelStarred
    }), () => this.starChannel());
  }
  starChannel = () => {
    if(this.state.isChannelStarred) {
      this.state.userRef
        .child(`${this.state.user.uid}/starred`)
        .update({
          [this.state.channel.id]: {
            name: this.state.channel.name,
            details: this.state.channel.details,
            createdBy: {
              name: this.state.channel.createdBy.name,
              avatar: this.state.channel.createdBy.avatar
            }
          }
        })
    } else {
      this.state.userRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove(err => {
          if(err !== null) {
            console.error(err);
          }
        });
    }
  }
  displayTypingUsers = (users) => (
    users.length > 0 && users.map(user => (
      <div key={user.id} style={{ display: "flex", alignItems:"center", marginBottom: "0.2em" }}>
        <span className="user__typing">{user.name} is typing</span>
        <Typing />
      </div>
    ))
  )
  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }
  displayMessageSkeleton = (loading) => (
    loading ? (
      <React.Fragment>
        {
          [...Array(10)].map((_, i) => 
            <Skeleton key={i} />
          )
        }
      </React.Fragment>
    ) : null
  )
  render() {
    const {
      messageRef,
      channel,
      user,
      messages,
      progressBar,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading
    } = this.state;
    return (
      <React.Fragment>
        <MessageHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />

        <Segment>
          <Comment.Group
            className={progressBar ? "messages__progress" : "messages"}
          >
            { this.displayMessageSkeleton(messagesLoading) }
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
              { this.displayTypingUsers(typingUsers) }
            <div ref={node => (this.messagesEnd = node)}>

            </div>
          </Comment.Group>
        </Segment>
        <MessageForm
          messageRef={messageRef}
          channel={channel}
          user={user}
          isProgressBarVisible={percent => {
            this.isProgressBarVisible(percent);
          }}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
} 
export default connect(null, { setUserPosts })(Messages)