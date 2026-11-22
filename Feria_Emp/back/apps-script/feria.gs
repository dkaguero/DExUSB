/**
 * Feria de Empleo CESEG: base de datos y publicación.
 *
 * Va instalado en el archivo PRIVADO «Feria CESEG – edición»
 * (Extensiones › Apps Script). Instrucciones: Feria_Emp/docs/instalacion.md
 *
 *  - instalar(): crea las pestañas, carga la configuración inicial (planes,
 *    pabellones, universidades), crea el archivo PÚBLICO «Feria CESEG –
 *    público» (lector con enlace) y la carpeta privada de archivos.
 *  - Menú «Feria CESEG › Publicar cambios»: copia al archivo público solo lo
 *    que cumple las reglas (empresa aprobada y con pago confirmado, stand
 *    aprobado, vacantes y charlas aprobadas) y avisa de lo que quedó fuera.
 *  - «Cargar / Borrar datos de ejemplo»: empresas ficticias para probar.
 *
 * El archivo público no lleva datos personales: ni correos, ni perfiles, ni
 * postulaciones, ni CV. Los widgets de Google Sites leen de él.
 */

const NOMBRE_PUBLICO = "Feria CESEG – público";
const NOMBRE_CARPETA = "Feria CESEG – archivos (privado)";
const ZONA = "America/Caracas";

const SI_NO = ["Sí", "No"];

// Pestañas del archivo de edición: columnas, listas desplegables y datos iniciales.
const PESTANAS = {
  Configuracion: {
    columnas: ["clave", "valor", "descripcion"],
    inicial: [
      ["edicion_nombre", "Feria de Empleo USB", "Nombre de la edición"],
      ["convocatoria_inicio", "", "Fecha (por definir)"],
      ["convocatoria_fin", "", "Fecha (por definir)"],
      ["feria_inicio", "", "Fecha (por definir)"],
      ["feria_fin", "", "Fecha (por definir)"],
      ["consulta_dias", 15, "Días de consulta para las empresas después de la feria"],
      ["charlas_hora_inicio", "09:00", "Primer turno de charlas"],
      ["charlas_hora_fin", "16:00", "Fin del último turno de charlas"],
      ["charlas_max_por_empresa", 3, "Charlas por empresa"],
      ["correo_admin", "ceseg@usb.ve", "Recibe los avisos de solicitudes nuevas"],
      ["youtube_canal", "", "Canal de YouTube de la CESEG"],
      ["calendario_id", "", "Calendario «CESEG – Eventos» (fase 5)"],
      ["id_datos_ceseg", "", "Archivo «Datos CESEG – edición», para el mapa de empresas (fase 4)"],
      ["id_hoja_publica", "", "Lo llena instalar()"],
      ["id_carpeta", "", "Lo llena instalar()"]
    ]
  },
  Planes: {
    columnas: ["id", "nombre", "precio", "posicion_desde", "posicion_hasta", "max_vacantes", "acceso_cv", "analitica", "charlas", "forma", "beneficios"],
    inicial: [
      ["platinum", "Platinum", 250, 1, 5, "", "Toda la base que autorizó compartir", "Completa", "Garantizada", "Isla con tótem",
        "Vacantes sin límite | Acceso a toda la base de CV que autorizó compartirlo | Analítica completa | Charla garantizada en el auditorio | Ubicación junto al pórtico CESEG"],
      ["gold", "Gold", 200, 6, 10, 10, "Solo los compartidos", "Básica", "A solicitud", "Esquina con pantalla",
        "Hasta 10 vacantes | CV de quienes lo comparten con la empresa | Analítica básica | Charla en el auditorio, a solicitud | Destacado en el directorio"],
      ["silver", "Silver", 150, 11, 15, 3, "Solo los compartidos", "Básica", "No", "Stand de pared",
        "Hasta 3 vacantes | CV de quienes lo comparten con la empresa | Analítica básica"]
    ]
  },
  Pabellones: {
    columnas: ["slug", "nombre", "sector", "color", "posiciones", "orden"],
    inicial: [
      ["tecnologia", "Tecnología", "Tecnología", "#00aaff", 15, 1],
      ["salud", "Salud", "Salud", "#e5484d", 15, 2],
      ["ingenieria", "Ingeniería", "Ingeniería", "#f5a524", 15, 3],
      ["negocios", "Negocios", "Negocios", "#4caf50", 15, 4]
    ]
  },
  Empresas: {
    columnas: ["id", "estado", "pago", "especial", "razon_social", "nombre_comercial", "rif", "sector", "tamano", "web",
      "pabellon", "posicion", "plan", "contacto_nombre", "contacto_cargo", "correo_dueno", "correos_reclutadores",
      "fundada_por_egresados", "fundadores", "carreras_fundadores", "ciudad", "pais",
      "acepta_terminos", "acepta_marca", "version_textos", "motivo", "verificado_por", "notas", "fecha_solicitud", "demo"],
    listas: { estado: ["Pendiente", "Aprobada", "Rechazada", "Pausada"], pago: ["Pendiente", "Confirmado", "No aplica"],
      especial: SI_NO, fundada_por_egresados: SI_NO, plan: ["platinum", "gold", "silver"], demo: SI_NO }
  },
  Stands: {
    columnas: ["empresa_id", "estado", "color", "logo", "banner", "descripcion", "video", "web",
      "instagram", "linkedin", "facebook", "x", "tiktok", "youtube", "otras_redes",
      "whatsapp", "whatsapp_mensaje", "galeria", "folleto", "sala_entrevistas",
      "verificado_por", "notas", "fecha", "demo"],
    listas: { estado: ["Borrador", "Aprobado", "Rechazado"], demo: SI_NO }
  },
  Vacantes: {
    columnas: ["id", "estado", "origen", "empresa_id", "empresa_nombre", "titulo", "descripcion", "requisitos", "ubicacion",
      "modalidad", "contrato", "salario", "sector", "correo_contacto", "enlace_postulacion", "fecha", "verificado_por", "notas", "demo"],
    listas: { estado: ["Borrador", "Aprobada", "Rechazada", "Pausada", "Cerrada"], origen: ["Feria", "Bolsa"],
      modalidad: ["Presencial", "Remota", "Híbrida"],
      contrato: ["Pasantía", "Tiempo completo", "Medio tiempo", "Plazo fijo", "Freelance"], demo: SI_NO }
  },
  Perfiles: {
    columnas: ["id", "correo", "nombre", "apellido", "documento", "relacion_usb", "carnet", "universidad", "carrera", "estatus",
      "ciudad", "pais", "idiomas", "habilidades", "intereses", "linkedin", "correo_institucional", "cv", "cv_fecha",
      "acepta_terminos", "acepta_cv", "acepta_comunicaciones", "version_textos", "en_censo", "fecha", "demo"],
    listas: { relacion_usb: ["Egresado o egresada de la USB", "Estudiante de la USB", "Egresado o estudiante de otra universidad", "Otra"],
      acepta_cv: SI_NO, acepta_comunicaciones: SI_NO, en_censo: SI_NO, demo: SI_NO }
  },
  Postulaciones: {
    columnas: ["id", "fecha", "tipo", "vacante_id", "empresa_id", "perfil_correo", "nota", "estado", "cv_copiado", "demo"],
    listas: { tipo: ["Postulación", "CV compartido"], estado: ["Recibido", "En revisión", "Entrevista", "Descartado"],
      cv_copiado: SI_NO, demo: SI_NO }
  },
  Charlas: {
    columnas: ["id", "estado", "empresa_id", "titulo", "ponente", "fecha", "hora", "duracion", "youtube",
      "evento_calendario", "verificado_por", "notas", "fecha_solicitud", "demo"],
    listas: { estado: ["Solicitada", "Aprobada", "Rechazada", "Bloqueo"], duracion: [15, 30], demo: SI_NO }
  },
  Universidades: {
    columnas: ["nombre"],
    inicial: [["Universidad Simón Bolívar (USB)"], ["Universidad Central de Venezuela (UCV)"],
      ["Universidad Católica Andrés Bello (UCAB)"], ["Universidad Metropolitana (UNIMET)"], ["Universidad de Carabobo (UC)"]]
  },
  Patrocinantes: {
    columnas: ["nombre", "logo", "web", "orden", "demo"],
    listas: { demo: SI_NO }
  },
  Eventos: {
    columnas: ["fecha", "tipo", "empresa_id", "vacante_id", "visitante", "detalle"]
  }
};

// Pestañas del archivo público y sus columnas (sin datos personales).
const PUBLICAS = {
  Edicion: ["clave", "valor"],
  Planes: ["id", "nombre", "precio", "desde", "hasta", "forma", "beneficios"],
  Pabellones: ["slug", "nombre", "sector", "color", "posiciones"],
  Stands: ["empresa_id", "pabellon", "posicion", "plan", "empresa", "color", "logo", "banner", "descripcion", "video", "web",
    "redes", "whatsapp", "whatsapp_mensaje", "galeria", "folleto", "sala"],
  Vacantes: ["id", "origen", "empresa_id", "empresa", "titulo", "descripcion", "requisitos", "ubicacion", "modalidad",
    "contrato", "salario", "sector", "enlace_postulacion", "fecha"],
  Charlas: ["titulo", "empresa", "inicio", "duracion", "youtube"],
  Patrocinantes: ["nombre", "logo", "web", "orden"]
};

const REDES = [["instagram", "Instagram"], ["linkedin", "LinkedIn"], ["facebook", "Facebook"], ["x", "X"],
  ["tiktok", "TikTok"], ["youtube", "YouTube"]];

// ---------------- menú ----------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Feria CESEG")
    .addItem("Publicar cambios", "publicar")
    .addSeparator()
    .addItem("Cargar datos de ejemplo", "cargarEjemplo")
    .addItem("Borrar datos de ejemplo", "borrarEjemplo")
    .addSeparator()
    .addItem("Ver el archivo público", "verPublico")
    .addToUi();
}

// ---------------- instalación ----------------

/** Se ejecuta una vez. Se puede repetir: no duplica pestañas, datos ni archivos. */
function instalar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  libro.setSpreadsheetTimeZone(ZONA);
  Object.keys(PESTANAS).forEach((nombre) => prepararPestana_(libro, nombre));
  const hojaDefecto = libro.getSheetByName("Hoja 1") || libro.getSheetByName("Sheet1");
  if (hojaDefecto && hojaDefecto.getLastRow() === 0 && libro.getSheets().length > 1) libro.deleteSheet(hojaDefecto);

  // Archivo público: se crea una vez y se comparte como lector con enlace.
  let idPublico = config_("id_hoja_publica");
  if (!idPublico) {
    const publico = SpreadsheetApp.create(NOMBRE_PUBLICO);
    publico.setSpreadsheetTimeZone(ZONA);
    idPublico = publico.getId();
    guardarConfig_("id_hoja_publica", idPublico);
  }
  DriveApp.getFileById(idPublico).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Carpeta privada para CV, logos y folletos (fases 2 y 7).
  if (!config_("id_carpeta")) guardarConfig_("id_carpeta", DriveApp.createFolder(NOMBRE_CARPETA).getId());

  publicar();
  verPublico();
}

function prepararPestana_(libro, nombre) {
  const def = PESTANAS[nombre];
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);
  const actual = hoja.getLastColumn() > 0 ? hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String) : [];
  const faltan = def.columnas.filter((c) => actual.indexOf(c) === -1);
  if (faltan.length) hoja.getRange(1, actual.length + 1, 1, faltan.length).setValues([faltan]);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, hoja.getLastColumn()).setFontWeight("bold").setBackground("#dbe7f5");

  if (def.inicial && hoja.getLastRow() < 2) {
    hoja.getRange(2, 1, def.inicial.length, def.inicial[0].length).setValues(def.inicial);
  }

  const cabecera = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  Object.keys(def.listas || {}).forEach((columna) => {
    const i = cabecera.indexOf(columna);
    if (i < 0) return;
    const regla = SpreadsheetApp.newDataValidation().requireValueInList(def.listas[columna].map(String), true).setAllowInvalid(false).build();
    hoja.getRange(2, i + 1, Math.max(hoja.getMaxRows() - 1, 1), 1).setDataValidation(regla);
  });
}

// ---------------- configuración ----------------

function config_(clave) {
  const filas = leerTabla_("Configuracion");
  const fila = filas.filter((f) => f.clave === clave)[0];
  return fila ? fila.valor : "";
}

function guardarConfig_(clave, valor) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Configuracion");
  const datos = hoja.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0] === clave) { hoja.getRange(i + 1, 2).setValue(valor); return; }
  }
  hoja.appendRow([clave, valor, ""]);
}

// ---------------- lectura y escritura ----------------

/** Filas de una pestaña como objetos { columna: valor } (valores de texto recortados). */
function leerTabla_(nombre, libro) {
  const hoja = (libro || SpreadsheetApp.getActiveSpreadsheet()).getSheetByName(nombre);
  if (!hoja || hoja.getLastRow() < 2) return [];
  const datos = hoja.getDataRange().getValues();
  const cabecera = datos[0].map(String);
  return datos.slice(1).map((fila, i) => {
    const o = { _fila: i + 2 };
    cabecera.forEach((c, j) => { o[c] = typeof fila[j] === "string" ? fila[j].trim() : fila[j]; });
    return o;
  });
}

function escribirTabla_(libro, nombre, columnas, filas) {
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);
  hoja.clearContents();
  const todo = [columnas].concat(filas.map((f) => columnas.map((c) => (f[c] == null ? "" : f[c]))));
  hoja.getRange(1, 1, todo.length, columnas.length).setValues(todo);
}

// ---------------- publicación ----------------

/** Menú «Feria CESEG › Publicar cambios». */
function publicar() {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  let r;
  try {
    const publico = SpreadsheetApp.openById(config_("id_hoja_publica"));
    r = calcularPublicacion_(leerTodo_());
    Object.keys(PUBLICAS).forEach((nombre) => escribirTabla_(publico, nombre, PUBLICAS[nombre], r.tablas[nombre]));
    const sobra = publico.getSheetByName("Hoja 1") || publico.getSheetByName("Sheet1");
    if (sobra && publico.getSheets().length > 1) publico.deleteSheet(sobra);
  } finally {
    candado.releaseLock();
  }
  const texto = "Publicado: " + r.tablas.Stands.length + " stands, " + r.tablas.Vacantes.length + " vacantes, " +
    r.tablas.Charlas.length + " charlas." + (r.avisos.length ? "\n\nNo se publicó:\n- " + r.avisos.join("\n- ") : "");
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Feria CESEG", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

function leerTodo_() {
  const t = {};
  ["Configuracion", "Planes", "Pabellones", "Empresas", "Stands", "Vacantes", "Charlas", "Patrocinantes"].forEach((n) => { t[n] = leerTabla_(n); });
  return t;
}

/**
 * Reglas de publicación (sin tocar hojas, para poder probarlas):
 *  - stand: empresa «Aprobada», pago «Confirmado» (o empresa especial), stand
 *    «Aprobado», con pabellón y posición válidos y libres;
 *  - el plan del stand es el de su posición; si no coincide con el de la empresa, se avisa;
 *  - vacantes «Aprobada»: de la Bolsa, o de una empresa publicada, hasta el máximo de su plan;
 *  - charlas «Aprobada» de empresas publicadas con plan que las permite (o de la CESEG, sin empresa).
 */
function calcularPublicacion_(t) {
  const avisos = [];
  const cfg = {};
  t.Configuracion.forEach((f) => { cfg[f.clave] = f.valor; });
  const planes = t.Planes;
  const planDe = (pos) => planes.filter((p) => pos >= Number(p.posicion_desde) && pos <= Number(p.posicion_hasta))[0];
  const pabellones = t.Pabellones.slice().sort((a, b) => Number(a.orden) - Number(b.orden));
  const nombreDe = (e) => e.nombre_comercial || e.razon_social || e.id;

  // Stands
  const standDe = {};
  t.Stands.forEach((s) => { standDe[s.empresa_id] = s; });
  const ocupadas = {};
  const publicadas = {};
  const stands = [];
  t.Empresas.forEach((e) => {
    if (!e.id || e.estado !== "Aprobada") return;
    const nombre = nombreDe(e);
    if (e.pago !== "Confirmado" && e.especial !== "Sí") { avisos.push(nombre + ": pago sin confirmar"); return; }
    const s = standDe[e.id];
    if (!s || s.estado !== "Aprobado") { avisos.push(nombre + ": stand sin aprobar"); return; }
    const pab = pabellones.filter((p) => p.slug === e.pabellon)[0];
    const pos = Number(e.posicion);
    if (!pab || !(pos >= 1 && pos <= Number(pab.posiciones))) { avisos.push(nombre + ": pabellón o posición no válidos"); return; }
    const clave = pab.slug + "#" + pos;
    if (ocupadas[clave]) { avisos.push(nombre + ": la posición " + pos + " de " + pab.nombre + " ya es de " + ocupadas[clave]); return; }
    const plan = planDe(pos);
    if (plan && e.plan && e.plan !== plan.id) avisos.push(nombre + ": tiene plan " + e.plan + " pero la posición " + pos + " es " + plan.id + " (se publica como " + plan.id + ")");
    ocupadas[clave] = nombre;
    publicadas[e.id] = { nombre: nombre, plan: plan || {} };
    const redes = REDES.filter((r) => s[r[0]]).map((r) => ({ red: r[1], url: String(s[r[0]]) }));
    String(s.otras_redes || "").split(/\s*\|\s*|\n/).filter(Boolean).forEach((u) => redes.push({ red: "Otra", url: u }));
    stands.push({
      empresa_id: e.id, pabellon: pab.slug, posicion: pos, plan: plan ? plan.id : "", empresa: nombre,
      color: s.color || pab.color, logo: imagenPublica_(s.logo), banner: imagenPublica_(s.banner),
      descripcion: s.descripcion, video: s.video, web: s.web || e.web, redes: JSON.stringify(redes),
      whatsapp: String(s.whatsapp || "").replace(/\D/g, ""), whatsapp_mensaje: s.whatsapp_mensaje,
      galeria: JSON.stringify(String(s.galeria || "").split(/\s*\|\s*|\n/).filter(Boolean).slice(0, 6).map(imagenPublica_)),
      folleto: archivoPublico_(s.folleto), sala: s.sala_entrevistas
    });
  });

  // Vacantes
  const usadas = {};
  const vacantes = [];
  t.Vacantes.forEach((v) => {
    if (!v.id || v.estado !== "Aprobada") return;
    const bolsa = v.origen === "Bolsa";
    const emp = publicadas[v.empresa_id];
    if (!bolsa && !emp) { avisos.push("Vacante «" + v.titulo + "»: su empresa no está publicada"); return; }
    if (!bolsa) {
      const max = Number(emp.plan.max_vacantes);
      usadas[v.empresa_id] = (usadas[v.empresa_id] || 0) + 1;
      if (max > 0 && usadas[v.empresa_id] > max) { avisos.push("Vacante «" + v.titulo + "»: " + emp.nombre + " superó las " + max + " vacantes de su plan"); return; }
    }
    vacantes.push({
      id: v.id, origen: bolsa ? "Bolsa" : "Feria", empresa_id: bolsa ? "" : v.empresa_id,
      empresa: bolsa ? v.empresa_nombre : emp.nombre, titulo: v.titulo, descripcion: v.descripcion, requisitos: v.requisitos,
      ubicacion: v.ubicacion, modalidad: v.modalidad, contrato: v.contrato, salario: v.salario, sector: v.sector,
      enlace_postulacion: v.enlace_postulacion, fecha: fechaTexto_(v.fecha)
    });
  });

  // Charlas
  const charlas = [];
  t.Charlas.forEach((c) => {
    if (c.estado !== "Aprobada") return;
    let empresa = "CESEG";
    if (c.empresa_id) {
      const emp = publicadas[c.empresa_id];
      if (!emp) { avisos.push("Charla «" + c.titulo + "»: su empresa no está publicada"); return; }
      if (emp.plan.charlas === "No") { avisos.push("Charla «" + c.titulo + "»: el plan de " + emp.nombre + " no incluye charlas"); return; }
      empresa = emp.nombre;
    }
    const inicio = inicioISO_(c.fecha, c.hora);
    if (!inicio) { avisos.push("Charla «" + c.titulo + "»: falta la fecha o la hora"); return; }
    charlas.push({ titulo: c.titulo, empresa: empresa, inicio: inicio, duracion: Number(c.duracion) || 30, youtube: c.youtube });
  });

  return {
    avisos: avisos,
    tablas: {
      Edicion: ["edicion_nombre", "convocatoria_inicio", "convocatoria_fin", "feria_inicio", "feria_fin", "consulta_dias", "youtube_canal"]
        .map((k) => ({ clave: k, valor: cfg[k] instanceof Date ? fechaTexto_(cfg[k]) : (cfg[k] == null ? "" : cfg[k]) })),
      Planes: planes.map((p) => ({ id: p.id, nombre: p.nombre, precio: p.precio, desde: p.posicion_desde, hasta: p.posicion_hasta, forma: p.forma, beneficios: p.beneficios })),
      Pabellones: pabellones.map((p) => ({ slug: p.slug, nombre: p.nombre, sector: p.sector, color: p.color, posiciones: p.posiciones })),
      Stands: stands,
      Vacantes: vacantes,
      Charlas: charlas.sort((a, b) => (a.inicio < b.inicio ? -1 : 1)),
      Patrocinantes: t.Patrocinantes.filter((p) => p.nombre)
        .map((p) => ({ nombre: p.nombre, logo: imagenPublica_(p.logo), web: p.web, orden: p.orden }))
    }
  };
}

// ---------------- utilidades ----------------

function idDrive_(valor) {
  const m = String(valor || "").match(/(?:\/d\/|[?&]id=)([\w-]{20,})/);
  return m ? m[1] : (/^[\w-]{25,}$/.test(String(valor || "")) ? String(valor) : null);
}

/** Imagen de Drive → enlace que se ve sin iniciar sesión. Otras URL quedan igual. */
function imagenPublica_(valor) {
  if (!valor) return "";
  const id = idDrive_(valor);
  if (!id) return String(valor);
  compartirLectura_(id);
  return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1600";
}

function archivoPublico_(valor) {
  if (!valor) return "";
  const id = idDrive_(valor);
  if (!id) return String(valor);
  compartirLectura_(id);
  return "https://drive.google.com/file/d/" + id + "/view";
}

function compartirLectura_(id) {
  try {
    if (typeof DriveApp !== "undefined") DriveApp.getFileById(id).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) { /* si no se puede, el enlace igual se publica */ }
}

function fechaTexto_(v) {
  if (!v) return "";
  if (v instanceof Date) return Utilities.formatDate(v, ZONA, "yyyy-MM-dd");
  return String(v);
}

/** Fecha (celda de fecha o «aaaa-mm-dd») + hora («10:30» o celda de hora) → ISO con la hora de Caracas (UTC-4). */
function inicioISO_(fecha, hora) {
  const f = fecha instanceof Date ? Utilities.formatDate(fecha, ZONA, "yyyy-MM-dd") : String(fecha || "").trim();
  let h = hora instanceof Date ? Utilities.formatDate(hora, ZONA, "HH:mm") : String(hora || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f) || !/^\d{1,2}:\d{2}$/.test(h)) return "";
  if (h.length === 4) h = "0" + h;
  return f + "T" + h + ":00-04:00";
}

function verPublico() {
  const id = config_("id_hoja_publica");
  const texto = id
    ? "Archivo público (lector con enlace):\nhttps://docs.google.com/spreadsheets/d/" + id + "/edit\n\nID: " + id
    : "Aún no existe: ejecuta instalar.";
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Feria CESEG", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

// ---------------- datos de ejemplo ----------------

// Empresas ficticias del proyecto original (demo-fair-data.ts). Ninguna es real.
const EJEMPLO = [
  ["ej-nodo", "Nodo Digital", "tecnologia", 1, "platinum", "#00aaff"],
  ["ej-tepuy", "Tepuy Software", "tecnologia", 6, "gold", "#8e4ec6"],
  ["ej-lumen", "Lumen Cloud", "tecnologia", 11, "silver", "#12a594"],
  ["ej-aurora", "Clínica Santa Aurora", "salud", 2, "platinum", "#e5484d"],
  ["ej-roraima", "Constructora Roraima", "ingenieria", 7, "gold", "#f5a524"],
  ["ej-esmeralda", "Banca Mercantil Esmeralda", "negocios", 12, "silver", "#4caf50"]
];

function cargarEjemplo() {
  borrarEjemplo(true);
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const agregar = (nombre, filas) => {
    const hoja = libro.getSheetByName(nombre);
    const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
    filas.forEach((o) => hoja.appendRow(cab.map((c) => (c in o ? o[c] : ""))));
  };
  const hoy = new Date();
  const manana = new Date(hoy.getTime() + 86400000);
  agregar("Empresas", EJEMPLO.map((e) => ({
    id: e[0], estado: "Aprobada", pago: "Confirmado", especial: "No", razon_social: e[1] + " (ejemplo)", nombre_comercial: e[1],
    sector: e[2], pabellon: e[2], posicion: e[3], plan: e[4], fundada_por_egresados: "No",
    acepta_terminos: "Sí", acepta_marca: "Sí", verificado_por: "Datos de ejemplo", fecha_solicitud: hoy, demo: "Sí"
  })));
  agregar("Stands", EJEMPLO.map((e) => ({
    empresa_id: e[0], estado: "Aprobado", color: e[5],
    descripcion: "Empresa ficticia para probar la feria. Buscamos pasantes y recién egresados con ganas de crecer (texto de demostración).",
    web: "https://www.usb.ve", instagram: "https://www.instagram.com/", linkedin: "https://www.linkedin.com/",
    whatsapp: "584120000000", whatsapp_mensaje: "Hola, los vi en la Feria de Empleo USB.", demo: "Sí"
  })));
  const vac = [];
  EJEMPLO.forEach((e, i) => {
    vac.push({ id: e[0] + "-v1", estado: "Aprobada", origen: "Feria", empresa_id: e[0], titulo: "Pasante (ejemplo)", modalidad: "Híbrida", contrato: "Pasantía", sector: e[2], fecha: hoy, demo: "Sí" });
    if (i % 2 === 0) vac.push({ id: e[0] + "-v2", estado: "Aprobada", origen: "Feria", empresa_id: e[0], titulo: "Analista junior (ejemplo)", modalidad: "Remota", contrato: "Tiempo completo", sector: e[2], fecha: hoy, demo: "Sí" });
  });
  agregar("Vacantes", vac);
  agregar("Charlas", [{ id: "ej-charla-1", estado: "Aprobada", empresa_id: "ej-nodo", titulo: "Cómo es una pasantía en tecnología (ejemplo)",
    ponente: "Equipo de Nodo Digital", fecha: Utilities.formatDate(manana, ZONA, "yyyy-MM-dd"), hora: "10:00", duracion: 30, demo: "Sí" }]);
  publicar();
}

/** Borra todas las filas marcadas demo = «Sí». */
function borrarEjemplo(silencioso) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  ["Empresas", "Stands", "Vacantes", "Charlas", "Perfiles", "Postulaciones", "Patrocinantes"].forEach((nombre) => {
    const hoja = libro.getSheetByName(nombre);
    if (!hoja || hoja.getLastRow() < 2) return;
    const datos = hoja.getDataRange().getValues();
    const i = datos[0].indexOf("demo");
    if (i < 0) return;
    for (let r = datos.length - 1; r >= 1; r--) if (datos[r][i] === "Sí") hoja.deleteRow(r + 1);
  });
  if (silencioso !== true) publicar();
}
