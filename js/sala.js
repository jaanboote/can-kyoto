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
