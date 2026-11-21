/**
 * Datos CESEG: propuestas, verificación y publicación.
 *
 * Va instalado en el archivo PRIVADO «Datos CESEG – edición»
 * (Extensiones › Apps Script). Instrucciones: docs/datos-ceseg.md
 *
 * Qué hace:
 *  1. instalar(): prepara las pestañas Orgullo, Empresas y Vacantes, crea los
 *     tres formularios (proponer un egresado destacado, registrar una empresa,
 *     publicar una vacante) con este archivo como destino, y el disparador.
 *  2. Cada respuesta de un formulario entra como fila nueva en su pestaña,
 *     con estado «Borrador». Nada se publica solo.
 *  3. La coordinación de la CESEG verifica cada fila y cambia el estado a
 *     «Aprobado» o «Rechazado».
 *  4. Menú «CESEG › Publicar cambios»: copia solo las filas «Aprobado», y solo
 *     sus columnas públicas, a las pestañas Orgullo y Empresas del archivo
 *     PÚBLICO «Ciudades CESEG». De ahí las leen las páginas y Google Sites.
 *
 * Privacidad: los datos de quien propone o del contacto de la empresa, las
 * notas y quién verificó NUNCA se copian al archivo público.
 */

// ID del archivo PÚBLICO «Ciudades CESEG» (el mismo que usa el script del censo).
const ID_HOJA_PUBLICA = "12z13lgy7Z_Em34rRlHqD8ckCrf-NTZo6zGDwk7JwMZM";

const ESTADOS = ["Borrador", "Aprobado", "Rechazado"];
const CATEGORIAS = [
  "Aeroespacial & Ciencia",
  "Inteligencia Artificial",
  "Tech & Software",
  "Corporativo & Energía",
  "Deporte de alto rendimiento",
  "Academia"
];
// Rubros que ya usan las empresas publicadas. El formulario permite «Otro».
const RUBROS = [
  "Agricultura urbana",
  "Autos usados",
  "Consultoría empresarial",
  "Fabricación aditiva",
  "Inteligencia artificial",
  "Microrredes y energía",
  "Propulsión espacial",
  "Protección contra rayos",
  "Telecomunicaciones espaciales"
];

// Pestañas del archivo de edición. «publicas» son las columnas que se copian
// al archivo público; las demás son de control y nunca salen de aquí.
const PESTANAS = {
  Orgullo: {
    columnas: ["estado", "nombre", "carrera", "cohorte", "cargo", "ubicacion", "logro", "categoria",
      "destacado", "foto", "fuente", "fuente_texto", "verificado_por", "notas",
      "fecha_propuesta", "propuesto_por", "correo_proponente", "relacion"],
    publicas: ["nombre", "carrera", "cohorte", "cargo", "ubicacion", "logro", "categoria",
      "destacado", "foto", "fuente", "fuente_texto"],
    // La carrera no es obligatoria: algunas fuentes no la dicen, y la ficha
    // no completa lo que la fuente no dice.
    obligatorias: ["nombre", "logro", "categoria", "fuente"]
  },
  Empresas: {
    columnas: ["estado", "empresa", "fundador", "carrera", "ciudad", "pais", "lat", "lng", "rubro",
      "descripcion", "fuente", "fuente_texto", "verificacion", "verificado_por", "notas",
      "fecha_propuesta", "contacto_nombre", "contacto_correo"],
    publicas: ["empresa", "fundador", "carrera", "ciudad", "pais", "lat", "lng", "rubro",
      "descripcion", "fuente", "fuente_texto", "verificacion"],
    obligatorias: ["empresa", "fundador", "carrera", "ciudad", "pais"]
  },
  Vacantes: {
    columnas: ["estado", "empresa_o_egresado", "correo", "area", "pais", "modalidad", "descripcion",
      "enlace", "fecha_propuesta", "verificado_por", "notas"],
    publicas: [],
    obligatorias: []
  }
};

// Formularios. «columna» indica dónde cae cada respuesta en la pestaña.
const FORMULARIOS = {
  orgullo: {
    pestana: "Orgullo",
    titulo: "Proponer un egresado destacado – Orgullo USBista",
    descripcion:
      "Propón a un egresado o egresada de la Universidad Simón Bolívar con logros importantes a nivel " +
      "nacional o internacional. La Coordinación de la CESEG verifica cada propuesta con fuentes públicas " +
      "antes de publicarla en Orgullo USBista, y puede no publicarla. Tu nombre y tu correo no se publican.",
    preguntas: [
      { titulo: "Nombre completo de la persona que propones", columna: "nombre", tipo: "texto", requerida: true },
      { titulo: "Carrera que estudió en la USB", columna: "carrera", tipo: "texto", requerida: true },
      { titulo: "Año de egreso", columna: "cohorte", tipo: "texto", ayuda: "Si lo sabes. Por ejemplo: 2001." },
      { titulo: "Cargo o actividad actual", columna: "cargo", tipo: "texto" },
      { titulo: "País y ciudad donde vive", columna: "ubicacion", tipo: "texto" },
      { titulo: "Logro nacional o internacional", columna: "logro", tipo: "parrafo", requerida: true,
        ayuda: "Qué logró, dónde y cuándo. Escribe solo lo que confirma la fuente." },
      { titulo: "Área del logro", columna: "categoria", tipo: "opcion", requerida: true, opciones: CATEGORIAS, otra: true },
      { titulo: "Enlace a una fuente pública", columna: "fuente", tipo: "url", requerida: true,
        ayuda: "Una noticia o página oficial que diga que la persona egresó de la USB y que describa el logro." },
      { titulo: "Nombre del medio o institución de la fuente", columna: "fuente_texto", tipo: "texto" },
      { titulo: "Enlace a una foto pública de la persona", columna: "foto", tipo: "url", ayuda: "Opcional." },
      { seccion: "Tus datos (no se publican)" },
      { titulo: "Tu nombre", columna: "propuesto_por", tipo: "texto", requerida: true },
      { titulo: "Tu correo electrónico", columna: "correo_proponente", tipo: "correo", requerida: true },
      { titulo: "Tu relación con la persona propuesta", columna: "relacion", tipo: "opcion",
        opciones: ["Soy yo", "Familiar", "Colega", "Profesor o profesora", "Compañero o compañera de estudios"], otra: true },
      { titulo: "Confirmación", tipo: "casilla", requerida: true,
        opciones: ["Entiendo que la CESEG verifica la propuesta con fuentes públicas y puede no publicarla."] }
    ]
  },
  empresas: {
    pestana: "Empresas",
    titulo: "Registrar una empresa de egresados USB – USBistas por el mundo",
    descripcion:
      "Registra una empresa fundada o cofundada por egresados de la Universidad Simón Bolívar. La " +
      "Coordinación de la CESEG verifica los datos antes de publicar la empresa en el mapa USBistas por el " +
      "mundo, y puede no publicarla. Los datos de contacto no se publican.",
    preguntas: [
      { titulo: "Nombre de la empresa", columna: "empresa", tipo: "texto", requerida: true },
      { titulo: "Quién la fundó o cofundó", columna: "fundador", tipo: "texto", requerida: true,
        ayuda: "Nombre y apellido de cada egresado o egresada de la USB que la fundó. Si son varias personas, sepáralas con coma." },
      { titulo: "Carrera que estudió en la USB", columna: "carrera", tipo: "texto", requerida: true,
        ayuda: "Si son varias personas, en el mismo orden." },
      { titulo: "Ciudad de la sede principal", columna: "ciudad", tipo: "texto", requerida: true },
      { titulo: "País de la sede principal", columna: "pais", tipo: "texto", requerida: true },
      { titulo: "Rubro o sector", columna: "rubro", tipo: "opcion", requerida: true, opciones: RUBROS, otra: true },
      { titulo: "Descripción breve de la empresa", columna: "descripcion", tipo: "parrafo", requerida: true,
        maximo: 300, ayuda: "Hasta 300 caracteres." },
      { titulo: "Sitio web o enlace público de la empresa", columna: "fuente", tipo: "url" },
      { seccion: "Contacto (no se publica)" },
      { titulo: "Nombre de la persona de contacto", columna: "contacto_nombre", tipo: "texto", requerida: true },
      { titulo: "Correo de contacto", columna: "contacto_correo", tipo: "correo", requerida: true },
      { titulo: "Autorización", tipo: "casilla", requerida: true,
        opciones: ["Confirmo que los datos son correctos y autorizo a la CESEG a publicar el nombre de la empresa, " +
          "quién la fundó, su carrera, la ciudad, el país, el rubro, la descripción y el sitio web."] }
    ]
  },
  vacantes: {
    pestana: "Vacantes",
    titulo: "Publicar una vacante – Bolsa de Trabajo CESEG",
    descripcion:
      "Empresas y egresados pueden enviar una vacante a la Bolsa de Trabajo de la CESEG. La CESEG la revisa " +
      "antes de publicarla.",
    preguntas: [
      { titulo: "Empresa o egresado que publica", columna: "empresa_o_egresado", tipo: "texto", requerida: true },
      { titulo: "Correo de contacto", columna: "correo", tipo: "correo", requerida: true },
      { titulo: "Área profesional", columna: "area", tipo: "texto", requerida: true },
      { titulo: "País", columna: "pais", tipo: "texto" },
      { titulo: "Modalidad", columna: "modalidad", tipo: "opcion", requerida: true, opciones: ["Remota", "Presencial", "Híbrida"] },
      { titulo: "Descripción de la vacante", columna: "descripcion", tipo: "parrafo", requerida: true },
      { titulo: "Enlace para postularse", columna: "enlace", tipo: "url", ayuda: "Opcional." }
    ]
  }
};

// ---------------- menú ----------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("CESEG")
    .addItem("Publicar cambios", "publicar")
    .addItem("Ver enlaces de los formularios", "verEnlaces")
    .addToUi();
}

// ---------------- instalación ----------------

/** Se ejecuta una vez. Se puede repetir: no duplica formularios ni pestañas. */
function instalar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(PESTANAS).forEach((nombre) => prepararPestana_(libro, nombre));

  const props = PropertiesService.getScriptProperties();
  Object.keys(FORMULARIOS).forEach((clave) => {
    if (props.getProperty("form_" + clave)) return;
    const definicion = FORMULARIOS[clave];
    const form = crearFormulario_(definicion);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, libro.getId());
    props.setProperty("form_" + clave, form.getId());
    SpreadsheetApp.flush();
    renombrarRespuestas_(libro, form, "Respuestas – " + definicion.pestana);
  });

  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === "alRecibirRespuesta")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("alRecibirRespuesta").forSpreadsheet(libro).onFormSubmit().create();

  verEnlaces();
}

function prepararPestana_(libro, nombre) {
  const conf = PESTANAS[nombre];
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);
  const actual = hoja.getLastColumn() > 0
    ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String)
    : [];
  // Agrega al final las columnas que falten, sin mover las que ya hay.
  const faltan = conf.columnas.filter((c) => actual.indexOf(c) === -1);
  if (faltan.length) hoja.getRange(1, actual.length + 1, 1, faltan.length).setValues([faltan]);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, hoja.getLastColumn()).setFontWeight("bold");

  const cabecera = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  const lista = (columna, valores, estricta) => {
    const i = cabecera.indexOf(columna);
    if (i < 0) return;
    const regla = SpreadsheetApp.newDataValidation()
      .requireValueInList(valores, true)
      .setAllowInvalid(!estricta)
      .build();
    hoja.getRange(2, i + 1, hoja.getMaxRows() - 1, 1).setDataValidation(regla);
  };
  lista("estado", ESTADOS, true);
  if (nombre === "Orgullo") {
    lista("categoria", CATEGORIAS, false);
    lista("destacado", ["Sí", "No"], true);
  }
  if (nombre === "Empresas") lista("rubro", RUBROS, false);
}

function crearFormulario_(def) {
  const form = FormApp.create(def.titulo);
  form.setDescription(def.descripcion);
  form.setCollectEmail(false);
  try { form.setRequireLogin(false); } catch (e) { /* solo existe en cuentas de Workspace */ }
  form.setConfirmationMessage("Gracias. La CESEG revisará tu envío antes de publicarlo.");
  def.preguntas.forEach((p) => {
    if (p.seccion) {
      form.addSectionHeaderItem().setTitle(p.seccion);
      return;
    }
    let item;
    if (p.tipo === "parrafo") {
      item = form.addParagraphTextItem();
      if (p.maximo) {
        item.setValidation(FormApp.createParagraphTextValidation()
          .requireTextLengthLessThanOrEqualTo(p.maximo).build());
      }
    } else if (p.tipo === "opcion") {
      item = form.addMultipleChoiceItem().setChoiceValues(p.opciones);
      if (p.otra) item.showOtherOption(true);
    } else if (p.tipo === "casilla") {
      item = form.addCheckboxItem().setChoiceValues(p.opciones);
    } else {
      item = form.addTextItem();
      if (p.tipo === "url") item.setValidation(FormApp.createTextValidation().requireTextIsUrl().build());
      if (p.tipo === "correo") item.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
    }
    item.setTitle(p.titulo);
    if (p.ayuda) item.setHelpText(p.ayuda);
    if (p.requerida) item.setRequired(true);
  });
  return form;
}

function renombrarRespuestas_(libro, form, nombre) {
  if (libro.getSheetByName(nombre)) return;
  libro.getSheets().forEach((hoja) => {
    const vinculado = hoja.getFormUrl && hoja.getFormUrl();
    if (vinculado && vinculado.indexOf(form.getId()) !== -1) hoja.setName(nombre);
  });
}

/** Muestra los enlaces públicos de los formularios, para ponerlos en Google Sites. */
function verEnlaces() {
  const props = PropertiesService.getScriptProperties();
  const lineas = Object.keys(FORMULARIOS).map((clave) => {
    const id = props.getProperty("form_" + clave);
    if (!id) return FORMULARIOS[clave].titulo + ": (sin crear; ejecuta instalar)";
    return FORMULARIOS[clave].titulo + ":\n" + FormApp.openById(id).getPublishedUrl();
  });
  const texto = lineas.join("\n\n");
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Enlaces de los formularios", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

// ---------------- respuestas ----------------

/** Disparador: cada respuesta entra como fila «Borrador» en su pestaña. */
function alRecibirRespuesta(e) {
  const hojaRespuestas = e.range.getSheet();
  const vinculado = hojaRespuestas.getFormUrl ? hojaRespuestas.getFormUrl() : "";
  const props = PropertiesService.getScriptProperties();
  const clave = Object.keys(FORMULARIOS).filter((k) => {
    const id = props.getProperty("form_" + k);
    return id && vinculado && vinculado.indexOf(id) !== -1;
  })[0];
  if (!clave) return;

  const def = FORMULARIOS[clave];
  const valores = { estado: "Borrador", fecha_propuesta: new Date() };
  def.preguntas.forEach((p) => {
    if (!p.columna || !e.namedValues[p.titulo]) return;
    valores[p.columna] = String(e.namedValues[p.titulo][0] || "").trim();
  });
  if (clave === "orgullo") {
    valores.destacado = "No";
    if (CATEGORIAS.indexOf(valores.categoria) === -1) {
      valores.notas = "Área propuesta: " + (valores.categoria || "—") + ". Asignar una categoría antes de aprobar.";
      valores.categoria = "";
    }
  }
  agregarFila_(def.pestana, valores);
}

function agregarFila_(nombre, valores) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  const cabecera = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  hoja.appendRow(cabecera.map((c) => (c in valores ? valores[c] : "")));
}

// ---------------- publicación ----------------

/** Menú «CESEG › Publicar cambios». */
function publicar() {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  const resumen = [];
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    const publico = SpreadsheetApp.openById(ID_HOJA_PUBLICA);
    ["Orgullo", "Empresas"].forEach((nombre) => {
      const r = publicarPestana_(libro, publico, nombre);
      resumen.push(nombre + ": " + r.publicadas + " publicadas" +
        (r.omitidas.length ? "; " + r.omitidas.length + " aprobadas sin publicar:\n  - " + r.omitidas.join("\n  - ") : "."));
    });
  } finally {
    candado.releaseLock();
  }
  const texto = resumen.join("\n\n");
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Publicación", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

function publicarPestana_(libro, publico, nombre) {
  const conf = PESTANAS[nombre];
  const hoja = libro.getSheetByName(nombre);
  const datos = hoja.getDataRange().getValues();
  const cabecera = datos[0].map(String);
  const col = (c) => cabecera.indexOf(c);
  const filas = [];
  const omitidas = [];

  for (let i = 1; i < datos.length; i++) {
    const fila = datos[i];
    if (String(fila[col("estado")]).trim() !== "Aprobado") continue;
    const valor = (c) => (col(c) < 0 ? "" : String(fila[col(c)] == null ? "" : fila[col(c)]).trim());
    const etiqueta = "fila " + (i + 1) + " (" + (valor("nombre") || valor("empresa") || "sin nombre") + ")";

    const faltan = conf.obligatorias.filter((c) => !valor(c));
    if (faltan.length) {
      omitidas.push(etiqueta + ": falta " + faltan.join(", "));
      continue;
    }

    if (nombre === "Empresas") {
      let lat = aNumero_(fila[col("lat")]);
      let lng = aNumero_(fila[col("lng")]);
      if (!coordenadaValida_(lat, lng)) {
        // Primero las coordenadas verificadas de la carga inicial; si no, la ciudad.
        const punto = COORDENADAS_INICIALES[valor("empresa")] || geocodificar_(valor("ciudad"), valor("pais"));
        if (!punto) {
          omitidas.push(etiqueta + ": no se pudo ubicar la ciudad; escribe lat y lng a mano");
          continue;
        }
        lat = punto.lat;
        lng = punto.lng;
      }
      // Siempre como números: si una celda queda como texto, Google borra los
      // valores de esa columna al leerla.
      hoja.getRange(i + 1, col("lat") + 1).setValue(lat);
      hoja.getRange(i + 1, col("lng") + 1).setValue(lng);
      fila[col("lat")] = lat;
      fila[col("lng")] = lng;
    }

    filas.push(conf.publicas.map((c) => {
      if (c === "destacado") return valor(c) === "Sí" ? "Sí" : "No";
      return col(c) < 0 ? "" : fila[col(c)];
    }));
  }

  let destino = publico.getSheetByName(nombre);
  if (!destino) destino = publico.insertSheet(nombre);
  destino.clearContents();
  const todo = [conf.publicas].concat(filas);
  destino.getRange(1, 1, todo.length, conf.publicas.length).setValues(todo);
  return { publicadas: filas.length, omitidas: omitidas };
}

// Convierte una celda en número. Acepta coma o punto decimal.
function aNumero_(valor) {
  if (typeof valor === "number") return valor;
  const texto = String(valor == null ? "" : valor).trim().replace(",", ".");
  return texto === "" ? NaN : Number(texto);
}

function coordenadaValida_(lat, lng) {
  return isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
}

// Coordenadas verificadas de las 9 empresas de la carga inicial. Reparan las
// que la importación del CSV leyó mal (en una hoja en español, «10.409» se
// convierte en 10409). Solo se usan si la celda tiene una coordenada imposible.
const COORDENADAS_INICIALES = {
  "3D3": { lat: 10.409, lng: -66.883 },
  "AST SpaceMobile": { lat: 31.9974, lng: -102.0779 },
  "Biofarm": { lat: 10.4806, lng: -66.9036 },
  "Blue Orbit Space Systems": { lat: 53.1069, lng: 8.855 },
  "Domotai": { lat: 10.455, lng: -66.93 },
  "Kavak": { lat: 19.4326, lng: -99.1332 },
  "Krill Energy": { lat: 10.51, lng: -66.85 },
  "Scientific Lightning Solutions": { lat: 28.353, lng: -80.685 },
  "Sistemas Gerenciales JPL & Asociados": { lat: 10.498, lng: -66.888 }
};

function geocodificar_(ciudad, pais) {
  try {
    const r = Maps.newGeocoder().setLanguage("es").geocode(ciudad + ", " + pais);
    if (!r || r.status !== "OK" || !r.results.length) return null;
    const loc = r.results[0].geometry.location;
    return { lat: Math.round(loc.lat * 10000) / 10000, lng: Math.round(loc.lng * 10000) / 10000 };
  } catch (e) {
    return null;
  }
}
