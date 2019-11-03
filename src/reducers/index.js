import * as actionTypes from '../actions/types'
import { combineReducers } from 'redux'
const userInitialState = {
  currentUser: null,
  isLoading: true
}
const userReducer = (state = userInitialState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      }
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        isLoading: false
      }
    default:
      return state
  }
}
const channelInitialState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null
};
const channelReducer = (state = channelInitialState, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL: 
      return {
        ...state,
        currentChannel: action.payload.currentChannel
      }
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload.isPrivateChannel
      }
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts
      };
    default: 
      return state
  }
}
const colorsInitialState = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee"
}
const colorsReducer = (state = colorsInitialState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        ...state,
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor
      }
    default:
      return state
  }
}
const rootReducer = combineReducers({
  user: userReducer,
  channel: channelReducer,
  colors: colorsReducer
});
export default rootReducer