// =====================================================
// LA SALA EN DIRECTE (secció de la portada)
// Pinta el plànol amb les taules lliures i ocupades ara mateix.
// shortcut: les persones assegudes són inventades i canvien soles cada 4 s;
// quan hi hagi sensors, es llegiran del servidor (Home Assistant).
// =====================================================

const taulesSala = [
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

// Persones assegudes a cada taula (si no hi és, està lliure)
const gent = { 1: 2, 3: 4, 7: 6, 10: 3 };

function pintarSala() {
  const mapa = document.querySelector("#mapa-sala");
  for (const t of mapa.querySelectorAll(".taula")) t.remove();

  let lliures = 0;
  for (const t of taulesSala) {
    const assegudes = gent[t.num] || 0;
    if (assegudes === 0) lliures++;

    // Cadires: la meitat a dalt i la meitat a baix. Les ocupades surten plenes.
    let cadires = "";
    const meitat = t.places / 2;
    for (let i = 0; i < t.places; i++) {
      const costat = i < meitat ? "dalt" : "baix";
      const posicio = ((i % meitat) + 0.5) / meitat * 100;
      const plena = i < assegudes ? " plena" : "";
      cadires += '<i class="cadira ' + costat + plena + '" style="left:' + posicio + '%"></i>';
    }

    const div = document.createElement("div");
    div.className = "taula " + (assegudes > 0 ? "ocupada" : "lliure");
    div.style.left = t.x + "%";
    div.style.top = t.y + "%";
    div.style.width = t.amplada + "%";
    div.style.height = t.alcada + "%";
    const text = assegudes > 0 ? assegudes + "/" + t.places : t.places + " places";
    div.innerHTML = cadires + '<span class="tauler"><b>T' + t.num + "</b><span>" + text + "</span></span>";
    mapa.appendChild(div);
  }

  document.querySelector("#lliures").textContent = lliures + " taules lliures de " + taulesSala.length;
}

// Simulació: cada 4 segons una taula canvia (algú s'asseu o se'n va)
setInterval(() => {
  const t = taulesSala[Math.floor(Math.random() * taulesSala.length)];
  gent[t.num] = gent[t.num] ? 0 : 1 + Math.floor(Math.random() * t.places);
  pintarSala();
}, 4000);

pintarSala();
