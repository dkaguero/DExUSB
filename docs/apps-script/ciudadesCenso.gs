/**
 * Ciudades del Censo de Egresados CESEG USB.
 *
 * Va instalado en la HOJA DE RESPUESTAS del formulario (Extensiones > Apps Script).
 * Cada vez que llega una respuesta, rehace la hoja PÚBLICA «Ciudades CESEG» con
 * una fila por ciudad: pais, ciudad, lat, lng, egresados.
 *
 * Privacidad:
 *  - Solo lee las dos preguntas de país y ciudad. No copia nombres, correos,
 *    empresas ni ningún otro dato.
 *  - La hoja pública es OTRO archivo. Las respuestas nunca se publican.
 *
 * Instrucciones completas: docs/globo-egresados.md
 */

// ID del archivo PÚBLICO «Ciudades CESEG» (lo que va entre /d/ y /edit en su dirección).
const ID_HOJA_PUBLICA = "12z13lgy7Z_Em34rRlHqD8ckCrf-NTZo6zGDwk7JwMZM";

// Textos de las preguntas del formulario. Se comparan sin acentos ni mayúsculas.
const PREGUNTA_PAIS = "Indique en que país reside actualmente";
const PREGUNTA_CIUDAD = "Indique en que ciudad reside actualmente";

// Hojas que el script crea dentro del archivo de respuestas (privado).
const HOJA_CACHE = "Ciudades (cache)";
const PESTANA_PUBLICA = "Ciudades";
const CABECERA_CACHE = ["clave", "pais_escrito", "ciudad_escrita", "pais", "ciudad", "lat", "lng", "estado"];

/** Se ejecuta una vez a mano: crea el disparador y carga las respuestas anteriores. */
function instalar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.getProjectTriggers()
    .filter((t) => ["alRecibirRespuesta", "actualizarCiudades"].indexOf(t.getHandlerFunction()) !== -1)
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("alRecibirRespuesta").forSpreadsheet(libro).onFormSubmit().create();
  // Cada hora: recoge los egresados USB que llegan por la Feria de Empleo.
  ScriptApp.newTrigger("actualizarCiudades").timeBased().everyHours(1).create();
  actualizarCiudades();
}

/** Disparador: cada respuesta nueva rehace la hoja pública. */
function alRecibirRespuesta() {
  actualizarCiudades();
}

/** Lee todas las respuestas, ubica cada ciudad y reescribe la hoja pública. */
function actualizarCiudades() {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const respuestas = hojaDeRespuestas_(libro);
    const valores = respuestas.getDataRange().getValues();
    if (valores.length < 2) {
      escribirPublica_([]);
      return;
    }
    const cabecera = valores[0].map(normal_);
    const iPais = buscarColumna_(cabecera, PREGUNTA_PAIS);
    const iCiudad = buscarColumna_(cabecera, PREGUNTA_CIUDAD);
    if (iPais < 0 || iCiudad < 0) {
      throw new Error("No encontré las preguntas de país y ciudad en la hoja «" + respuestas.getName() + "».");
    }

    // Cuántas respuestas hay por cada combinación escrita de país y ciudad.
    const escritas = new Map();
    valores.slice(1).forEach((fila) => {
      const pais = String(fila[iPais] || "").trim();
      const ciudad = String(fila[iCiudad] || "").trim();
      if (!pais || !ciudad) return;
      const clave = normal_(ciudad) + "|" + normal_(pais);
      const previo = escritas.get(clave);
      if (previo) previo.n += 1;
      else escritas.set(clave, { pais: pais, ciudad: ciudad, n: 1 });
    });

    // Egresados USB que llenaron el Perfil de postulante de la Feria de Empleo
    // (pestaña que escribe el script de la feria). Se descarta a quien ya
    // respondió el censo, por carnet o por correo: nadie se cuenta dos veces.
    sumarPerfilesDeLaFeria_(libro, valores, escritas);

    const cache = leerCache_(libro);
    const nuevas = [];
    escritas.forEach((dato, clave) => {
      if (cache.has(clave)) return;
      const ubicada = geocodificar_(dato.ciudad, dato.pais);
      const fila = ubicada
        ? [clave, dato.pais, dato.ciudad, ubicada.pais, ubicada.ciudad, ubicada.lat, ubicada.lng, "OK"]
        : [clave, dato.pais, dato.ciudad, "", "", "", "", "REVISAR"];
      cache.set(clave, filaACache_(fila));
      nuevas.push(fila);
    });
    if (nuevas.length) {
      const hoja = hojaCache_(libro);
      hoja.getRange(hoja.getLastRow() + 1, 1, nuevas.length, CABECERA_CACHE.length).setValues(nuevas);
    }

    // Una sola fila por ciudad real: «Caracas» y «caracas, DC» se suman si el
    // geocodificador las ubica en la misma ciudad.
    const porCiudad = new Map();
    escritas.forEach((dato, clave) => {
      const c = cache.get(clave);
      if (!c || c.estado === "REVISAR" || !isFinite(c.lat) || !isFinite(c.lng)) return;
      const llave = normal_(c.ciudad) + "|" + normal_(c.pais);
      const previo = porCiudad.get(llave);
      if (previo) previo.egresados += dato.n;
      else porCiudad.set(llave, { pais: c.pais, ciudad: c.ciudad, lat: c.lat, lng: c.lng, egresados: dato.n });
    });

    const filas = Array.from(porCiudad.values())
      .sort((a, b) => b.egresados - a.egresados || a.ciudad.localeCompare(b.ciudad))
      .map((c) => [c.pais, c.ciudad, c.lat, c.lng, c.egresados]);
    escribirPublica_(filas);
  } finally {
    candado.releaseLock();
  }
}

// ---------- utilidades ----------

function normal_(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?:]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function buscarColumna_(cabecera, pregunta) {
  const buscada = normal_(pregunta);
  for (let i = 0; i < cabecera.length; i++) {
    if (cabecera[i] === buscada || cabecera[i].indexOf(buscada) === 0) return i;
  }
  return -1;
}

/** La hoja de respuestas es la que está vinculada al formulario. */
function hojaDeRespuestas_(libro) {
  const hojas = libro.getSheets();
  for (let i = 0; i < hojas.length; i++) {
    if (hojas[i].getFormUrl && hojas[i].getFormUrl()) return hojas[i];
  }
  return hojas[0];
}

function hojaCache_(libro) {
  let hoja = libro.getSheetByName(HOJA_CACHE);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_CACHE);
    hoja.getRange(1, 1, 1, CABECERA_CACHE.length).setValues([CABECERA_CACHE]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function filaACache_(fila) {
  return {
    pais: String(fila[3] || "").trim(),
    ciudad: String(fila[4] || "").trim(),
    lat: parseFloat(String(fila[5]).replace(",", ".")),
    lng: parseFloat(String(fila[6]).replace(",", ".")),
    estado: String(fila[7] || "").trim().toUpperCase()
  };
}

/**
 * La cache guarda cada combinación escrita y dónde quedó ubicada.
 * Si una fila dice REVISAR, la CESEG puede escribir a mano pais, ciudad, lat y
 * lng, cambiar el estado a OK y volver a ejecutar actualizarCiudades.
 */
function leerCache_(libro) {
  const hoja = hojaCache_(libro);
  const mapa = new Map();
  const valores = hoja.getDataRange().getValues().slice(1);
  valores.forEach((fila) => {
    const clave = String(fila[0] || "");
    if (!clave) return;
    const dato = filaACache_(fila);
    if (dato.estado !== "REVISAR" && (!dato.ciudad || !dato.pais || !isFinite(dato.lat) || !isFinite(dato.lng))) {
      dato.estado = "REVISAR";
    }
    mapa.set(clave, dato);
  });
  return mapa;
}

function geocodificar_(ciudad, pais) {
  try {
    const respuesta = Maps.newGeocoder().setLanguage("es").geocode(ciudad + ", " + pais);
    if (!respuesta || respuesta.status !== "OK" || !respuesta.results.length) return null;
    const r = respuesta.results[0];
    const comp = r.address_components || [];
    const de = (tipo) => {
      const c = comp.filter((x) => x.types.indexOf(tipo) !== -1)[0];
      return c ? c.long_name : "";
    };
    const nombrePais = de("country");
    const nombreCiudad = de("locality") || de("administrative_area_level_2") || de("administrative_area_level_1");
    if (!nombrePais || !nombreCiudad) return null;
    Utilities.sleep(200);
    return {
      pais: nombrePais,
      ciudad: nombreCiudad,
      lat: Math.round(r.geometry.location.lat * 10000) / 10000,
      lng: Math.round(r.geometry.location.lng * 10000) / 10000
    };
  } catch (e) {
    return null;
  }
}

function escribirPublica_(filas) {
  const libro = SpreadsheetApp.openById(ID_HOJA_PUBLICA);
  let hoja = libro.getSheetByName(PESTANA_PUBLICA);
  if (!hoja) hoja = libro.insertSheet(PESTANA_PUBLICA);
  hoja.clearContents();
  const todo = [["pais", "ciudad", "lat", "lng", "egresados"]].concat(filas);
  hoja.getRange(1, 1, todo.length, 5).setValues(todo);
}

const PESTANA_FERIA = "Perfiles de la feria";

function sumarPerfilesDeLaFeria_(libro, valores, escritas) {
  const hoja = libro.getSheetByName(PESTANA_FERIA);
  if (!hoja || hoja.getLastRow() < 2) return 0;
  const cab = valores[0].map(normal_);
  const iCarnet = cab.indexOf("carnet");
  const iCorreos = cab.map((c, i) => (/^indique un correo personal|direccion de correo electronico|email address/.test(c) ? i : -1)).filter((i) => i >= 0);
  const carnet = (v) => String(v || "").replace(/[^0-9a-z]/gi, "").toLowerCase();
  const correo = (v) => String(v || "").trim().toLowerCase();
  const enCenso = {};
  valores.slice(1).forEach((f) => {
    if (iCarnet >= 0 && carnet(f[iCarnet])) enCenso["c:" + carnet(f[iCarnet])] = true;
    iCorreos.forEach((i) => { if (correo(f[i])) enCenso["m:" + correo(f[i])] = true; });
  });
  let sumados = 0;
  hoja.getDataRange().getValues().slice(1).forEach((f) => {
    const [c, m, pais, ciudad] = f;
    if ((carnet(c) && enCenso["c:" + carnet(c)]) || (correo(m) && enCenso["m:" + correo(m)])) return;
    const p = String(pais || "").trim(), ci = String(ciudad || "").trim();
    if (!p || !ci) return;
    const clave = normal_(ci) + "|" + normal_(p);
    const previo = escritas.get(clave);
    if (previo) previo.n += 1;
    else escritas.set(clave, { pais: p, ciudad: ci, n: 1 });
    sumados++;
  });
  return sumados;
}

