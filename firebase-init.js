const firebaseConfig = {
  apiKey: "AIzaSyDy7f5bnfNr7b9VE4XzUv2CPAnbJAXnGwU",
  authDomain: "ois-leaderboard-87d79.firebaseapp.com",
  projectId: "ois-leaderboard-87d79",
  databaseURL: "https://ois-leaderboard-87d79-default-rtdb.firebaseio.com",
  storageBucket: "ois-leaderboard-87d79.firebasestorage.app",
  messagingSenderId: "682466996014",
  appId: "1:682466996014:web:8de9ed2eb3082233ac94bf",
  measurementId: "G-NS1FT50VWP"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const analytics = firebase.analytics();

provider.setCustomParameters({ hd: "oakbridge.edu.my" });
