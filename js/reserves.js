// =====================================================
// RESERVES DE CAN KYOTO
// La web no té servidor (GitHub Pages), per això:
//  - les taules ocupades són un exemple fix (més endavant les llegirem dels sensors)
//  - les reserves noves es guarden al navegador amb localStorage
// =====================================================

// ---------- DADES ----------

// La llista de taules és a js/taules.js

// Taules ocupades d'exemple per a cada torn: { número de taula: persones assegudes }
const ocupadesExemple = {
  dinar: { 2: 3, 5: 4, 9: 5 },
  sopar: { 1: 2, 3: 4, 7: 6, 10: 3 },
};

const hores = {
  dinar: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"],
  sopar: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"],
};

const nomsDies = ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."];
const nomsMesos = ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."];

// El que ha triat el client
let persones = 2;
let data = new Date();
let torn = "sopar";
let hora = "";
let taulaTriada = 0;


// ---------- FUNCIONS D'AJUDA ----------

// Data en format 2026-11-16. No fem servir toISOString() perquè passa a hora UTC
// i a Barcelona, a mitjanit, donaria el dia anterior.
function dataText(d) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mes + "-" + dia;
}

// Data per mostrar: "dl. 16 nov."
function dataBonica(d) {
  return nomsDies[d.getDay()] + " " + d.getDate() + " " + nomsMesos[d.getMonth()];
}

// Llegeix les reserves guardades al navegador
function llegirReserves() {
  const text = localStorage.getItem("reserves");
  if (text === null) return [];
  return JSON.parse(text);
}

// Retorna un objecte { taula: persones } amb les taules ocupades del dia i torn triats
function taulesOcupades() {
  const ocupades = { ...ocupadesExemple[torn] };
  for (const r of llegirReserves()) {
    if (r.data === dataText(data) && r.torn === torn) {
      ocupades[r.taula] = r.persones;
    }
  }
  return ocupades;
}

// "1 persona" o "4 persones"
function textPersones() {
  return persones === 1 ? "1 persona" : persones + " persones";
}

function resum() {
  let text = textPersones() + ", " + dataBonica(data) + ", " + torn;
  if (hora) text += " a les " + hora;
  if (taulaTriada) text += ", taula " + taulaTriada;
  return text;
}

// Marca un botó com a triat i desmarca la resta del mateix grup
function marcar(grup, boto) {
  for (const b of grup.querySelectorAll(".opcio")) b.classList.remove("triat");
  boto.classList.add("triat");
}


// ---------- PAS 1: persones, dia i torn ----------

document.querySelector("#persones").addEventListener("click", (e) => {
  const boto = e.target.closest(".opcio");
  if (!boto) return;
  persones = Number(boto.dataset.valor);
  marcar(e.currentTarget, boto);
});

document.querySelector("#torns").addEventListener("click", (e) => {
  const boto = e.target.closest(".opcio");
  if (!boto) return;
  torn = boto.dataset.valor;
  marcar(e.currentTarget, boto);
});

// Botons dels pròxims 7 dies
function pintarDies() {
  const contenidor = document.querySelector("#dies");
  contenidor.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const dia = new Date();
    dia.setDate(dia.getDate() + i);

    const boto = document.createElement("button");
    boto.type = "button";
    boto.className = "opcio dia";
    if (i === 0) boto.classList.add("triat");
    const nom = i === 0 ? "Avui" : nomsDies[dia.getDay()];
    boto.innerHTML = "<small>" + nom + "</small><b>" + dia.getDate() + "</b><small>" + nomsMesos[dia.getMonth()] + "</small>";

    boto.addEventListener("click", () => {
      data = dia;
      marcar(contenidor, boto);
    });
    contenidor.appendChild(boto);
  }
}


// ---------- PAS 2: hora i taula ----------

function pintarHores() {
  const select = document.querySelector("#hora");
  select.innerHTML = '<option value="">Tria una hora</option>';

  // Si la reserva és per avui, no ensenyem les hores que ja han passat.
  // Les hores són text "HH:MM", i es poden comparar directament ("13:30" < "14:00").
  const ara = new Date();
  const esAvui = dataText(data) === dataText(ara);
  const horaAra = String(ara.getHours()).padStart(2, "0") + ":" + String(ara.getMinutes()).padStart(2, "0");

  let quantes = 0;
  for (const h of hores[torn]) {
    if (esAvui && h <= horaAra) continue;
    select.innerHTML += "<option>" + h + "</option>";
    quantes++;
  }
  if (quantes === 0) {
    select.innerHTML = '<option value="">Avui ja no queden hores: tria un altre dia</option>';
  }
}

document.querySelector("#hora").addEventListener("change", (e) => {
  hora = e.target.value;
  document.querySelector("#resum2").textContent = resum();
});

function pintarMapa() {
  const mapa = document.querySelector("#mapa");
  const ocupades = taulesOcupades();

  // Esborrem les taules d'abans (però no l'entrada ni la barra)
  for (const t of mapa.querySelectorAll(".taula")) t.remove();

  for (const t of taules) {
    const gent = ocupades[t.num] || 0;   // persones assegudes (0 = lliure)

    // Estat de la taula
    let estat = "lliure";
    if (gent > 0) estat = "ocupada";
    else if (t.places < persones) estat = "petita";
    if (t.num === taulaTriada) estat = "triada";

    // Cadires: la meitat a dalt i la meitat a baix. Les ocupades surten plenes.
    let cadires = "";
    const meitat = t.places / 2;
    for (let i = 0; i < t.places; i++) {
      const costat = i < meitat ? "dalt" : "baix";
      const posicio = ((i % meitat) + 0.5) / meitat * 100;
      const plena = i < gent ? " plena" : "";
      cadires += '<i class="cadira ' + costat + plena + '" style="left:' + posicio + '%"></i>';
    }

    const text = gent > 0 ? gent + "/" + t.places : t.places + " places";

    const boto = document.createElement("button");
    boto.type = "button";
    boto.className = "taula " + estat;
    boto.style.left = t.x + "%";
    boto.style.top = t.y + "%";
    boto.style.width = t.amplada + "%";
    boto.style.height = t.alcada + "%";
    boto.innerHTML = cadires + '<span class="tauler"><b>T' + t.num + "</b><span>" + text + "</span></span>";

    // Només es poden triar les taules lliures
    if (estat === "lliure" || estat === "triada") {
      boto.addEventListener("click", () => {
        taulaTriada = t.num;
        document.querySelector("#error2").textContent = "";
        document.querySelector("#resum2").textContent = resum();
        pintarMapa();
      });
    } else {
      boto.disabled = true;
    }

    mapa.appendChild(boto);
  }
}


// ---------- CANVIAR DE PAS ----------

function mostrarPas(numero) {
  document.querySelector("#pas1").hidden = numero !== 1;
  document.querySelector("#pas2").hidden = numero !== 2;
  document.querySelector("#pas3").hidden = numero !== 3;
  document.querySelector("#fet").hidden = numero !== 4;

  for (let i = 1; i <= 3; i++) {
    document.querySelector("#marca" + i).classList.toggle("actiu", i === numero);
  }
  window.scrollTo(0, 0);
}

document.querySelector("#anar-pas2").addEventListener("click", () => {
  hora = "";
  taulaTriada = 0;
  pintarHores();
  pintarMapa();
  document.querySelector("#resum2").textContent = resum();
  document.querySelector("#error2").textContent = "";
  mostrarPas(2);
});

document.querySelector("#anar-pas3").addEventListener("click", () => {
  const error = document.querySelector("#error2");
  if (hora === "") {
    error.textContent = "Tria una hora per continuar.";
  } else if (taulaTriada === 0) {
    error.textContent = "Tria una taula verda del mapa per continuar.";
  } else {
    document.querySelector("#resum3").textContent = resum();
    mostrarPas(3);
  }
});

document.querySelector("#tornar-pas1").addEventListener("click", () => mostrarPas(1));
document.querySelector("#tornar-pas2").addEventListener("click", () => mostrarPas(2));


// ---------- PAS 3: confirmar ----------

// El navegador comprova els camps obligatoris (required) abans d'arribar aquí
document.querySelector("#pas3").addEventListener("submit", (e) => {
  e.preventDefault();

  // Guardem només el que cal per pintar el mapa (sense nom, telèfon ni correu: RGPD)
  const reserves = llegirReserves();
  reserves.push({ data: dataText(data), torn: torn, hora: hora, taula: taulaTriada, persones: persones });
  localStorage.setItem("reserves", JSON.stringify(reserves));

  const nom = document.querySelector("#nom").value;
  document.querySelector("#resum-fet").textContent =
    nom + ", t'esperem el " + dataBonica(data) + " a les " + hora + ". Taula " + taulaTriada + " per a " + textPersones() + ".";

  e.target.reset();
  mostrarPas(4);
});

document.querySelector("#nova").addEventListener("click", () => mostrarPas(1));


// ---------- INICI ----------
pintarDies();
