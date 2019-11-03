import React, { Component } from "react";
import firebase from "../../firebase.js";
import md5 from "md5";
import {
  Grid,
  Button,
  Form,
  Segment,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import "../../css/App.css";

export default class Register extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      errors: [],
      loading: false,
      usersRef: firebase.database().ref("users")
    };
  }

  handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({
      [name]: value
    });
  };
  isFormValid = () => {
    let errors = [];
    let error;

    if (this.isFormEmpty(this.state)) {
      error = { message: "Fill in all fields" };
      this.setState({
        errors: errors.concat(error)
      });
      return false;
    } else if (!this.isFormPasswordValid(this.state)) {
      error = { message: "Password is invalid" };
      this.setState({
        errors: errors.concat(error)
      });
    } else {
      //form valid
      return true;
    }
  };
  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };
  isFormPasswordValid = ({ password, passwordConfirmation }) => {
    if (
      password.length < 6 ||
      passwordConfirmation.length < 6 ||
      passwordConfirmation !== password
    ) {
      return false;
    } else {
      return true;
    }
  };
  displayErrors = errors => {
    return errors.map((error, index) => <p key={index}>{error.message}</p>);
  };
  handleErrorsInInput = (errors, inputName) => {
    return errors.some(error => {
      return error.message.toLowerCase().includes(inputName);
    })
      ? "error"
      : "";
  };
  handleSubmit = event => {
    event.preventDefault();
    if (this.isFormValid()) {
      this.setState({
        errors: [],
        loading: true
      });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createUser => {
          console.log(createUser);
          createUser.user
            .updateProfile({
              displayName: this.state.username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              this.saveUser(createUser).then(() => {
                console.log("created user");
              });
            })
            .catch(err => {
              console.log(err);
              this.setState({
                errors: this.state.errors.concat(err),
                loading: false
              });
            });
        })
        .catch(err => {
          console.log(err);
          this.setState({
            errors: this.state.errors.concat(err),
            loading: false
          });
        });
    }
  };
  saveUser = createUser => {
    return this.state.usersRef.child(createUser.user.uid).set({
      name: createUser.user.displayName,
      avatar: createUser.user.photoURL
    });
  };
  render() {
    const {
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;

    return (
      <Grid
        textAlign="center"
        verticalAlign="middle"
        className="registerBackground"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="rocketchat" color="orange" />
            Register for DevChat
          </Header>
          <Form
            onSubmit={event => {
              this.handleSubmit(event);
            }}
            size="large"
          >
            <Segment stacked>
              <Form.Input
                name="username"
                icon="user"
                type="text"
                iconPosition="left"
                placeholder="Username"
                onChange={event => {
                  this.handleChange(event);
                }}
                value={username}
                className={this.handleErrorsInInput(errors, "username")}
              />

              <Form.Input
                fluid
                name="email"
                icon="mail"
                type="text"
                iconPosition="left"
                placeholder="Email Address"
                onChange={event => {
                  this.handleChange(event);
                }}
                value={email}
                className={this.handleErrorsInInput(errors, "email")}
              />

              <Form.Input
                fluid
                name="password"
                icon="lock"
                type="password"
                iconPosition="left"
                placeholder="Password"
                onChange={event => {
                  this.handleChange(event);
                }}
                value={password}
                className={this.handleErrorsInInput(errors, "password")}
              />

              <Form.Input
                fluid
                name="passwordConfirmation"
                icon="repeat"
                type="password"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={event => {
                  this.handleChange(event);
                }}
                value={passwordConfirmation}
                className={this.handleErrorsInInput(errors, "password")}
              />

              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="orange"
                fluid
                size="large"
              >
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length !== 0 && (
            <Message color="red">{this.displayErrors(errors)}</Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
          <Message>
            SourceCode of web: <br />
            <span style={{ color: "blue" }}>
              github.com/chungphamvan/build-dev-chat-by-react_redux_firebase
            </span>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
