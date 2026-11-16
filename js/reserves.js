// Reserves de Can Kyoto.
// shortcut: no hi ha servidor; l'ocupació es simula i les reserves es guarden al navegador (localStorage).
// Quan tinguem el servidor amb Home Assistant, ocupades() ha de llegir dels sensors per WebSocket
// quantes persones hi ha a cada taula (el mapa ja ho pinta).

const TAULES = [
  // id, places, posició al mapa en % (left, top, width, height). Mateixa distribució que el plànol.
  [1, 4, 20.5, 14, 8, 17], [2, 4, 34, 14, 8, 17], [3, 4, 47.5, 14, 8, 17],
  [4, 4, 61, 14, 8, 17], [5, 4, 74.5, 14, 8, 17], [6, 4, 88, 14, 8, 17],
  [7, 6, 21.5, 52, 12, 17], [8, 6, 41.5, 52, 12, 17], [9, 6, 61.5, 52, 12, 17],
  [10, 4, 84, 48, 8, 17],
];
const TORNS = {
  dinar: { nom: "Dinar", franja: "13:00 – 16:45", hores: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"] },
  sopar: { nom: "Sopar", franja: "17:00 – 22:30", hores: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"] },
};
const DIES = ["dg.", "dl.", "dt.", "dc.", "dj.", "dv.", "ds."];
const DIES_LLARGS = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];
const MESOS = ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."];
const CLAU = "ck_reserves";
const MAX_PERSONES = 6;

const estat = { persones: 2, data: avui(), torn: "sopar", hora: "", taula: 0 };
const $ = (s) => document.querySelector(s);

function avui() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
// Data local (no UTC): a Barcelona, toISOString() donaria el dia anterior a mitjanit.
function clauData(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function textData(d) { return `${DIES[d.getDay()]} ${d.getDate()} ${MESOS[d.getMonth()]}`; }

// Només guardem el que cal per pintar el mapa: res de nom, telèfon ni correu (RGPD, minimització de dades).
function llegir() {
  try { return JSON.parse(localStorage.getItem(CLAU)) || []; } catch { return []; }
}
function guardar(llista) {
  try { localStorage.setItem(CLAU, JSON.stringify(llista)); } catch { /* navegador sense storage: la reserva només es mostra */ }
}

// Simulació estable: la mateixa data i torn donen sempre les mateixes taules ocupades.
function hash(text) {
  let h = 0;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 2654435761);
  // barreja final (murmur3): taules seguides no donen valors seguits, ni als bits baixos que fa servir el %
  h ^= h >>> 16; h = Math.imul(h, 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16;
  return h >>> 0;
}
// Retorna Map(taula -> persones assegudes). Les taules lliures no hi són.
function ocupades() {
  const k = `${clauData(estat.data)}|${estat.torn}`;
  const oc = new Map();
  for (const [id, places] of TAULES)
    if (hash(`${k}|${id}`) % 100 < 35) oc.set(id, 1 + (hash(`${k}|${id}|p`) % places));
  for (const r of llegir()) if (r.data === clauData(estat.data) && r.torn === estat.torn) oc.set(r.taula, r.persones);
  return oc;
}

// Opció en forma de rajola: un radio real (accessible i amb teclat) dins d'un label.
function rajola(nom, valor, html, triat, extra = "", etiqueta = "") {
  const label = document.createElement("label");
  label.className = `opcio ${extra}`;
  label.innerHTML = `<input type="radio" class="visually-hidden" name="${nom}" value="${valor}" ${triat ? "checked" : ""}
    ${etiqueta ? `aria-label="${etiqueta}"` : ""}>${html}`;
  return label;
}

// ---------- Pas 1
function pintarDies() {
  const d = $("#dies");
  const dies = [];
  for (let i = 0; i < 6; i++) { const dia = avui(); dia.setDate(dia.getDate() + i); dies.push(dia); }
  if (!dies.some((dia) => +dia === +estat.data)) dies.push(estat.data); // data triada al calendari
  d.replaceChildren(...dies.map((dia) => {
    const nom = +dia === +avui() ? "Avui" : DIES[dia.getDay()];
    return rajola("data", clauData(dia), `<small aria-hidden="true">${nom}</small><b aria-hidden="true">${dia.getDate()}</b><small aria-hidden="true">${MESOS[dia.getMonth()]}</small>`,
      +dia === +estat.data, "dia", `${nom === "Avui" ? "Avui, " : ""}${DIES_LLARGS[dia.getDay()]} ${dia.getDate()} ${MESOS[dia.getMonth()]}`);
  }));
  const altra = document.createElement("label");
  altra.className = "opcio dia mes-dies";
  altra.innerHTML = `<small>Altra</small><b>data</b><input type="date" name="altra-data" min="${clauData(avui())}" aria-label="Tria una altra data">`;
  d.append(altra);
}
function pintarPas1() {
  const valors = [1, 2, 3, 4, 5, 6, "mes"];
  $("#persones").replaceChildren(...valors.map((n) =>
    rajola("persones", n, n === "mes" ? "+6" : n, estat.persones === n || (n === "mes" && estat.persones > MAX_PERSONES), "",
      n === "mes" ? "Més de 6 persones" : "")));
  pintarDies();
  $("#torns").replaceChildren(...Object.entries(TORNS).map(([clau, torn]) =>
    rajola("torn", clau, `<b>${torn.nom}</b>${torn.franja}`, estat.torn === clau, "torn")));
  $("#avis-grup").hidden = estat.persones <= MAX_PERSONES;
}

$("#pas1").addEventListener("change", (e) => {
  const { name, value } = e.target;
  if (name === "persones") {
    estat.persones = value === "mes" ? MAX_PERSONES + 1 : +value;
    $("#avis-grup").hidden = estat.persones <= MAX_PERSONES;
  }
  if (name === "data") estat.data = new Date(value + "T00:00");
  if (name === "torn") estat.torn = value;
  if (name === "altra-data" && value) {
    estat.data = new Date(value + "T00:00");
    pintarDies();
    $(`#dies input[value="${value}"]`).focus();
  }
});

// ---------- Pas 2
function horaPassada(h) {
  if (+estat.data !== +avui()) return false;
  const [hh, mm] = h.split(":").map(Number);
  const ara = new Date();
  return hh * 60 + mm <= ara.getHours() * 60 + ara.getMinutes();
}
function resum() {
  return `${estat.persones} ${estat.persones === 1 ? "persona" : "persones"}, ${textData(estat.data)}, ` +
    TORNS[estat.torn].nom.toLowerCase() + (estat.hora ? ` a les ${estat.hora}` : "") +
    (estat.taula ? `, taula ${estat.taula}` : "");
}
function pintarSeleccio() {
  $("#resum2").textContent = resum();
  const triada = TAULES.find(([id]) => id === estat.taula);
  $("#seleccio").textContent = triada ? `Has triat la taula ${triada[0]}, de ${triada[1]} places.` : "";
}
function pintarPas2() {
  const sel = $("#hora");
  sel.replaceChildren(new Option("Tria una hora", ""), ...TORNS[estat.torn].hores.map((h) => {
    const o = new Option(h, h, false, estat.hora === h);
    o.disabled = horaPassada(h);
    return o;
  }));

  const oc = ocupades();
  if (oc.has(estat.taula)) estat.taula = 0;
  const taules = TAULES.map(([id, places, l, t, w, hh]) => {
    const gent = oc.get(id) || 0;
    const petita = places < estat.persones;
    const estatTaula = gent ? "ocupada" : petita ? "petita" : "lliure";
    const descripcio = gent ? `ocupada per ${gent} de ${places} persones` : petita ? `massa petita, ${places} places` : `lliure, ${places} places`;
    // Cadires: la meitat a dalt i la meitat a baix; les primeres "gent" surten plenes.
    const mig = places / 2;
    let cadires = "";
    for (let i = 0; i < places; i++) {
      const x = (((i % mig) + 0.5) / mig) * 100;
      cadires += `<i class="cadira ${i < mig ? "dalt" : "baix"}${i < gent ? " plena" : ""}" style="left:${x}%"></i>`;
    }
    const label = document.createElement("label");
    label.className = `taula ${estatTaula}`;
    label.style.cssText = `left:${l}%;top:${t}%;width:${w}%;height:${hh}%`;
    label.title = `Taula ${id}, ${descripcio}`;
    label.innerHTML = `<input type="radio" class="visually-hidden" name="taula" value="${id}" required
        ${gent || petita ? "disabled" : ""} ${estat.taula === id ? "checked" : ""} data-error="error-taula">
      <span class="visually-hidden">Taula ${id}, ${descripcio}</span>
      <span aria-hidden="true">${cadires}<span class="tauler"><b>T${id}</b>
        <span class="gent">${gent ? `${gent}/${places}` : `${places} places`}</span></span></span>`;
    return label;
  });
  $("#mapa").querySelectorAll(".taula").forEach((e) => e.remove());
  $("#mapa").append(...taules);
  pintarSeleccio();
}

$("#pas2").addEventListener("change", (e) => {
  if (e.target.name === "hora") estat.hora = e.target.value;
  if (e.target.name === "taula") estat.taula = +e.target.value;
  pintarSeleccio();
});

// ---------- Errors accessibles: aria-invalid i aria-describedby segueixen :user-invalid
// (la guia de Modern Web Guidance "accessible-error-announcement").
function enllacarError(el, mostrat) {
  const id = el.dataset.error;
  if (!id) return;
  const ids = (el.getAttribute("aria-describedby") || "").split(/\s+/).filter((x) => x && x !== id);
  if (mostrat) ids.push(id);
  if (ids.length) el.setAttribute("aria-describedby", ids.join(" "));
  else el.removeAttribute("aria-describedby");
}
function sincronitzarAria(el) {
  if (!el.matches?.("input, select, textarea")) return;
  const invalid = el.matches(":user-invalid");
  el.setAttribute("aria-invalid", invalid);
  enllacarError(el, invalid);
}
document.querySelectorAll("input, select, textarea").forEach((el) => el.setAttribute("aria-invalid", "false"));
for (const tipus of ["blur", "change", "input", "invalid"])
  document.addEventListener(tipus, (e) => sincronitzarAria(e.target), true);

// ---------- Navegació entre passos
function mostrar(id, enfocar = true) {
  for (const p of document.querySelectorAll(".pas")) p.hidden = p.id !== id;
  for (const li of document.querySelectorAll(".progres li")) {
    if (li.dataset.pas === id) li.setAttribute("aria-current", "step");
    else li.removeAttribute("aria-current");
  }
  $(".progres").hidden = id === "fet";
  if (id === "pas1") pintarPas1();
  if (id === "pas2") pintarPas2();
  if (id === "pas3") $("#resum3").textContent = resum();
  // El focus va al títol del pas nou perquè el lector de pantalla l'anunciï (i la pàgina s'hi desplaça).
  if (enfocar) $(`#${id} h2`).focus();
}
document.querySelectorAll("[data-anar]").forEach((b) => b.addEventListener("click", () => mostrar(b.dataset.anar)));

$("#pas1").addEventListener("submit", (e) => {
  e.preventDefault();
  if (estat.persones > MAX_PERSONES) {
    $("#avis-grup").hidden = false;
    $("#persones input[value='mes']").focus();
    return;
  }
  estat.hora = ""; estat.taula = 0;
  mostrar("pas2");
});
$("#pas2").addEventListener("submit", (e) => {
  e.preventDefault(); // la validació nativa (required) ja ha bloquejat l'enviament si falta hora o taula
  mostrar("pas3");
});
$("#pas3").addEventListener("submit", (e) => {
  e.preventDefault();
  const boto = e.target.querySelector("[type=submit]");
  boto.disabled = true; // evita reserves duplicades per doble clic
  const nom = new FormData(e.target).get("nom").trim();
  guardar([...llegir(), { data: clauData(estat.data), torn: estat.torn, hora: estat.hora, taula: estat.taula, persones: estat.persones }]);
  $("#resumFet").textContent = `${nom}, t'esperem el ${textData(estat.data)} a les ${estat.hora}. ` +
    `Taula ${estat.taula} per a ${estat.persones} persones.`;
  e.target.reset();
  boto.disabled = false;
  mostrar("fet");
});
$("#nova").addEventListener("click", () => { estat.hora = ""; estat.taula = 0; mostrar("pas1"); });

mostrar("pas1", false);
