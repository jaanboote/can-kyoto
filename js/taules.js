// =====================================================
// TAULES DE LA SALA
// Les fan servir la portada (sala.js) i les reserves (reserves.js):
// si canvies una taula, només cal canviar-la aquí.
// =====================================================

// Cada taula: número, places i posició al mapa en % (esquerra, dalt, amplada, alçada)
const taules = [
  { num: 1, places: 4, x: 20.5, y: 14, amplada: 8, alcada: 17 },
  { num: 2, places: 4, x: 34, y: 14, amplada: 8, alcada: 17 },
  { num: 3, places: 4, x: 47.5, y: 14, amplada: 8, alcada: 17 },
  { num: 4, places: 4, x: 61, y: 14, amplada: 8, alcada: 17 },
  { num: 5, places: 4, x: 74.5, y: 14, amplada: 8, alcada: 17 },
  { num: 6, places: 4, x: 88, y: 14, amplada: 8, alcada: 17 },
  { num: 7, places: 6, x: 21.5, y: 52, amplada: 12, alcada: 17 },
  { num: 8, places: 6, x: 41.5, y: 52, amplada: 12, alcada: 17 },
  { num: 9, places: 6, x: 61.5, y: 52, amplada: 12, alcada: 17 },
  { num: 10, places: 4, x: 84, y: 48, amplada: 8, alcada: 17 },
];

// Crea una taula del plànol (un div o un botó) amb les cadires i el número.
// "gent" són les persones assegudes: aquestes cadires surten plenes.
function crearTaula(etiqueta, t, gent) {
  let cadires = "";
  const meitat = t.places / 2;
  for (let i = 0; i < t.places; i++) {
    const costat = i < meitat ? "dalt" : "baix";
    const posicio = ((i % meitat) + 0.5) / meitat * 100;
    const plena = i < gent ? " plena" : "";
    cadires += '<i class="cadira ' + costat + plena + '" style="left:' + posicio + '%"></i>';
  }
  const text = gent > 0 ? gent + "/" + t.places : t.places + " places";

  const el = document.createElement(etiqueta);
  el.className = "taula";
  el.style.left = t.x + "%";
  el.style.top = t.y + "%";
  el.style.width = t.amplada + "%";
  el.style.height = t.alcada + "%";
  el.innerHTML = cadires + '<span class="tauler"><b>T' + t.num + "</b><span>" + text + "</span></span>";
  return el;
}
