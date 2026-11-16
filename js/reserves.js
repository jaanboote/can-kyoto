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
const MESOS = ["gen.", "febr.", "març", "abr.", "maig", "juny", "jul.", "ag.", "set.", "oct.", "nov.", "des."];
const CLAU = "ck_reserves";

const estat = { persones: 2, data: avui(), torn: "sopar", hora: null, taula: null };
const $ = (s) => document.querySelector(s);

function avui() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
// Data local (no UTC): a Barcelona, toISOString() donaria el dia anterior a mitjanit.
function clauData(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function textData(d) { return `${DIES[d.getDay()]} ${d.getDate()} ${MESOS[d.getMonth()]}`; }

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
const canvisEnDirecte = new Map(); // taula -> persones (0 = lliure), canvis dels "sensors" mentre mires el mapa
// Retorna Map(taula -> persones assegudes). Les taules lliures no hi són.
function ocupades() {
  const k = `${clauData(estat.data)}|${estat.torn}`;
  const oc = new Map();
  for (const [id, places] of TAULES)
    if (hash(`${k}|${id}`) % 100 < 35) oc.set(id, 1 + (hash(`${k}|${id}|p`) % places));
  for (const r of llegir()) if (r.data === clauData(estat.data) && r.torn === estat.torn) oc.set(r.taula, r.persones);
  for (const [id, n] of canvisEnDirecte) n ? oc.set(id, n) : oc.delete(id);
  return oc;
}

function boto(html, actiu, onclick, extra = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "opcio " + extra;
  b.innerHTML = html;
  b.setAttribute("aria-pressed", actiu);
  b.onclick = onclick;
  return b;
}

// ---------- Pas 1
function pintarPas1() {
  const p = $("#persones"); p.innerHTML = "";
  for (let n = 1; n <= 6; n++) p.append(boto(n, estat.persones === n, () => { estat.persones = n; pintarPas1(); }));
  const sel = document.createElement("select");
  sel.className = "opcio";
  sel.setAttribute("aria-label", "Més de 6 persones");
  sel.innerHTML = `<option value="">...</option>` + [7, 8, 9, 10, 11, 12].map((n) => `<option ${estat.persones === n ? "selected" : ""}>${n}</option>`).join("");
  if (estat.persones > 6) sel.style.cssText = "background:#0B0B0B;color:#fff";
  sel.onchange = () => { if (sel.value) { estat.persones = +sel.value; pintarPas1(); } };
  p.append(sel);

  const d = $("#dies"); d.innerHTML = "";
  for (let i = 0; i < 6; i++) {
    const dia = avui(); dia.setDate(dia.getDate() + i);
    const nom = i === 0 ? "Avui" : DIES[dia.getDay()];
    d.append(boto(`<small>${nom}</small><b>${dia.getDate()}</b><small>${MESOS[dia.getMonth()]}</small>`,
      +dia === +estat.data, () => { estat.data = dia; pintarPas1(); }, "dia"));
  }
  const mes = boto("<b>...</b>", (estat.data - avui()) / 864e5 >= 6, () => {}, "dia mes-dies");
  const input = document.createElement("input");
  input.type = "date";
  input.min = clauData(avui());
  input.setAttribute("aria-label", "Una altra data");
  input.onchange = () => { if (input.value) { estat.data = new Date(input.value + "T00:00"); pintarPas1(); } };
  mes.append(input);
  d.append(mes);

  const t = $("#torns"); t.innerHTML = "";
  for (const [clau, torn] of Object.entries(TORNS))
    t.append(boto(`<b>${torn.nom}</b>${torn.franja}`, estat.torn === clau, () => { estat.torn = clau; pintarPas1(); }, "torn"));
}

// ---------- Pas 2
function horaPassada(h) {
  if (+estat.data !== +avui()) return false;
  const [hh, mm] = h.split(":").map(Number);
  const ara = new Date();
  return hh * 60 + mm <= ara.getHours() * 60 + ara.getMinutes();
}
function resum() {
  return `${estat.persones} persones · ${textData(estat.data)} · ${TORNS[estat.torn].nom}` +
    (estat.hora ? ` a les ${estat.hora}` : "") + (estat.taula ? ` · Taula ${estat.taula}` : "");
}
function pintarPas2() {
  $("#resum2").textContent = resum();
  const h = $("#hores"); h.innerHTML = "";
  for (const hora of TORNS[estat.torn].hores) {
    const b = boto(hora, estat.hora === hora, () => { estat.hora = hora; pintarPas2(); });
    b.disabled = horaPassada(hora);
    h.append(b);
  }
  const oc = ocupades();
  if (oc.has(estat.taula)) estat.taula = null;
  const mapa = $("#mapa");
  mapa.querySelectorAll(".taula").forEach((e) => e.remove());
  for (const [id, places, l, t, w, hh] of TAULES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "taula";
    b.style.cssText = `left:${l}%;top:${t}%;width:${w}%;height:${hh}%`;
    const petita = places < estat.persones;
    const gent = oc.get(id) || 0;
    if (gent) b.classList.add("ocupada");
    else if (petita) b.classList.add("petita");
    b.disabled = gent > 0 || petita;
    b.setAttribute("aria-pressed", estat.taula === id);
    b.setAttribute("aria-label", `Taula ${id}, ${places} places, ` +
      (gent ? `ocupada per ${gent} persones` : petita ? "massa petita" : "lliure"));
    // Cadires: la meitat a dalt i la meitat a baix; les primeres "gent" surten plenes.
    const mig = places / 2;
    let cadires = "";
    for (let i = 0; i < places; i++) {
      const costat = i < mig ? "dalt" : "baix";
      const x = (((i % mig) + 0.5) / mig) * 100;
      cadires += `<i class="cadira ${costat}${i < gent ? " plena" : ""}" style="left:${x}%"></i>`;
    }
    const estatText = gent ? `<span class="gent">${gent}/${places}</span>` : `<span class="gent">${places} places</span>`;
    b.innerHTML = `${cadires}<span class="tauler"><b>T${id}</b>${estatText}</span>`;
    b.onclick = () => { estat.taula = id; pintarPas2(); };
    mapa.append(b);
  }
}

// Fa de sensor: cada pocs segons una taula canvia d'estat, com quan un client s'asseu o marxa.
setInterval(() => {
  if ($("#pas2").hidden) return;
  const altres = TAULES.filter(([id]) => id !== estat.taula);
  const [id, places] = altres[Math.floor(Math.random() * altres.length)];
  canvisEnDirecte.set(id, ocupades().has(id) ? 0 : 1 + Math.floor(Math.random() * places));
  pintarPas2();
}, 6000);

// ---------- Navegació entre passos
function mostrar(id) {
  for (const p of document.querySelectorAll(".pas")) p.hidden = p.id !== id;
  if (id === "pas1") pintarPas1();
  if (id === "pas2") pintarPas2();
  if (id === "pas3") $("#resum3").textContent = resum();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll("[data-anar]").forEach((b) => (b.onclick = () => mostrar(b.dataset.anar)));

$("#pas1").onsubmit = (e) => {
  e.preventDefault();
  if (estat.persones > 6) {
    alert("Per a grups de més de 6 persones, truca'ns i et preparem una taula.");
    return;
  }
  estat.hora = null; estat.taula = null; canvisEnDirecte.clear();
  mostrar("pas2");
};
$("#pas2").onsubmit = (e) => {
  e.preventDefault();
  if (!estat.hora) return alert("Tria una hora.");
  if (!estat.taula) return alert("Tria una taula lliure al mapa.");
  mostrar("pas3");
};
$("#pas3").onsubmit = (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const reserva = {
    data: clauData(estat.data), torn: estat.torn, hora: estat.hora, taula: estat.taula,
    persones: estat.persones, nom: f.get("nom").trim(), telefon: f.get("telefon").trim(),
    correu: f.get("correu").trim(), comentaris: f.get("comentaris").trim(),
  };
  guardar([...llegir(), reserva]);
  $("#resumFet").textContent = `${reserva.nom}, t'esperem el ${textData(estat.data)} a les ${reserva.hora}. ` +
    `Taula ${reserva.taula} per a ${reserva.persones} persones.`;
  e.target.reset();
  mostrar("fet");
};
$("#nova").onclick = () => { estat.hora = null; estat.taula = null; mostrar("pas1"); };

pintarPas1();
