function studentInfoNavigation(){
    window.location.href = "student-form.html";
}

const crossBtn = document.getElementById("crossBtn");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("nav-links");

menuBtn.addEventListener("click", () => {
    navLinks.style.display = "flex";
});
crossBtn.addEventListener("click", () => {
    navLinks.style.display = "none";
});

const handleResize = () => navLinks.style.display = window.innerWidth > 1024 ? "flex" : "none";
window.addEventListener('resize', handleResize);
handleResize();