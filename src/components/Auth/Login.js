import React, { Component } from "react";
import firebase from "../../firebase.js";
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

export default class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      email: "",
      password: "",
      errors: [],
      loading: false
    };
  }

  handleChange = event => {
    let name = event.target.name;
    let value = event.target.value;
    this.setState({
      [name]: value
    });
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
    if (this.isFormValid(this.state)) {
      this.setState({
        errors: [],
        loading: true
      });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(signedInUser => {
          console.log(signedInUser);
        })
        .catch(err => {
          console.log(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        })
    }
  };
  isFormValid = ({ email, password }) => {
    return email && password;
  }

  render() {
    const {
      email,
      password,
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
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to DevChat
          </Header>
          <Form
            onSubmit={event => {
              this.handleSubmit(event);
            }}
            size="large"
          >
            <Segment stacked>
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
              <Button
                disabled={loading}
                className={loading ? "loading" : ""}
                color="violet"
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
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
