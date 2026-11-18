// Quan baixes per la portada, el menú fix ensenya el logo petit
// (a dalt de tot no cal, perquè ja es veu el logo gran)
const menu = document.querySelector(".menu");

window.addEventListener("scroll", () => {
  menu.classList.toggle("avall", window.scrollY > 300);
});
