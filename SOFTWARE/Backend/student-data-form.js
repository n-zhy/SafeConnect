import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCCF3RBGCrh8DDhhHvADoxVQewbOfqLNNE",
    authDomain: "safeconnect-473dd.firebaseapp.com",
    projectId: "safeconnect-473dd",
    storageBucket: "safeconnect-473dd.appspot.com",
    messagingSenderId: "1018395309743",
    appId: "1:1018395309743:web:9a450586bfdc1da6a6465a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const submitBtn = document.getElementById("submit-btn");
const loader = document.getElementById("loader-container");

/* ************************************************** DEFINE FUNCTIONS ************************************************** */
function showMessage(message){
    const messageText = document.getElementById("messagetext");
    const formText = document.getElementById("formText");

    formText.textContent = "";
    messageText.textContent = message;
    loader.style.display = "block";
    submitBtn.style.display = "none";

    setTimeout(() => {
        resetUI();
    },2500);
}

function resetUI(){
    const messageText = document.getElementById("messagetext");
    const formText = document.getElementById("formText"); 

    formText.textContent = "Student Information Form";
    messageText.textContent = "";
    loader.style.display = "none";
    submitBtn.style.display = "block";
}

function clearInputFileds(){
    document.getElementById("name").value = "";
    document.getElementById("student-number").value = "";
    document.getElementById("card-uid").value = "";
    document.getElementById("strand").value = "";
    document.getElementById("year-level").value = "";
    document.getElementById("phone-number").value = "";
    document.getElementById("additional-information").value = "";
    document.getElementById("medical-certificate").value = "";
    document.getElementById("profile-pic").value = "";
}

/* ************************************************** PROGRAM'S ENRTY POINT ************************************************** */
submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const studentNumber = document.getElementById("student-number").value;
    const cardUID = document.getElementById("card-uid").value;
    const strand = document.getElementById("strand").value;
    const yearLevel = document.getElementById("year-level").value;
    const phoneNumber = document.getElementById("phone-number").value;
    const additionalInfo = document.getElementById("additional-information").value;
    const medicalCertificateFile = document.getElementById("medical-certificate").files[0];
    const profilePic = document.getElementById("profile-pic").files[0];

    if(name && cardUID && strand && yearLevel && phoneNumber && additionalInfo && medicalCertificateFile){
        loader.style.display = "block";
        submitBtn.style.display = "none";

        // Name and section as template literal instead cardUID for better clarity
        const storageRef = ref(storage, `medical_certificates/${cardUID}.png`);
        const storagePro = ref(storage, `profile_pic/${cardUID}.png`);

        await uploadBytes(storageRef, medicalCertificateFile);
        await uploadBytes(storagePro, profilePic);

        console.log("File uploaded successfully!");

        try{
            // Use the student's name as the document ID
            const studentDocRef = doc(db, strand, yearLevel, "students", name);

            // Save the document with the student's name as the document ID
            await setDoc(studentDocRef, {
                name: name,
                strand: strand,
                yearLevel: yearLevel,
                studentNumber: studentNumber,
                cardUID: cardUID,
                phoneNumber: phoneNumber,
                additionalInfo: additionalInfo,
                medicalCertificateURL: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/medical_certificates%2F${cardUID}.png?alt=media`,
                profilePicURL: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/profile_pic%2F${cardUID}.png?alt=media`,
            });
        
            loader.style.display = "none";
            submitBtn.style.display = "block";

            showMessage("Student information saved successfully");
            clearInputFileds();
        }
        catch(error){
            console.error("Error adding document: ", error);
            alert("Error saving information. Please try again.");
        }
    }
    else{
        loader.style.display = "none";
        submitBtn.style.display = "block";
        showMessage("Fields must not be empty");
        clearInputFileds();
    }
});