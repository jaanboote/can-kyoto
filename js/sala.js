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
  document.querySelector("#lliures").textContent =
    lliures + paraula + " de " + taules.length;
}

setInterval(() => {
  const t = taules[Math.floor(Math.random() * taules.length)];
  gent[t.num] = gent[t.num] ? 0 : 1 + Math.floor(Math.random() * t.places);
  pintarSala();
}, 4000);

pintarSala();
