import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("search");
    const searchInput = document.getElementById("search-input");
    const addInfoArea = document.getElementById("add-info-area");
    const medicalCertImage = document.getElementById("medical-cert-image");
    const totalNumberStudentsElement = document.getElementById("totalNumberStudents");
    /* SIR MHEL */
    const visitDisplay = document.getElementById("visit-display");

    let searchCount = JSON.parse(localStorage.getItem('searchCount')) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var ctx = document.getElementById('searchAnalyticsChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], //['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            datasets: [{
                label: 'Searches per Month',
                data: searchCount,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const countTotalStudents = async () => {
        const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
        const yearLevels = ["GRADE-11", "GRADE-12"];
        let totalStudents = 0;

        try{
            for(const strand of strands){
                for(const yearLevel of yearLevels){
                    const studentCollection = collection(db, strand, yearLevel, "students");
                    const querySnapshot = await getDocs(studentCollection);
                    totalStudents += querySnapshot.size;
                }
            }
            totalNumberStudentsElement.textContent = totalStudents;
        }
        catch(error){
            console.error("Error counting students:", error);
            totalNumberStudentsElement.textContent = "Error";
        }
    };

    countTotalStudents();

    /* VERSION CHANGE */
    let currentStudentNumber = "";

    const performSearch = async () => {
        const searchValue = searchInput.value.trim();
        addInfoArea.textContent = "";
        medicalCertImage.style.display = "none";
    
        if(!searchValue){
            addInfoArea.textContent = "Please enter a student number.";
            setTimeout(() => {
                addInfoArea.textContent = "";
            }, 1500);
            document.getElementById("med-cert-container").style.backgroundImage = "url(images/STI.png)";
            document.getElementById("med-cert-container").style.backgroundPosition = "center";
            document.getElementById("med-cert-container").style.backgroundRepeat = "no-repeat";
            document.getElementById("med-cert-container").style.backgroundColor = "#FFF200";
            return;
        }
    
        try{
            const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
            const yearLevels = ["GRADE-11", "GRADE-12"];
            let studentFound = false;
    
            for(const strand of strands){
                for(const yearLevel of yearLevels){
                    document.getElementById("profile-container").style.display = "none";
                    document.getElementById("addContainer").style.display = "none";
    
                    document.getElementById("med-cert-container").style.backgroundImage = "url(images/STI.png)";
                    document.getElementById("med-cert-container").style.backgroundPosition = "center";
                    document.getElementById("med-cert-container").style.backgroundRepeat = "no-repeat";
                    document.getElementById("med-cert-container").style.backgroundColor = "#FFF200";
                    addInfoArea.textContent += `Searching in ${strand} - ${yearLevel}\n`;
    
                    /* QUERY FOR STUDENT INFO */
                    const q = query(
                        collection(db, strand, yearLevel, "students"),
                        where("studentNumber", "==", searchValue)
                    );
    
                    const querySnapshot = await getDocs(q);
    
                    if(!querySnapshot.empty){
                        for(const doc of querySnapshot.docs){
                            const data = doc.data();
                            addInfoArea.textContent = `Name: ${data.name}\n\nStudent Number: ${data.studentNumber}\n\nCard UID: ${data.cardUID}\n\nPhone Number: ${data.phoneNumber}\n\nAdditional Info: ${data.additionalInfo}\n`;
    
                            currentStudentNumber = data.studentNumber;
    
                            if(data.medicalCertificateURL && data.profilePicURL){
                                document.getElementById("med-cert-container").style.background = "#fff";
                                medicalCertImage.src = data.medicalCertificateURL;
                                medicalCertImage.style.display = "flex";
    
                                document.getElementById("profile-container").style.display = "block";
                                document.getElementById("profile-pic").src = data.profilePicURL;
                                document.getElementById("name-display").textContent = data.name;
                                document.getElementById("section-display").textContent = `${data.strand} - ${data.yearLevel}`;
    
                                /* STUDENT CARD CONTAINER */
                                document.getElementById("addInfo").addEventListener('click', () => {
                                    document.getElementById("addContainer").style.display = "flex";
                                    document.getElementById("add-btn-container").style.display = "flex";
                                });

                                /* SIR MHEL */
                               
                                await loadMedicalCards(currentStudentNumber); // Await here
                            }
                            else{
                                medicalCertImage.style.display = "none";
                            }
                            studentFound = true;
                        }
                        if(studentFound) break;
                    }
                }
                if(studentFound) break;
            }
    
            if(!studentFound){
                addInfoArea.textContent = "No data found for the given Student Number or Name.";
                setTimeout(() => {
                    addInfoArea.textContent = "";
                    searchInput.value = "";
                }, 1500);
            }
            else{
                incrementSearchCount();
            }
        }
        catch(error){
            console.error("Error searching for student:", error);
            addInfoArea.textContent = "Error retrieving student data. Please try again later.";
            setTimeout(() => {
                addInfoArea.textContent = "";
                searchInput.value = "";
            }, 1500);
        }
    };

    searchInput.addEventListener('keypress', (event) => {
        if(event.key === 'Enter'){
            performSearch();
        }
    });

    search.addEventListener('click', () => {
        performSearch();
    });

    function incrementSearchCount(){
        const currentMonth = new Date().getMonth();
        searchCount[currentMonth]++;
        localStorage.setItem('searchCount', JSON.stringify(searchCount));
        chart.update();
    }

    /* ADD = CANCEL / TOGGLE BTN */
    document.getElementById("cancelButton1").addEventListener('click', () => {
        document.getElementById("addContainer").style.display = "none";
        resetInput();
    });

    document.getElementById("addButton1").addEventListener('click', async () => {
        const addDate = document.getElementById("addDate").value;
        const addReason = document.getElementById("addReason").value;
        const addTreatment = document.getElementById("addTreatment").value;

        /* VERSION CHANGE */
        if(!currentStudentNumber){
            console.error("No student number available.");
            return;
        }

        try{
            document.getElementById("add-btn-container").style.display = "none";

            document.getElementById("loader-container").style.display = "flex";

            const card = document.createElement("div");
            card.classList.add("cards");
            card.innerHTML = `
                <p>Date: ${addDate}</p>
                <p>Reason: ${addReason}</p>
                <p>Treatment: ${addTreatment}</p>
            `;

            const cardsQuery = query(collection(db, "Medical Cards", currentStudentNumber, "Cards"));
            const cardsSnapshot = await getDocs(cardsQuery);
            const visitNum = cardsSnapshot.size;

            await addDoc(collection(db, "Medical Cards", currentStudentNumber, "Cards"), {
                date: addDate,
                reason: addReason,
                treatment: addTreatment,
                visitNum: visitNum
            });
            
            visitDisplay.textContent = visitNum + 1;

            document.getElementById("card-container").prepend(card);

            document.getElementById("noCardsDisplay").style.display = "none";

            document.getElementById("loader-container").style.display = "none";

            console.log("Card successfully added!");
        }
        catch(error){
            console.error("Error adding cards: ", error);
        }

        resetInput();
        document.getElementById("addContainer").style.display = "none";
    });

    /* VERSION CHANGE */
    const loadMedicalCards = async (studentNumber) => {
        const cardsContainer = document.getElementById("card-container");
        cardsContainer.innerHTML = ""; // Clear existing cards
    
        try{
            const cardsQuery = query(collection(db, "Medical Cards", studentNumber, "Cards"));
            const cardsSnapshot = await getDocs(cardsQuery);
    
            if(cardsSnapshot.empty){
                const noCardsMessage = document.createElement("p");
                noCardsMessage.textContent = "No medical admission details found for this student.";
                noCardsMessage.style.textAlign = "center";
                noCardsMessage.id = "noCardsDisplay";
                cardsContainer.appendChild(noCardsMessage);
                visitDisplay.textContent = "0";
                return;
            }

            let totalVisits = 0;
    
            cardsSnapshot.forEach(doc => {
                const cardData = doc.data();
                const card = document.createElement("div");
                card.classList.add("cards");
                card.innerHTML = `
                    <p>Date: ${cardData.date}</p>
                    <p>Reason: ${cardData.reason}</p>
                    <p>Treatment: ${cardData.treatment}</p>
                `;
                cardsContainer.appendChild(card);
                totalVisits++;
            });
            visitDisplay.textContent = totalVisits;
        }
        catch(error){
            console.error("Error loading medical cards:", error);
        }
    };
    
    function resetInput(){
        document.getElementById("addDate").value = "";
        document.getElementById("addReason").value = "";
        document.getElementById("addTreatment").value = "";
    }
});


/* final perform search

const performSearch = async () => {
        const searchValue = searchInput.value.trim();
        addInfoArea.textContent = "";
        medicalCertImage.style.display = "none";
    
        if (!searchValue) {
            addInfoArea.textContent = "Please enter a student number.";
            setTimeout(() => {
                addInfoArea.textContent = "";
            }, 1500);
            document.getElementById("med-cert-container").style.backgroundImage = "url(images/STI.png)";
            document.getElementById("med-cert-container").style.backgroundPosition = "center";
            document.getElementById("med-cert-container").style.backgroundRepeat = "no-repeat";
            document.getElementById("med-cert-container").style.backgroundColor = "#FFF200";
            return;
        }
    
        try {
            const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
            const yearLevels = ["GRADE-11", "GRADE-12"];
            let studentFound = false;
    
            for (const strand of strands) {
                for (const yearLevel of yearLevels) {
                    document.getElementById("profile-container").style.display = "none";
                    document.getElementById("addContainer").style.display = "none";
    
                    document.getElementById("med-cert-container").style.backgroundImage = "url(images/STI.png)";
                    document.getElementById("med-cert-container").style.backgroundPosition = "center";
                    document.getElementById("med-cert-container").style.backgroundRepeat = "no-repeat";
                    document.getElementById("med-cert-container").style.backgroundColor = "#FFF200";
                    addInfoArea.textContent += `Searching in ${strand} - ${yearLevel}\n`;
    
                    /* QUERY FOR STUDENT INFO 
                    const q = query(
                        collection(db, strand, yearLevel, "students"),
                        where("studentNumber", "==", searchValue)
                    );
    
                    const querySnapshot = await getDocs(q);
    
                    if (!querySnapshot.empty) {
                        for (const doc of querySnapshot.docs) {
                            const data = doc.data();
                            addInfoArea.textContent = `Name: ${data.name}\n\nStudent Number: ${data.studentNumber}\n\nCard UID: ${data.cardUID}\n\nPhone Number: ${data.phoneNumber}\n\nAdditional Info: ${data.additionalInfo}\n`;
    
                            currentStudentNumber = data.studentNumber;
    
                            if (data.medicalCertificateURL && data.profilePicURL) {
                                document.getElementById("med-cert-container").style.background = "#fff";
                                medicalCertImage.src = data.medicalCertificateURL;
                                medicalCertImage.style.display = "flex";
    
                                document.getElementById("profile-container").style.display = "block";
                                document.getElementById("profile-pic").src = data.profilePicURL;
                                document.getElementById("name-display").textContent = data.name;
                                document.getElementById("section-display").textContent = `${data.strand} - ${data.yearLevel}`;
    
                                /* STUDENT CARD CONTAINER 
                                document.getElementById("addInfo").addEventListener('click', () => {
                                    document.getElementById("addContainer").style.display = "flex";
                                });
    
                                await loadMedicalCards(currentStudentNumber); // Await here
                            } else {
                                medicalCertImage.style.display = "none";
                            }
                            studentFound = true;
                        }
                        if (studentFound) break;
                    }
                }
                if (studentFound) break;
            }
    
            if (!studentFound) {
                addInfoArea.textContent = "No data found for the given Student Number or Name.";
                setTimeout(() => {
                    addInfoArea.textContent = "";
                    searchInput.value = "";
                }, 1500);
            } else {
                incrementSearchCount();
            }
        } catch (error) {
            console.error("Error searching for student:", error);
            addInfoArea.textContent = "Error retrieving student data. Please try again later.";
            setTimeout(() => {
                addInfoArea.textContent = "";
                searchInput.value = "";
            }, 1500);
        }
    };*/

/*
show med cert upon search
const medicalCardsRef = collection(db, `students/${searchValue}/medicalCards`); 
        
    
        const querySnapshotCards = await getDocs(medicalCardsRef);
        if (!querySnapshotCards.empty) {
            querySnapshotCards.forEach(doc => {
                const cardData = doc.data();
                const card = document.createElement("div");
                card.classList.add("cards");
                card.innerHTML = `
                    <p>Date: ${cardData.date}</p>
                    <p>Reason: ${cardData.reason}</p>
                    <p>Treatment: ${cardData.treatment}</p>
                `;
                detailContainer.appendChild(card);
            });
        } else {
            addInfoArea.textContent += "No medical cards found for this student.";
        }
    
*/

/*

    
const addInfo = document.getElementById("addInfo");
const detailContainer = document.getElementById("detailContainer");
const addContainer = document.getElementById("addContainer");

const addButton1 = document.getElementById("addButton1");
const cancelButton1 = document.getElementById("cancelButton1");

addInfo.addEventListener('click', () => {
    addContainer.style.display = "flex";
    console.log("Add button clicked");
});

addButton1.addEventListener('click', async () => {
    const addDate = document.getElementById("addDate");
    const addReason = document.getElementById("addReason");
    const addTreatment = document.getElementById("addTreatment");

    if(addDate.value === "" || addReason.value === "" || addTreatment.value === ""){
        alert("Fields must not be empty");
        return;
    }

    const cardData = {
        date: addDate.value,
        reason: addReason.value,
        treatment: addTreatment.value
    };

    try {
        const studentNumber = searchInput.value; // Get the student number
        const medicalCardsRef = collection(db, 'students', studentNumber, 'medicalCards'); // Correctly reference the subcollection

        await addDoc(medicalCardsRef, cardData); // Add the document to the correct collection
        alert("Medical card added successfully!");

        const card = document.createElement("div");
        const pDate = document.createElement("p");
        const pReason = document.createElement("p");
        const pTreatment = document.createElement("p");

        card.classList.add("cards");

        pDate.textContent = `Date of Admission: ${addDate.value}`;
        pReason.textContent = `Reason for Admission: ${addReason.value}`;
        pTreatment.textContent = `Treatment: ${addTreatment.value}`;

        card.append(pDate, pReason, pTreatment);
        detailContainer.append(card);

        resetInput();
        addContainer.style.display = "none";
    } catch (error) {
        console.error("Error adding medical card:", error);
        alert("Failed to add medical card.");
    }
});

cancelButton1.addEventListener('click', () => {
    addContainer.style.display = "none";
    resetInput();
});


async function tanginaayokona(searchValue) {
    const medicalCardsRef = collection(db, `students/${searchValue}/medicalCards`);
    const querySnapshotCards = await getDocs(medicalCardsRef);
    
    if(!querySnapshotCards.empty){
        querySnapshotCards.forEach(doc => {
            const cardData = doc.data();
            const card = document.createElement("div");
            card.classList.add("cards");
            card.innerHTML = `
                <p>Date: ${cardData.date}</p>
                <p>Reason: ${cardData.reason}</p>
                <p>Treatment: ${cardData.treatment}</p>
            `;
            detailContainer.appendChild(card);
        });
    }
    else{
        addInfoArea.textContent += "No medical cards found for this student.";
    }
}

function resetInput(){
    const addDate = document.getElementById("addDate").value = "";
    const addReason = document.getElementById("addReason").value = "";
    const addTreatment = document.getElementById("addTreatment").value = "";
}
*/

/* 
adding of profile pic
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    localStorage.clear();
    const search = document.getElementById("search");
    const searchInput = document.getElementById("search-input");
    const addInfoArea = document.getElementById("add-info-area");
    const medicalCertImage = document.getElementById("medical-cert-image");
    const totalNumberStudentsElement = document.getElementById("totalNumberStudents");

    let searchCount = JSON.parse(localStorage.getItem('searchCount')) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var ctx = document.getElementById('searchAnalyticsChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'Searches per Month',
                data: searchCount,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const countTotalStudents = async () => {
        const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
        const yearLevels = ["GRADE-11", "GRADE-12"];
        let totalStudents = 0;

        try{
            for(const strand of strands){
                for(const yearLevel of yearLevels){
                    const studentCollection = collection(db, strand, yearLevel, "students");
                    const querySnapshot = await getDocs(studentCollection);
                    totalStudents += querySnapshot.size;
                }
            }
            totalNumberStudentsElement.textContent = totalStudents;
        }
        catch(error){
            console.error("Error counting students:", error);
            totalNumberStudentsElement.textContent = "Error";
        }
    };

    countTotalStudents();

    const performSearch = async () => {
        const searchValue = searchInput.value.trim();

        addInfoArea.textContent = "";
        
        medicalCertImage.style.display = "none";

        if(!searchValue){
            addInfoArea.textContent = "Please enter a student number.";
            setTimeout(() => {
                addInfoArea.textContent = "";
            },1500);
            document.getElementById("med-cert-container").style.backgroundImage = "url(images/STI.png)";
                    document.getElementById("med-cert-container").style.backgroundPosition = "center";
                    document.getElementById("med-cert-container").style.backgroundRepeat = "no-repeat";
                    document.getElementById("med-cert-container").style.backgroundColor = "#FFF200";
            return;
        }

        try{
            const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
            const yearLevels = ["GRADE-11", "GRADE-12"];
            let studentFound = false;

            for(const strand of strands){
                for(const yearLevel of yearLevels){
                    document.getElementById("med-cert-container").style.backgroundImage = "url(images/STI.png)";
                    document.getElementById("med-cert-container").style.backgroundPosition = "center";
                    document.getElementById("med-cert-container").style.backgroundRepeat = "no-repeat";
                    document.getElementById("med-cert-container").style.backgroundColor = "#FFF200";
                    addInfoArea.textContent += `Searching in ${strand} - ${yearLevel}\n`;
                    const q = query(
                        collection(db, strand, yearLevel, "students"),
                        where("studentNumber", "==", searchValue)
                    );

                    const querySnapshot = await getDocs(q);

                    if(!querySnapshot.empty){
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            addInfoArea.textContent = `Name: ${data.name}\n\nStudent Number: ${data.studentNumber}\n\nCard UID: ${data.cardUID}\n\nPhone Number: ${data.phoneNumber}\n\nAdditional Info: ${data.additionalInfo}\n`;

                            if(data.medicalCertificateURL){
                                document.getElementById("med-cert-container").style.background = "#fff";
                                medicalCertImage.src = data.medicalCertificateURL;
                                medicalCertImage.style.display = "flex";
                            }
                            else{
                                medicalCertImage.style.display = "none";
                            }
                            studentFound = true;
                        });
                        if(studentFound)break;
                    }
                }
                if(studentFound)break;
            }

            if(!studentFound){
                addInfoArea.textContent = "No data found for the given Student Number or Name.";
                setTimeout(() => {
                    addInfoArea.textContent = "";
                    searchInput.value = "";
                },1500);
            }
            else{
                incrementSearchCount();
            }
        }
        catch(error){
            console.error("Error searching for student:", error);
            addInfoArea.textContent = "Error retrieving student data. Please try again later.";
            setTimeout(() => {
                addInfoArea.textContent = "";
                searchInput.value = "";
            },1500);
        }
    };

    searchInput.addEventListener('keypress', (event) => {
        if(event.key === 'Enter'){
            performSearch();
        }
    });

    search.addEventListener('click', () => {
        performSearch();
    });

    function incrementSearchCount(){
        const currentMonth = new Date().getMonth();
        searchCount[currentMonth]++;
        localStorage.setItem('searchCount', JSON.stringify(searchCount));
        chart.update();
    }
});
*/

/*
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("search");
    const searchInput = document.getElementById("search-input");
    const addInfoArea = document.getElementById("add-info-area");
    const medicalCertImage = document.getElementById("medical-cert-image");
    const totalNumberStudentsElement = document.getElementById("totalNumberStudents");

    let searchCount = JSON.parse(localStorage.getItem('searchCount')) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var ctx = document.getElementById('searchAnalyticsChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'Searches per Month',
                data: searchCount,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const countTotalStudents = async () => {
        const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
        const yearLevels = ["GRADE-11", "GRADE-12"];
        let totalStudents = 0;

        try{
            for(const strand of strands){
                for(const yearLevel of yearLevels){
                    const studentCollection = collection(db, strand, yearLevel, "students");
                    const querySnapshot = await getDocs(studentCollection);
                    totalStudents += querySnapshot.size;
                }
            }
            totalNumberStudentsElement.textContent = totalStudents;
        }
        catch(error){
            console.error("Error counting students:", error);
            totalNumberStudentsElement.textContent = "Error";
        }
    };

    countTotalStudents();

    const performSearch = async () => {
        const searchValue = searchInput.value.trim();

        addInfoArea.textContent = "";
        medicalCertImage.style.display = "block";
        medicalCertImage.src = "images/STI.png";

        if(!searchValue){
            addInfoArea.textContent = "Please enter a student number.";
            setTimeout(() => {
                addInfoArea.textContent = "";
            },1500);
            document.getElementById("med-cert-container").style.background = "#FFF200";
            return;
        }

        addInfoArea.textContent = "";
        medicalCertImage.style.display = "none";

        try{
            const strands = ["MAWD", "STEM", "HUMSS", "ABM"];
            const yearLevels = ["GRADE-11", "GRADE-12"];
            let studentFound = false;

            for(const strand of strands){
                for(const yearLevel of yearLevels){
                    document.getElementById("med-cert-container").style.background = "#FFF200";
                    medicalCertImage.style.display = "block";
                    medicalCertImage.src = "images/STI.png";
                    addInfoArea.textContent += `Searching in ${strand} - ${yearLevel}\n`;
                    const q = query(
                        collection(db, strand, yearLevel, "students"),
                        where("studentNumber", "==", searchValue)
                    );

                    const querySnapshot = await getDocs(q);

                    if(!querySnapshot.empty){
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            addInfoArea.textContent = `Name: ${data.name}\n\nStudent Number: ${data.studentNumber}\n\nCard UID: ${data.cardUID}\n\nPhone Number: ${data.phoneNumber}\n\nAdditional Info: ${data.additionalInfo}\n`;

                            if(data.medicalCertificateURL){
                                document.getElementById("med-cert-container").style.display = "block";
                                document.getElementById("med-cert-container").style.background = "#fff";
                                medicalCertImage.src = data.medicalCertificateURL;
                                medicalCertImage.style.display = "block";
                            }
                            else{
                                medicalCertImage.style.display = "none";
                            }
                            studentFound = true;
                        });
                        if(studentFound)break;
                    }
                }
                if(studentFound)break;
            }

            if(!studentFound){
                document.getElementById("med-cert-container").style.background = "#FFF200";
                addInfoArea.textContent = "";
                medicalCertImage.style.display = "block";
                medicalCertImage.src = "images/STI.png";
                addInfoArea.textContent = "No data found for the given Student Number or Name.";
                setTimeout(() => {
                    addInfoArea.textContent = "";
                    searchInput.value = "";
                },1500);
            }
            else{
                incrementSearchCount();
            }
        }
        catch(error){
            console.error("Error searching for student:", error);
            document.getElementById("med-cert-container").style.background = "#FFF200";
            medicalCertImage.style.display = "block";
            medicalCertImage.src = "images/STI.png";
            addInfoArea.textContent = "Error retrieving student data. Please try again later.";
            setTimeout(() => {
                addInfoArea.textContent = "";
                searchInput.value = "";
            },1500);
        }
    };

    searchInput.addEventListener('keypress', (event) => {
        if(event.key === 'Enter'){
            performSearch();
        }
    });

    search.addEventListener('click', () => {
        performSearch();
    });

    function incrementSearchCount(){
        const currentMonth = new Date().getMonth();
        searchCount[currentMonth]++;
        localStorage.setItem('searchCount', JSON.stringify(searchCount));
        chart.update();
    }
});
*/