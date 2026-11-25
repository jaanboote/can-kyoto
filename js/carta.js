const flipbook = document.getElementById("flipbook");
const pantallaCompleta = document.getElementById("pantalla-completa");
const idiomes = document.querySelectorAll(".idioma");

for (const idioma of idiomes) {
  idioma.addEventListener("click", (e) => {
    e.preventDefault();
    flipbook.src = idioma.href;
    pantallaCompleta.href = idioma.href;
    document.querySelector(".idioma.actiu").classList.remove("actiu");
    idioma.classList.add("actiu");
  });
}
