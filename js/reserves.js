// =====================================================
// RESERVES DE CAN KYOTO
// La web no té servidor (GitHub Pages): les taules ocupades són un exemple fix
// i la reserva no s'envia enlloc, només es mostra la confirmació.
// =====================================================

// Taules ocupades d'exemple a cada torn: { número de taula: persones assegudes }
const ocupades = {
  dinar: { 2: 3, 5: 4, 9: 5 },
  sopar: { 1: 2, 3: 4, 7: 6, 10: 3 },
};

const hores = {
  dinar: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
  sopar: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
};

// El que tria el client
let persones = 2;
let torn = "sopar";
let taulaTriada = 0;

const data = document.querySelector("#data");
const hora = document.querySelector("#hora");

// No es pot reservar per a un dia que ja ha passat
data.min = new Date().toISOString().slice(0, 10);
data.value = data.min;

// Text del resum: "2 persones, dc. 25 de nov., sopar a les 20:00, taula 4"
function resum() {
  const dia = new Date(data.value).toLocaleDateString("ca-ES", { weekday: "short", day: "numeric", month: "short" });
  let text = persones + (persones === 1 ? " persona, " : " persones, ") + dia + ", " + torn;
  if (hora.value) text += " a les " + hora.value;
  if (taulaTriada) text += ", taula " + taulaTriada;
  return text;
}

// Ensenya només el pas que toca (4 = reserva feta)
function mostrarPas(numero) {
  for (let i = 1; i <= 3; i++) {
    document.querySelector("#pas" + i).hidden = i !== numero;
    document.querySelector("#marca" + i).classList.toggle("actiu", i === numero);
  }
  document.querySelector("#fet").hidden = numero !== 4;
  window.scrollTo(0, 0);
}


// ---------- PAS 1: persones, dia i torn ----------

for (const boto of document.querySelectorAll("#persones .opcio")) {
  boto.addEventListener("click", () => {
    document.querySelector("#persones .triat").classList.remove("triat");
    boto.classList.add("triat");
    persones = Number(boto.dataset.valor);
  });
}

for (const boto of document.querySelectorAll("#torns .opcio")) {
  boto.addEventListener("click", () => {
    document.querySelector("#torns .triat").classList.remove("triat");
    boto.classList.add("triat");
    torn = boto.dataset.valor;
  });
}

document.querySelector("#anar-pas2").addEventListener("click", () => {
  hora.innerHTML = '<option value="">Tria una hora</option>';
  for (const h of hores[torn]) {
    hora.innerHTML += "<option>" + h + "</option>";
  }
  taulaTriada = 0;
  pintarMapa();
  mostrarPas(2);
});


// ---------- PAS 2: hora i taula ----------

// Dibuixa el plànol. Només es poden clicar les taules lliures prou grans.
function pintarMapa() {
  const mapa = document.querySelector("#mapa");
  for (const t of mapa.querySelectorAll(".taula")) t.remove();

  for (const t of taules) {
    const gent = ocupades[torn][t.num] || 0;

    let estat = "lliure";
    if (gent > 0) estat = "ocupada";
    else if (t.places < persones) estat = "petita";
    if (t.num === taulaTriada) estat = "triada";

    const boto = crearTaula("button", t, gent);
    boto.classList.add(estat);
    boto.disabled = estat === "ocupada" || estat === "petita";
    boto.addEventListener("click", () => {
      taulaTriada = t.num;
      pintarMapa();
    });
    mapa.appendChild(boto);
  }
  document.querySelector("#resum2").textContent = resum();
}

hora.addEventListener("change", pintarMapa);

document.querySelector("#anar-pas3").addEventListener("click", () => {
  const error = document.querySelector("#error2");
  if (hora.value === "" || taulaTriada === 0) {
    error.textContent = "Tria una hora i una taula verda per continuar.";
    return;
  }
  error.textContent = "";
  document.querySelector("#resum3").textContent = resum();
  mostrarPas(3);
});

document.querySelector("#tornar-pas1").addEventListener("click", () => mostrarPas(1));
document.querySelector("#tornar-pas2").addEventListener("click", () => mostrarPas(2));


// ---------- PAS 3: dades i confirmació ----------

// El navegador ja comprova els camps obligatoris (required) abans d'arribar aquí
document.querySelector("#pas3").addEventListener("submit", (e) => {
  e.preventDefault();   // no hi ha servidor on enviar el formulari
  const nom = document.querySelector("#nom").value;
  document.querySelector("#resum-fet").textContent = nom + ", t'esperem: " + resum() + ".";
  e.target.reset();
  mostrarPas(4);
});

document.querySelector("#nova").addEventListener("click", () => mostrarPas(1));
