// =====================================================
// LA SALA EN DIRECTE (secció de la portada)
// Pinta el plànol amb les taules lliures i ocupades ara mateix.
// shortcut: les persones assegudes són inventades i canvien soles cada 4 s;
// quan hi hagi sensors, es llegiran del servidor (Home Assistant).
// =====================================================

// La llista de taules és a js/taules.js


// Persones assegudes a cada taula (si no hi és, està lliure)
const gent = { 1: 2, 3: 4, 7: 6, 10: 3 };

function pintarSala() {
  const mapa = document.querySelector("#mapa-sala");
  for (const t of mapa.querySelectorAll(".taula")) t.remove();

  let lliures = 0;
  for (const t of taules) {
    const assegudes = gent[t.num] || 0;
    if (assegudes === 0) lliures++;

    const div = crearTaula("div", t, assegudes);
    div.classList.add(assegudes > 0 ? "ocupada" : "lliure");
    mapa.appendChild(div);
  }

  const paraula = lliures === 1 ? " taula lliure" : " taules lliures";
  document.querySelector("#lliures").textContent = lliures + paraula + " de " + taules.length;
}

// Simulació: cada 4 segons una taula canvia (algú s'asseu o se'n va)
setInterval(() => {
  const t = taules[Math.floor(Math.random() * taules.length)];
  gent[t.num] = gent[t.num] ? 0 : 1 + Math.floor(Math.random() * t.places);
  pintarSala();
}, 4000);

pintarSala();
