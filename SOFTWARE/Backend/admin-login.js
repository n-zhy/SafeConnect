import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCCF3RBGCrh8DDhhHvADoxVQewbOfqLNNE",
    authDomain: "safeconnect-473dd.firebaseapp.com",
    projectId: "safeconnect-473dd",
    storageBucket: "safeconnect-473dd.appspot.com",
    messagingSenderId: "1018395309743",
    appId: "1:1018395309743:web:9a450586bfdc1da6a6465a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const messageText = document.getElementById("messageText");
const loginText = document.getElementById("loginText");
const loader = document.getElementById("loader-container");

/* ************************************************** DEFINE FUNCTIONS ************************************************** */
function showMessage(message){
    messageText.textContent = message;
    loginText.textContent = "";
    loader.style.display = "block";

    setTimeout(() => {
        loader.style.display = "none";
        messageText.textContent = "";
        loginText.textContent = "Admin Log In";
        resetUI();
    },2500);
}

function resetUI(){
    const loginBtn = document.getElementById("login-btn");
    const forgotPass = document.getElementById("forgot-pass");

    loginBtn.style.display = "block";
    forgotPass.style.display = "block";
}

function restUIForgot(){
    const loginBtn = document.getElementById("login-btn");
    const forgotPass = document.getElementById("forgot-pass");

    loginBtn.style.display = "none";
    forgotPass.style.display = "none";
}

const logIn = (email, password) => {
    const loginBtn = document.getElementById("login-btn");
    const forgotPass = document.getElementById("forgot-pass");

    loginBtn.style.display = "none";
    forgotPass.style.display = "none";
    loader.style.display = "block";

    if(email === "" || password === ""){
        showMessage("Fields must not be empty");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
        const user = userCredential.user;
        console.log("User logged in:", user);
        showMessage("Signing in");
        window.location.href = "admin-portal.html";
    })
    .catch(error => {
        showMessage("Wrong credentials");
        resetLoginUI();
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error logging in:", errorCode, errorMessage);
    });
};

/* ************************************************** PROGRAM'S ENRTY POINT ************************************************** */
const login = document.getElementById("login-btn");
login.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    logIn(email, password);
});
const passwordInput = document.getElementById("password");
passwordInput.addEventListener("keypress", (event) => {
    if(event.key == "Enter"){
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        logIn(email, password);
    }
});

/* ************************************************** RESET PASSWORD ************************************************** */
const reset = document.getElementById("forgot-pass");
reset.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;

    if(email === ""){
        showMessage("Please enter your email first");
        restUIForgot();
        return; 
    }

    sendPasswordResetEmail(auth, email)
    .then(() => {
        showMessage("Password reset form has been sent");
        restUIForgot();
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error resetting password:", errorCode, errorMessage);
    });
});