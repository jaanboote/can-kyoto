// Canvia l'idioma de la carta: carrega al iframe el flipbook de Heyzine del botó triat.
// Sense JavaScript, cada botó és un enllaç normal que obre el flipbook.

const flipbook = document.getElementById("flipbook");
const pantallaCompleta = document.getElementById("pantalla-completa");
const botons = document.querySelectorAll(".idioma");

botons.forEach(function (boto) {
  boto.addEventListener("click", function (e) {
    e.preventDefault();   // no obre l'enllaç: només canvia el iframe
    flipbook.src = boto.href;
    pantallaCompleta.href = boto.href;
    botons.forEach(function (b) { b.setAttribute("aria-pressed", b === boto); });
  });
});
