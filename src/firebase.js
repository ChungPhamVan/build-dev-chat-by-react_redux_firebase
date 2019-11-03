import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
let firebaseConfig = {
  apiKey: "AIzaSyCNPZiAxURCHF8qbSrI9etFPzb4V0xpSWY",
  authDomain: "dev-slack-chat-by-react.firebaseapp.com",
  databaseURL: "https://dev-slack-chat-by-react.firebaseio.com",
  projectId: "dev-slack-chat-by-react",
  storageBucket: "dev-slack-chat-by-react.appspot.com",
  messagingSenderId: "755711177960",
  appId: "1:755711177960:web:202812bc09e4ad9afa055d",
  measurementId: "G-39CJEC5SB4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase;