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
      ["calendario_id", "", "ID del calendario «CESEG – Eventos»: lo llena solo la publicación (fase 5)"],
      ["url_auditorio_sitio", "", "Dirección de la página Auditorio en Google Sites (para los correos y el pórtico)"],
      ["url_receptor", "https://script.google.com/macros/s/AKfycbzVu0xC7OyauBRiB0a8jxt3gXd3y5mOc05VMyTjyo2yBCJirUBsZQvbFfd_X4OCz5ds/exec", "Dirección de la aplicación web que recibe las visitas (fase 7B: Implementar › Aplicación web)"],
      ["id_datos_ceseg", "1eE7ja2kscREl-6MkUs2XAZqS-i64r44wb7OuaW00Zvo", "ID del archivo «Datos CESEG – edición»: las empresas fundadas por egresados pasan a su mapa (fase 4)"],
      ["id_censo", "1rde00EzCUdUByvFg1WZNOcAq4Ss1J8TaWTcX55qJHVQ", "ID de la hoja de respuestas del Censo de Egresados (fase 4)"],
      ["url_censo", "https://docs.google.com/forms/d/e/1FAIpQLSeWRBYT_m98uIP7xnXQVKWIvPpHWH0IUi7wWJss2DHt5VBIwA/viewform", "Formulario del censo, para la invitación a egresados USB"],
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
      "fundada_por_egresados", "fundadores", "carreras_fundadores", "ciudad", "pais", "logo_oficial", "manual_marca", "enviada_mapa",
      "carpeta_cv", "panel", "compartido_con", "acceso_retirado",
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
      "acepta_terminos", "acepta_cv", "acepta_comunicaciones", "version_textos", "en_censo", "invitado_censo", "fecha", "demo"],
    listas: { relacion_usb: ["Egresado o egresada de la USB", "Estudiante de la USB", "Egresado o estudiante de otra universidad", "Otra"],
      acepta_cv: SI_NO, acepta_comunicaciones: SI_NO, en_censo: SI_NO, demo: SI_NO }
  },
  Postulaciones: {
    columnas: ["id", "fecha", "tipo", "vacante_id", "empresa_id", "perfil_correo", "nota", "estado", "cv_copiado", "notas", "demo"],
    listas: { tipo: ["Postulación", "CV compartido"], estado: ["Recibido", "En revisión", "Entrevista", "Descartado"],
      cv_copiado: SI_NO, demo: SI_NO }
  },
  Charlas: {
    columnas: ["id", "estado", "empresa_id", "titulo", "ponente", "fecha", "hora", "duracion", "youtube",
      "evento_calendario", "notificada", "verificado_por", "notas", "fecha_solicitud", "demo"],
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
  },
  // Copias de CV entregadas: una fila por destino y perfil (fase 7).
  CV_Entregados: {
    columnas: ["destino", "perfil_correo", "cv_origen", "copia", "fecha"]
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
    .addItem("Crear formularios", "instalarFormularios")
    .addItem("Ver formularios", "verFormularios")
    .addSeparator()
    .addItem("Conectar con el censo y el mapa", "conectar")
    .addItem("Entregar CV y actualizar paneles", "sincronizarEmpresas")
    .addItem("Activar tareas automáticas (cada hora)", "activarAutomatico")
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

/**
 * Escribe una pestaña del archivo público. Todo va como TEXTO: al leer la hoja,
 * Google adivina el tipo de cada columna y, si la cree numérica, borra los
 * textos (pasó con «valor» en Edicion: el nombre de la edición salía vacío).
 */
function escribirTabla_(libro, nombre, columnas, filas) {
  let hoja = libro.getSheetByName(nombre);
  if (!hoja) hoja = libro.insertSheet(nombre);
  hoja.clear();
  const texto = (v) => (v == null ? "" : v instanceof Date ? fechaTexto_(v) : String(v));
  const todo = [columnas].concat(filas.map((f) => columnas.map((c) => texto(f[c]))));
  const rango = hoja.getRange(1, 1, todo.length, columnas.length);
  rango.setNumberFormat("@");
  rango.setValues(todo);
}

// ---------------- publicación ----------------

/** Menú «Feria CESEG › Publicar cambios». */
function publicar() {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  let r;
  try {
    const publico = SpreadsheetApp.openById(config_("id_hoja_publica"));
    let avisosCal = [];
    try { avisosCal = sincronizarCalendario_(); } catch (e) { avisosCal = ["Calendario: " + e.message]; }
    r = calcularPublicacion_(leerTodo_());
    r.avisos = r.avisos.concat(avisosCal);
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

  // Stands: la versión aprobada más reciente de cada empresa. Una edición en
  // borrador no quita la versión aprobada mientras la CESEG la revisa.
  const standDe = {};
  t.Stands.forEach((s) => { if (s.estado === "Aprobado") standDe[s.empresa_id] = s; });
  const ocupadas = {};
  const publicadas = {};
  const stands = [];
  t.Empresas.forEach((e) => {
    if (!e.id || e.estado !== "Aprobada") return;
    const nombre = nombreDe(e);
    if (e.pago !== "Confirmado" && e.especial !== "Sí") { avisos.push(nombre + ": pago sin confirmar"); return; }
    const s = standDe[e.id];
    if (!s) { avisos.push(nombre + ": stand sin aprobar"); return; }
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
      Edicion: ["edicion_nombre", "convocatoria_inicio", "convocatoria_fin", "feria_inicio", "feria_fin", "consulta_dias", "youtube_canal",
        "url_perfil", "url_postular", "url_empresa", "url_stand", "url_vacante", "url_charla", "url_calendario", "url_auditorio_sitio", "url_receptor"]
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

// =====================================================================
// FASE 2: TEXTOS LEGALES Y FORMULARIOS
// =====================================================================

/*
 * Textos legales aprobados por la CESEG el 2026-11-03 (proyecto original,
 * base-seed.ts y brand-use-text.ts), reutilizados. Cambios mínimos para la
 * versión en Google, marcados en Feria_Emp/back/textos-legales/README.md:
 * los datos se guardan en Google Workspace de la USB, y la eliminación de los
 * datos o el retiro de la autorización se piden por correo a la CESEG (no hay
 * cuentas ni perfil en la plataforma).
 */
const VERSION_TEXTOS = "v1 (2026-11-03) adaptada a Google Workspace";

const TEXTOS = {
  ATTENDEE_TERMS: {
    titulo: "Términos y Condiciones de Uso y Política de Privacidad para Usuarios",
    texto: [
      "Al registrarse en la Feria de Empleo Virtual de la Universidad Simón Bolívar (USB), el usuario acepta de manera expresa, voluntaria e informada los siguientes términos:",
      "Responsable del Tratamiento: La Universidad Simón Bolívar (USB), a través de la Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG), adscrita al Decanato de Extensión (DEx), es la única entidad responsable de la recolección y resguardo de sus datos de contacto y perfil profesional, que se guardan en Google Workspace de la USB.",
      "Finalidad Exclusiva de los Datos: De conformidad con las garantías de protección a la privacidad y el honor previstas en el Artículo 60 de la Constitución de la República Bolivariana de Venezuela, los datos suministrados (incluyendo correos electrónicos de uso frecuente y CV) serán utilizados únicamente para:\n- Gestionar su participación y postulaciones dentro de la Feria de Empleo Virtual actual.\n- Poner su perfil profesional y su CV a disposición de las empresas participantes de la feria, según el plan de patrocinio de cada una.\n- Mantener el contacto institucional entre la USB y sus egresados o estudiantes.",
      "Principio de No Cesión a Terceros: La CESEG garantiza que su información personal no será compartida, vendida ni transferida a terceros distintos de las empresas participantes de la feria. Al cargar su CV, el usuario autoriza que su perfil profesional y su CV sean consultados y descargados por las empresas participantes, según el plan de patrocinio de cada empresa, incluso si no se ha postulado a sus ofertas, durante la feria y los quince (15) días posteriores a su cierre. Este acceso tiene el único fin de evaluar su candidatura y está sujeto a las obligaciones de confidencialidad que dichas empresas aceptan.",
      "Actualización de Datos: El usuario se compromete a suministrar una dirección de correo electrónico de uso frecuente, que será su correo principal en la feria, y a mantener actualizados sus datos. Si lo tuviera, podrá indicar además su correo institucional. Ambos aseguran una comunicación efectiva y bidireccional con la institución.",
      "Conservación de los Datos: La información suministrada se conserva bajo resguardo de la USB una vez finalizada la feria. Las empresas participantes dejan de tener acceso a ella a los quince (15) días del cierre de la feria. El usuario puede solicitar en cualquier momento la eliminación de sus datos escribiendo a ceseg@usb.ve; en ese caso, su CV y sus datos personales se eliminan de la feria. La eliminación no alcanza los CVs que las empresas hayan descargado antes de la solicitud, que siguen sujetos a las obligaciones de confidencialidad de dichas empresas."
    ].join("\n\n")
  },
  COMPANY_TERMS: {
    titulo: "Términos y Condiciones de Uso y Confidencialidad para Empresas Registradas",
    texto: [
      "Al registrarse como entidad empleadora en la Feria de Empleo Virtual de la Universidad Simón Bolívar (USB), la empresa acepta cumplir las siguientes disposiciones sobre el manejo de la información:",
      "Uso Exclusivo de los Datos: La Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG) autoriza a la empresa el acceso a los datos de los asistentes que hayan autorizado compartir su CV, según el plan de patrocinio contratado, con el único propósito de evaluar perfiles para sus procesos de reclutamiento, durante la feria y los quince (15) días posteriores a su cierre.",
      "Confidencialidad y Limitación Legal: En estricto cumplimiento del marco legal venezolano sobre la protección de datos personales, la empresa se compromete a no transferir, comercializar ni difundir la base de datos o la información de los usuarios a ninguna filial, tercero o entidad externa sin el consentimiento expreso del titular. Esta obligación se extiende a los CVs y datos descargados o exportados, que la empresa deberá resguardar y no podrá utilizar para fines distintos al reclutamiento.",
      "Planes de Patrocinio y Pagos: La participación de la empresa está sujeta al plan de patrocinio seleccionado en su registro, cuyos beneficios, límites y precio publica la CESEG. El pago se coordina directamente con la CESEG fuera de la plataforma. La aprobación de la CESEG y la confirmación del pago son requisitos para habilitar el stand. La CESEG se reserva la facultad de aprobar, rechazar, pausar o modificar el contenido de los stands para asegurar el cumplimiento de estos términos y de los lineamientos de la feria.",
      "Comunicaciones Futuras por la CESEG: La empresa acepta que los datos de contacto suministrados en su registro corporativo serán incorporados a los sistemas de la CESEG para:\n- Coordinar los aspectos logísticos y operativos de la presente feria.\n- Contactarles en el futuro e invitarles a participar en próximas ediciones, ferias de empleo, proyectos de emprendimiento o alianzas estratégicas organizadas por la CESEG.",
      "Veracidad de la Información: La empresa garantiza que toda la información provista sobre su identidad legal y las ofertas de empleo publicadas es fidedigna y cumple con la legislación laboral venezolana vigente."
    ].join("\n\n")
  },
  CV_SHARING: {
    titulo: "Autorización para compartir tu CV",
    texto: "Al cargar tu CV autorizas a la CESEG a mostrar y permitir la descarga de tu perfil profesional y tu currículum a las empresas participantes de la Feria de Empleo Virtual USB, con el único fin de evaluar tu candidatura, de acuerdo con los Términos y Condiciones de la feria."
  },
  COMMUNICATIONS: {
    titulo: "Comunicaciones de la CESEG",
    texto: "Acepto recibir información de la CESEG sobre futuros eventos académicos, profesionales, de emprendimiento o empleo. Puedo retirar esta autorización en cualquier momento escribiendo a ceseg@usb.ve."
  },
  BRAND_USE: {
    titulo: "Cláusula de autorización de uso de marca e imagen comercial",
    texto: [
      "Al marcar esta casilla, el Solicitante (Patrocinador) otorga a la Organización de la Feria una licencia y autorización de carácter no exclusivo, gratuito, mundial y limitado en el tiempo hasta la finalización de la edición actual del evento (incluyendo las memorias posteriores del mismo), para reproducir, exhibir y publicar su nombre comercial, marca registrada y logotipos en el sitio web oficial de la feria, redes sociales, folletos digitales y material publicitario impreso exclusivamente vinculado a la promoción y difusión del evento.",
      "La CESEG se compromete a respetar la integridad del logotipo provisto por el Patrocinador y a no modificar sus colores, proporciones o diseño sin consentimiento previo por escrito, alineándose en la medida de lo posible con el manual de identidad corporativa facilitado por el expositor. El Patrocinador garantiza que es el titular legítimo de los derechos sobre dicha marca o que cuenta con la facultad legal para otorgar esta autorización."
    ].join("\n\n")
  }
};

// Preguntas de subida de archivos: Apps Script no puede crearlas. Se agregan a
// mano en cada formulario con ESTOS títulos exactos (Feria_Emp/docs/formularios.md).
const ARCHIVOS = {
  perfil: [{ titulo: "Tu CV (PDF)", columna: "cv" }],
  empresa: [{ titulo: "Logotipo oficial", columna: "logo_oficial" }, { titulo: "Manual de marca", columna: "manual_marca" }],
  stand: [{ titulo: "Logo", columna: "logo" }, { titulo: "Banner", columna: "banner" },
    { titulo: "Galería (hasta 6 fotos)", columna: "galeria" }, { titulo: "Folleto (PDF)", columna: "folleto" }]
};

const URL_RE = "^https?://\\S+$";
const ESTATUS = ["Estudiante activo (pasantías)", "Último año (carga completa)", "Egresado / graduado"];
const RELACION_USB = ["Egresado o egresada de la USB", "Estudiante de la USB", "Egresado o estudiante de otra universidad", "Otra"];
const TAMANOS = ["1 a 10 personas", "11 a 50 personas", "51 a 200 personas", "Más de 200 personas"];

/**
 * Definición de los formularios. Cada pregunta con «columna» cae en esa
 * columna de su pestaña. Tipos: texto, parrafo, url, correo, opcion (radio),
 * lista (desplegable), casilla (obligatoria para aceptar), fecha, hora, seccion.
 */
function definicionFormularios_() {
  const uni = leerTabla_("Universidades").map((u) => u.nombre).filter(Boolean);
  const pabs = leerTabla_("Pabellones").map((p) => p.nombre);
  const planes = leerTabla_("Planes").map((p) => p.nombre + " (" + p.precio + " $, posiciones " + p.posicion_desde + "-" + p.posicion_hasta + ")");
  const legal = (clave, casilla) => [
    { seccion: TEXTOS[clave].titulo, ayuda: TEXTOS[clave].texto },
    { titulo: casilla, tipo: "casilla", requerida: true, opciones: ["Acepto"], columna: "_" + clave }
  ];
  return {
    perfil: {
      pestana: "Perfiles",
      titulo: "Perfil de postulante – Feria de Empleo CESEG USB",
      descripcion: "Se llena una sola vez. Con este perfil y tu CV puedes postular a las vacantes de la feria y de la Bolsa de Trabajo de la CESEG. " +
        "Pueden registrarse egresados y estudiantes de la USB y de otras universidades. Si vuelves a enviarlo, se actualiza tu perfil.",
      confirmacion: "Listo: tu perfil quedó guardado. Ya puedes postular desde los stands de la feria y la Bolsa de Trabajo.",
      preguntas: [
        { titulo: "Nombre", columna: "nombre", tipo: "texto", requerida: true },
        { titulo: "Apellido", columna: "apellido", tipo: "texto", requerida: true },
        { titulo: "Documento de identidad", columna: "documento", tipo: "texto", requerida: true, ayuda: "V-12345678, E-12345678 o número de pasaporte." },
        { titulo: "¿Cuál es tu relación con la USB?", columna: "relacion_usb", tipo: "opcion", requerida: true, opciones: RELACION_USB },
        { titulo: "Carnet USB", columna: "carnet", tipo: "texto", ayuda: "Solo si eres egresado o estudiante de la USB." },
        { titulo: "Universidad", columna: "universidad", tipo: "opcion", requerida: true, opciones: uni, otra: true },
        { titulo: "Carrera", columna: "carrera", tipo: "texto", requerida: true },
        { titulo: "Estatus académico", columna: "estatus", tipo: "opcion", requerida: true, opciones: ESTATUS },
        { titulo: "Ciudad donde vives", columna: "ciudad", tipo: "texto", requerida: true },
        { titulo: "País donde vives", columna: "pais", tipo: "texto", requerida: true },
        { titulo: "Idiomas y nivel", columna: "idiomas", tipo: "parrafo", ayuda: "Por ejemplo: Inglés avanzado, Portugués básico." },
        { titulo: "Habilidades", columna: "habilidades", tipo: "parrafo", ayuda: "Separadas por coma. Por ejemplo: Python, SQL, SAP." },
        { titulo: "Áreas de interés", columna: "intereses", tipo: "parrafo", ayuda: "Por ejemplo: Desarrollo, Datos, Auditoría, Planta." },
        { titulo: "LinkedIn", columna: "linkedin", tipo: "url" },
        { titulo: "Correo institucional", columna: "correo_institucional", tipo: "correo", ayuda: "Opcional." }
      ].concat(legal("ATTENDEE_TERMS", "Acepto los Términos y Condiciones y la Política de Privacidad"))
        .concat(legal("CV_SHARING", "Autorizo compartir mi CV con las empresas de la feria"))
        .concat([{ seccion: TEXTOS.COMMUNICATIONS.titulo },
          { titulo: TEXTOS.COMMUNICATIONS.texto, tipo: "casilla", opciones: ["Sí, acepto"], columna: "_COMMUNICATIONS" }])
    },
    postulacion: {
      pestana: "Postulaciones",
      titulo: "Postular o compartir mi CV – Feria de Empleo CESEG USB",
      descripcion: "Este formulario se abre desde la feria con la vacante o la empresa ya marcada. Usa tu perfil de postulante y tu CV: si aún no los tienes, llena primero el Perfil de postulante.",
      confirmacion: "Listo: la empresa recibirá tu perfil y tu CV.",
      preguntas: [
        { titulo: "Código de la vacante", columna: "vacante_id", tipo: "texto", ayuda: "Se llena solo desde la feria. Vacío = compartir tu CV con la empresa." },
        { titulo: "Código de la empresa", columna: "empresa_id", tipo: "texto", ayuda: "Se llena solo desde la feria." },
        { titulo: "Nota para la empresa", columna: "nota", tipo: "parrafo", ayuda: "Opcional." },
        { titulo: "Confirmación", tipo: "casilla", requerida: true, opciones: ["Confirmo que la empresa podrá ver mi perfil y mi CV"] }
      ]
    },
    empresa: {
      pestana: "Empresas",
      titulo: "Registro de empresa – Feria de Empleo CESEG USB",
      descripcion: "Solicitud para participar en la feria. La CESEG revisa cada solicitud, asigna el pabellón y la posición, y confirma el pago antes de habilitar el stand.",
      confirmacion: "Gracias. La CESEG revisará tu solicitud y te escribirá para coordinar el pago y la ubicación de tu stand.",
      preguntas: [
        { titulo: "Razón social", columna: "razon_social", tipo: "texto", requerida: true },
        { titulo: "Nombre comercial", columna: "nombre_comercial", tipo: "texto", requerida: true },
        { titulo: "RIF", columna: "rif", tipo: "texto", requerida: true, ayuda: "Por ejemplo: J-12345678-9." },
        { titulo: "Sector", columna: "sector", tipo: "opcion", requerida: true, opciones: pabs, otra: true },
        { titulo: "Tamaño de la empresa", columna: "tamano", tipo: "opcion", requerida: true, opciones: TAMANOS },
        { titulo: "Sitio web", columna: "web", tipo: "url" },
        { titulo: "Pabellón que prefieres", columna: "pabellon", tipo: "opcion", requerida: true, opciones: pabs },
        { titulo: "Plan que solicitas", columna: "plan", tipo: "opcion", requerida: true, opciones: planes,
          ayuda: "Platinum: vacantes sin límite, toda la base de CV, analítica completa y charla garantizada. Gold: hasta 10 vacantes y charla a solicitud. Silver: hasta 3 vacantes." },
        { titulo: "Persona de contacto", columna: "contacto_nombre", tipo: "texto", requerida: true },
        { titulo: "Cargo de la persona de contacto", columna: "contacto_cargo", tipo: "texto", requerida: true },
        { titulo: "Correos de los reclutadores", columna: "correos_reclutadores", tipo: "parrafo",
          ayuda: "Cuentas de Google de quienes verán los CV de la empresa, separadas por coma. Tu correo ya queda como dueño." },
        { seccion: "Empresas fundadas por egresados de la USB", ayuda: "Si la empresa la fundaron egresados de la USB, puede aparecer en el mapa «USBistas por el mundo» del sitio de la CESEG, después de la verificación." },
        { titulo: "¿La fundaron egresados de la USB?", columna: "fundada_por_egresados", tipo: "opcion", requerida: true, opciones: ["Sí", "No"] },
        { titulo: "Fundadores egresados de la USB", columna: "fundadores", tipo: "texto", ayuda: "Nombre y apellido, separados por coma." },
        { titulo: "Carreras de los fundadores en la USB", columna: "carreras_fundadores", tipo: "texto" },
        { titulo: "Ciudad de la sede principal", columna: "ciudad", tipo: "texto", requerida: true },
        { titulo: "País de la sede principal", columna: "pais", tipo: "texto", requerida: true }
      ].concat(legal("COMPANY_TERMS", "Acepto los Términos y Condiciones para empresas"))
        .concat(legal("BRAND_USE", "Autorizo el uso de marca e imagen comercial"))
    },
    stand: {
      pestana: "Stands",
      titulo: "Mi stand – Feria de Empleo CESEG USB",
      descripcion: "Contenido del stand de tu empresa. Llénalo con la cuenta de Google registrada como dueño o reclutador. Cada envío queda pendiente hasta que la CESEG lo aprueba; mientras tanto se sigue viendo la versión aprobada.",
      confirmacion: "Gracias. La CESEG revisará los cambios de tu stand antes de publicarlos.",
      preguntas: [
        { titulo: "Color de la marca", columna: "color", tipo: "texto", ayuda: "Código hexadecimal, por ejemplo #0055a5.", patron: "^#[0-9A-Fa-f]{6}$" },
        { titulo: "Descripción de la empresa", columna: "descripcion", tipo: "parrafo", requerida: true },
        { titulo: "Video (YouTube o Vimeo)", columna: "video", tipo: "url" },
        { titulo: "Sitio web", columna: "web", tipo: "url" },
        { titulo: "Instagram", columna: "instagram", tipo: "url" },
        { titulo: "LinkedIn", columna: "linkedin", tipo: "url" },
        { titulo: "Facebook", columna: "facebook", tipo: "url" },
        { titulo: "X (Twitter)", columna: "x", tipo: "url" },
        { titulo: "TikTok", columna: "tiktok", tipo: "url" },
        { titulo: "YouTube", columna: "youtube", tipo: "url" },
        { titulo: "Otras redes", columna: "otras_redes", tipo: "parrafo", ayuda: "Una dirección por línea." },
        { titulo: "WhatsApp", columna: "whatsapp", tipo: "texto", ayuda: "Con código de país, por ejemplo +58 412 0000000." },
        { titulo: "Mensaje inicial de WhatsApp", columna: "whatsapp_mensaje", tipo: "texto" },
        { titulo: "Sala de entrevistas (Meet, Zoom o Teams)", columna: "sala_entrevistas", tipo: "url" }
      ]
    },
    vacante: {
      pestana: "Vacantes",
      titulo: "Publicar una vacante – Feria de Empleo y Bolsa de Trabajo CESEG",
      descripcion: "Empresas de la feria y empresas o egresados que publican en la Bolsa de Trabajo. La CESEG revisa cada vacante antes de publicarla.",
      confirmacion: "Gracias. La CESEG revisará la vacante antes de publicarla.",
      preguntas: [
        { titulo: "Empresa o egresado que publica", columna: "empresa_nombre", tipo: "texto", requerida: true },
        { titulo: "Título de la vacante", columna: "titulo", tipo: "texto", requerida: true },
        { titulo: "Descripción", columna: "descripcion", tipo: "parrafo", requerida: true },
        { titulo: "Requisitos", columna: "requisitos", tipo: "parrafo" },
        { titulo: "Ubicación", columna: "ubicacion", tipo: "texto" },
        { titulo: "Modalidad", columna: "modalidad", tipo: "opcion", requerida: true, opciones: PESTANAS.Vacantes.listas.modalidad },
        { titulo: "Tipo de contrato", columna: "contrato", tipo: "opcion", requerida: true, opciones: PESTANAS.Vacantes.listas.contrato },
        { titulo: "Rango salarial", columna: "salario", tipo: "texto", ayuda: "Opcional." },
        { titulo: "Área o sector", columna: "sector", tipo: "texto" },
        { titulo: "Correo de contacto", columna: "correo_contacto", tipo: "correo", requerida: true },
        { titulo: "Enlace para postularse", columna: "enlace_postulacion", tipo: "url", ayuda: "Opcional. En la feria se postula con el perfil de postulante." }
      ]
    },
    charla: {
      pestana: "Charlas",
      titulo: "Solicitar una charla – Auditorio de la Feria de Empleo CESEG",
      descripcion: "Para empresas con plan Gold o Platinum. Charlas de 15 o 30 minutos, de lunes a viernes, de 9:00 a 16:00, hasta 3 por empresa. " +
        "Platinum: se confirma sola si el turno está libre. Gold: la confirma la CESEG.",
      confirmacion: "Gracias. Recibirás la confirmación de la charla por correo.",
      preguntas: [
        { titulo: "Título de la charla", columna: "titulo", tipo: "texto", requerida: true },
        { titulo: "Ponente", columna: "ponente", tipo: "texto", requerida: true },
        { titulo: "Fecha", columna: "fecha", tipo: "fecha", requerida: true },
        { titulo: "Hora de inicio", columna: "hora", tipo: "hora", requerida: true, ayuda: "En punto, :15, :30 o :45." },
        { titulo: "Duración (minutos)", columna: "duracion", tipo: "opcion", requerida: true, opciones: ["15", "30"] }
      ]
    }
  };
}

function crearFormulario_(def) {
  const form = FormApp.create(def.titulo);
  form.setDescription(def.descripcion);
  form.setConfirmationMessage(def.confirmacion);
  try { form.setRequireLogin(false); } catch (e) { /* solo en Workspace */ }
  // Correo verificado: identifica a la persona o empresa sin pedir el correo a mano.
  try { form.setEmailCollectionType(FormApp.EmailCollectionType.VERIFIED); } catch (e) { form.setCollectEmail(true); }
  def.preguntas.forEach((p) => {
    if (p.seccion) {
      const s = form.addSectionHeaderItem().setTitle(p.seccion);
      if (p.ayuda) s.setHelpText(p.ayuda);
      return;
    }
    let item;
    if (p.tipo === "parrafo") item = form.addParagraphTextItem();
    else if (p.tipo === "opcion") { item = form.addMultipleChoiceItem().setChoiceValues(p.opciones); if (p.otra) item.showOtherOption(true); }
    else if (p.tipo === "lista") item = form.addListItem().setChoiceValues(p.opciones);
    else if (p.tipo === "casilla") item = form.addCheckboxItem().setChoiceValues(p.opciones);
    else if (p.tipo === "fecha") item = form.addDateItem();
    else if (p.tipo === "hora") item = form.addTimeItem();
    else {
      item = form.addTextItem();
      if (p.tipo === "url") item.setValidation(FormApp.createTextValidation().requireTextIsUrl().build());
      if (p.tipo === "correo") item.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
      if (p.patron) item.setValidation(FormApp.createTextValidation().requireTextMatchesPattern(p.patron).build());
    }
    item.setTitle(p.titulo);
    if (p.ayuda) item.setHelpText(p.ayuda);
    if (p.requerida) item.setRequired(true);
  });
  return form;
}

/** Crea los formularios que falten, el disparador y los enlaces. Se puede repetir. */
function instalarFormularios() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const defs = definicionFormularios_();
  Object.keys(defs).forEach((clave) => {
    if (props.getProperty("form_" + clave)) return;
    const form = crearFormulario_(defs[clave]);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, libro.getId());
    props.setProperty("form_" + clave, form.getId());
    SpreadsheetApp.flush();
    renombrarRespuestas_(libro, form, "Respuestas – " + clave);
  });

  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === "alRecibirRespuesta")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("alRecibirRespuesta").forSpreadsheet(libro).onFormSubmit().create();

  guardarEnlaces_();
  publicar();
  verFormularios();
}

function renombrarRespuestas_(libro, form, nombre) {
  if (libro.getSheetByName(nombre)) return;
  libro.getSheets().forEach((h) => {
    const url = h.getFormUrl && h.getFormUrl();
    if (url && url.indexOf(form.getId()) !== -1) h.setName(nombre);
  });
}

/** Guarda en Configuración los enlaces públicos que usan los widgets. */
function guardarEnlaces_() {
  const props = PropertiesService.getScriptProperties();
  const abrir = (clave) => { const id = props.getProperty("form_" + clave); return id ? FormApp.openById(id) : null; };
  ["perfil", "empresa", "stand", "vacante", "charla"].forEach((clave) => {
    const f = abrir(clave);
    if (f) guardarConfig_("url_" + clave, f.getPublishedUrl());
  });
  // Postulación: enlace prellenado con marcadores {vacante} y {empresa} que el widget reemplaza.
  const f = abrir("postulacion");
  if (f) {
    const items = f.getItems();
    const buscar = (t) => items.filter((i) => i.getTitle() === t)[0].asTextItem();
    const url = f.createResponse()
      .withItemResponse(buscar("Código de la vacante").createResponse("VACANTEXYZ"))
      .withItemResponse(buscar("Código de la empresa").createResponse("EMPRESAXYZ"))
      .toPrefilledUrl();
    guardarConfig_("url_postular", url.replace("VACANTEXYZ", "{vacante}").replace("EMPRESAXYZ", "{empresa}"));
  }
}

function verFormularios() {
  const props = PropertiesService.getScriptProperties();
  const texto = Object.keys(definicionFormularios_()).map((clave) => {
    const id = props.getProperty("form_" + clave);
    if (!id) return clave + ": (sin crear)";
    const f = FormApp.openById(id);
    const faltan = (ARCHIVOS[clave] || []).filter((a) => !f.getItems().some((i) => i.getTitle() === a.titulo)).map((a) => "«" + a.titulo + "»");
    return f.getTitle() + "\n  " + f.getPublishedUrl() + "\n  Editar: " + f.getEditUrl() +
      (faltan.length ? "\n  FALTA agregar a mano la subida de archivos: " + faltan.join(", ") : "");
  }).join("\n\n");
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Formularios de la feria", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

// ---------------- respuestas ----------------

/** Disparador: cada respuesta se guarda en su pestaña, pendiente de la CESEG. */
function alRecibirRespuesta(e) {
  const hoja = e.range.getSheet();
  const url = hoja.getFormUrl ? hoja.getFormUrl() : "";
  const props = PropertiesService.getScriptProperties();
  const clave = Object.keys(definicionFormularios_()).filter((k) => {
    const id = props.getProperty("form_" + k);
    return id && url && url.indexOf(id) !== -1;
  })[0];
  if (!clave) return;
  const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  const val = e.range.getValues()[0];
  const respuesta = {};
  cab.forEach((c, i) => { respuesta[c] = val[i]; });
  procesarRespuesta_(clave, respuesta);
}

/** Lógica de cada formulario, separada del disparador para poder probarla. */
function procesarRespuesta_(clave, respuesta) {
  const defs = definicionFormularios_();
  const def = defs[clave];
  const correo = String(Object.keys(respuesta).filter((k) => /correo electr[oó]nico|email address/i.test(k)).map((k) => respuesta[k])[0] || "").trim().toLowerCase();
  const fecha = respuesta["Marca temporal"] || respuesta["Timestamp"] || new Date();
  const v = { fecha: fecha };
  def.preguntas.forEach((p) => {
    if (!p.columna || !(p.titulo in respuesta)) return;
    v[p.columna] = typeof respuesta[p.titulo] === "string" ? respuesta[p.titulo].trim() : respuesta[p.titulo];
  });
  (ARCHIVOS[clave] || []).forEach((a) => {
    if (respuesta[a.titulo]) v[a.columna] = String(respuesta[a.titulo]).split(/\s*,\s*/).filter(Boolean).join(" | ");
  });
  const acepta = (k) => (String(v["_" + k] || "") ? "Sí" : "No");
  const empresa = empresaDeCorreo_(correo);
  const id = (prefijo) => prefijo + "-" + Utilities.getUuid().slice(0, 8);

  if (clave === "perfil") {
    const guardado = guardarPorClave_("Perfiles", "correo", correo, {
      id: id("per"), correo: correo, nombre: v.nombre, apellido: v.apellido, documento: v.documento, relacion_usb: v.relacion_usb,
      carnet: v.carnet, universidad: v.universidad, carrera: v.carrera, estatus: v.estatus, ciudad: v.ciudad, pais: v.pais,
      idiomas: v.idiomas, habilidades: v.habilidades, intereses: v.intereses, linkedin: v.linkedin,
      correo_institucional: v.correo_institucional, cv: v.cv, cv_fecha: v.cv ? fecha : "",
      acepta_terminos: acepta("ATTENDEE_TERMS"), acepta_cv: acepta("CV_SHARING"), acepta_comunicaciones: acepta("COMMUNICATIONS"),
      version_textos: VERSION_TEXTOS, fecha: fecha
    }, ["id", "cv", "cv_fecha", "en_censo", "invitado_censo"]);
    conexiones_();
    return guardado;
  }

  if (clave === "postulacion") {
    const perfil = leerTabla_("Perfiles").filter((p) => String(p.correo).toLowerCase() === correo)[0];
    const vac = v.vacante_id ? leerTabla_("Vacantes").filter((x) => x.id === v.vacante_id)[0] : null;
    const notas = [];
    if (!perfil) notas.push("Sin perfil de postulante con este correo");
    if (v.vacante_id && !vac) notas.push("Código de vacante desconocido");
    return agregarFila_("Postulaciones", {
      id: id("pos"), fecha: fecha, tipo: v.vacante_id ? "Postulación" : "CV compartido", vacante_id: v.vacante_id,
      empresa_id: v.empresa_id || (vac ? vac.empresa_id : ""), perfil_correo: correo, nota: v.nota, estado: "Recibido",
      cv_copiado: "No", notas: notas.join(". ")
    });
  }

  if (clave === "empresa") {
    const plan = String(v.plan || "").split(" ")[0].toLowerCase();
    const pab = leerTabla_("Pabellones").filter((p) => p.nombre === v.pabellon)[0];
    const fila = {
      id: id("emp"), estado: "Pendiente", pago: "Pendiente", especial: "No", razon_social: v.razon_social,
      nombre_comercial: v.nombre_comercial, rif: v.rif, sector: v.sector, tamano: v.tamano, web: v.web,
      pabellon: pab ? pab.slug : "", plan: plan, contacto_nombre: v.contacto_nombre, contacto_cargo: v.contacto_cargo,
      correo_dueno: correo, correos_reclutadores: v.correos_reclutadores, fundada_por_egresados: v.fundada_por_egresados,
      fundadores: v.fundadores, carreras_fundadores: v.carreras_fundadores, ciudad: v.ciudad, pais: v.pais,
      logo_oficial: v.logo_oficial, manual_marca: v.manual_marca,
      acepta_terminos: acepta("COMPANY_TERMS"), acepta_marca: acepta("BRAND_USE"), version_textos: VERSION_TEXTOS, fecha_solicitud: fecha
    };
    // Un segundo envío del mismo dueño actualiza su solicitud sin tocar estado, pago ni ubicación.
    const r = guardarPorClave_("Empresas", "correo_dueno", correo, fila, ["id", "estado", "pago", "especial", "posicion", "pabellon", "plan", "motivo", "verificado_por", "notas", "enviada_mapa"]);
    if (v.fundada_por_egresados === "Sí") conexiones_();
    avisarCesta_("Solicitud de empresa: " + (v.nombre_comercial || v.razon_social), "Plan " + v.plan + ", pabellón " + v.pabellon + ". Correo: " + correo);
    return r;
  }

  if (clave === "stand") {
    const notas = empresa ? "" : "El correo " + correo + " no es dueño ni reclutador de ninguna empresa registrada";
    const r = agregarFila_("Stands", {
      empresa_id: empresa ? empresa.id : "", estado: "Borrador", color: v.color, logo: v.logo, banner: v.banner,
      descripcion: v.descripcion, video: v.video, web: v.web, instagram: v.instagram, linkedin: v.linkedin, facebook: v.facebook,
      x: v.x, tiktok: v.tiktok, youtube: v.youtube, otras_redes: v.otras_redes, whatsapp: v.whatsapp, whatsapp_mensaje: v.whatsapp_mensaje,
      galeria: v.galeria, folleto: v.folleto, sala_entrevistas: v.sala_entrevistas, notas: notas, fecha: fecha
    });
    avisarCesta_("Stand para revisar: " + (empresa ? (empresa.nombre_comercial || empresa.razon_social) : correo), notas || "Cambios pendientes de aprobación.");
    return r;
  }

  if (clave === "vacante") {
    const r = agregarFila_("Vacantes", {
      id: id("vac"), estado: "Borrador", origen: empresa ? "Feria" : "Bolsa", empresa_id: empresa ? empresa.id : "",
      empresa_nombre: v.empresa_nombre, titulo: v.titulo, descripcion: v.descripcion, requisitos: v.requisitos, ubicacion: v.ubicacion,
      modalidad: v.modalidad, contrato: v.contrato, salario: v.salario, sector: v.sector, correo_contacto: v.correo_contacto,
      enlace_postulacion: v.enlace_postulacion, fecha: fecha
    });
    avisarCesta_("Vacante para revisar: " + v.titulo, (empresa ? "Feria, " : "Bolsa, ") + v.empresa_nombre);
    return r;
  }

  if (clave === "charla") {
    const fila = { id: id("ch"), empresa_id: empresa ? empresa.id : "", titulo: v.titulo, ponente: v.ponente, fecha: v.fecha,
      hora: v.hora, duracion: Number(v.duracion) || 30, fecha_solicitud: fecha };
    const revision = revisarCharla_(fila, empresa);
    fila.estado = revision.aprobar ? "Aprobada" : "Solicitada";
    fila.verificado_por = revision.aprobar ? "Automático (Platinum, turno libre)" : "";
    fila.notas = revision.problemas.join(". ");
    const r = agregarFila_("Charlas", fila);
    if (revision.aprobar) publicar();
    avisarCesta_("Charla " + (revision.aprobar ? "confirmada" : "solicitada") + ": " + v.titulo, fila.notas || "Sin observaciones.");
    return r;
  }
}

/** Empresa cuyo dueño o reclutador tiene ese correo. */
function empresaDeCorreo_(correo) {
  if (!correo) return null;
  return leerTabla_("Empresas").filter((e) => String(e.correo_dueno).toLowerCase() === correo ||
    String(e.correos_reclutadores || "").toLowerCase().split(/[\s,;]+/).indexOf(correo) !== -1)[0] || null;
}

/**
 * Reglas de las charlas: plan Gold o Platinum, empresa aprobada y con pago,
 * lunes a viernes, de 9:00 a 16:00 en turnos de 15 min, 15 o 30 min, hasta 3
 * por empresa y sin chocar con otra charla aprobada o un bloqueo. Platinum sin
 * problemas se aprueba sola.
 */
function revisarCharla_(c, empresa) {
  const problemas = [];
  const cfg = {};
  leerTabla_("Configuracion").forEach((f) => { cfg[f.clave] = f.valor; });
  if (!empresa) return { aprobar: false, problemas: ["El correo no corresponde a ninguna empresa registrada"] };
  const plan = leerTabla_("Planes").filter((p) => p.id === empresa.plan)[0];
  if (!plan || plan.charlas === "No") problemas.push("El plan de la empresa no incluye charlas");
  if (empresa.estado !== "Aprobada" || (empresa.pago !== "Confirmado" && empresa.especial !== "Sí")) problemas.push("Empresa sin aprobar o sin pago confirmado");
  const inicio = inicioISO_(c.fecha, c.hora);
  if (!inicio) return { aprobar: false, problemas: problemas.concat(["Fecha u hora no válidas"]) };
  const ini = new Date(inicio);
  const dia = Number(Utilities.formatDate(ini, ZONA, "u"));
  if (dia > 5) problemas.push("Solo de lunes a viernes");
  const hm = Utilities.formatDate(ini, ZONA, "HH:mm");
  const minutos = (s) => { const p = String(s || "").split(":"); return Number(p[0]) * 60 + Number(p[1] || 0); };
  const desde = minutos(cfg.charlas_hora_inicio || "09:00"), hasta = minutos(cfg.charlas_hora_fin || "16:00");
  const m0 = minutos(hm), m1 = m0 + c.duracion;
  if (m0 < desde || m1 > hasta) problemas.push("Fuera del horario " + (cfg.charlas_hora_inicio || "09:00") + "-" + (cfg.charlas_hora_fin || "16:00"));
  if (m0 % 15 !== 0) problemas.push("La hora debe ser en punto, :15, :30 o :45");
  if ([15, 30].indexOf(c.duracion) === -1) problemas.push("Duración de 15 o 30 minutos");
  const charlas = leerTabla_("Charlas");
  const deEmpresa = charlas.filter((x) => x.empresa_id === empresa.id && x.estado !== "Rechazada").length;
  if (deEmpresa >= Number(cfg.charlas_max_por_empresa || 3)) problemas.push("La empresa ya tiene " + deEmpresa + " charlas");
  const choca = charlas.some((x) => {
    if (x.estado !== "Aprobada" && x.estado !== "Bloqueo") return false;
    const xi = inicioISO_(x.fecha, x.hora);
    if (!xi) return false;
    const a0 = new Date(xi).getTime(), a1 = a0 + (Number(x.duracion) || 30) * 60000;
    return ini.getTime() < a1 && a0 < ini.getTime() + c.duracion * 60000;
  });
  if (choca) problemas.push("El turno choca con otra charla o un bloqueo");
  return { aprobar: problemas.length === 0 && empresa.plan === "platinum", problemas: problemas };
}

function agregarFila_(nombre, valores) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  hoja.appendRow(cab.map((c) => (c in valores && valores[c] != null ? valores[c] : "")));
  return valores;
}

/** Actualiza la fila cuya `columna` vale `valor` (sin tocar `conservar`) o agrega una nueva. */
function guardarPorClave_(nombre, columna, valor, valores, conservar) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  const datos = hoja.getDataRange().getValues();
  const cab = datos[0].map(String);
  const i = cab.indexOf(columna);
  for (let r = 1; r < datos.length && valor; r++) {
    if (String(datos[r][i]).toLowerCase() !== String(valor).toLowerCase()) continue;
    const fila = cab.map((c, j) => {
      if (conservar.indexOf(c) !== -1 && datos[r][j] !== "" && !(c in valores && valores[c] && (c === "cv" || c === "cv_fecha"))) return datos[r][j];
      return c in valores && valores[c] != null && valores[c] !== "" ? valores[c] : datos[r][j];
    });
    hoja.getRange(r + 1, 1, 1, cab.length).setValues([fila]);
    return valores;
  }
  return agregarFila_(nombre, valores);
}

/** Aviso por correo a la CESEG (correo_admin de Configuración). */
function avisarCesta_(asunto, cuerpo) {
  const para = config_("correo_admin");
  if (!para) return;
  try {
    MailApp.sendEmail(para, "[Feria CESEG] " + asunto, cuerpo + "\n\nRevisar en: " + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  } catch (e) { /* sin cupo de correo: la fila igual queda guardada */ }
}

// =====================================================================
// FASE 4: CONEXIONES CON EL CENSO Y CON EL MAPA «USBistas por el mundo»
// =====================================================================

/**
 * Agrega a Configuración las claves nuevas que falten y rellena con su valor
 * inicial las que estén vacías. No cambia un valor que ya esté puesto.
 */
function asegurarConfig_() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Configuracion");
  const datos = hoja.getDataRange().getValues();
  const claves = datos.map((f) => f[0]);
  PESTANAS.Configuracion.inicial.forEach((f) => {
    const i = claves.indexOf(f[0]);
    if (i === -1) hoja.appendRow(f);
    else if (datos[i][1] === "" && f[1] !== "") hoja.getRange(i + 1, 2).setValue(f[1]);
  });
}

/** Menú «Conectar con el censo y el mapa»: prepara columnas y claves nuevas y cruza todo. */
function conectar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  ["Configuracion", "Empresas", "Perfiles"].forEach((n) => prepararPestana_(libro, n));
  asegurarConfig_();
  const avisos = conexiones_();
  const texto = avisos.length ? avisos.join("\n") : "Conexiones al día.";
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Feria CESEG", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

/** Cruce con el censo y envío al mapa. Devuelve avisos; nunca detiene a quien lo llama. */
function conexiones_() {
  const avisos = [];
  try { avisos.push.apply(avisos, cruzarCenso_()); } catch (e) { avisos.push("Censo: " + e.message); }
  try { avisos.push.apply(avisos, enviarAlMapa_()); } catch (e) { avisos.push("Mapa: " + e.message); }
  return avisos;
}

function normCarnet_(v) { return String(v || "").replace(/[^0-9a-z]/gi, "").toLowerCase(); }
function normCorreo_(v) { return String(v || "").trim().toLowerCase(); }

/**
 * Perfil ↔ censo, por carnet o por correo:
 *  - marca `en_censo` en cada perfil;
 *  - invita una sola vez a llenar el censo al egresado USB que no está;
 *  - escribe la pestaña «Perfiles de la feria» en el archivo del censo
 *    (carnet, correo, país y ciudad de los egresados USB). El script del
 *    censo la lee, descarta a quien ya está en el censo y suma el resto al globo.
 */
function cruzarCenso_() {
  const id = config_("id_censo");
  if (!id) return ["Falta id_censo en Configuración: no se cruzan los perfiles con el censo."];
  const censo = SpreadsheetApp.openById(id);
  const respuestas = censo.getSheets().filter((h) => h.getFormUrl && h.getFormUrl())[0] || censo.getSheets()[0];
  const datos = respuestas.getDataRange().getValues();
  const cab = datos[0].map((c) => String(c).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase());
  const iCarnet = cab.indexOf("carnet");
  const iCorreos = cab.map((c, i) => (/^indique un correo personal|direccion de correo electronico|email address/.test(c) ? i : -1)).filter((i) => i >= 0);
  const carnets = {}, correos = {};
  datos.slice(1).forEach((f) => {
    if (iCarnet >= 0 && normCarnet_(f[iCarnet])) carnets[normCarnet_(f[iCarnet])] = true;
    iCorreos.forEach((i) => { if (normCorreo_(f[i])) correos[normCorreo_(f[i])] = true; });
  });

  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.getSheetByName("Perfiles");
  const filas = leerTabla_("Perfiles");
  const cabP = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  const col = (c) => cabP.indexOf(c) + 1;
  const egresados = [];
  let invitados = 0;
  filas.forEach((p) => {
    const en = !!(carnets[normCarnet_(p.carnet)] || correos[normCorreo_(p.correo)] || correos[normCorreo_(p.correo_institucional)]);
    if (col("en_censo") && p.en_censo !== (en ? "Sí" : "No")) hoja.getRange(p._fila, col("en_censo")).setValue(en ? "Sí" : "No");
    if (p.relacion_usb !== RELACION_USB[0]) return;
    egresados.push([p.carnet, p.correo, p.pais, p.ciudad]);
    if (!en && !p.invitado_censo && p.correo && col("invitado_censo")) {
      if (invitarAlCenso_(p)) { hoja.getRange(p._fila, col("invitado_censo")).setValue(new Date()); invitados++; }
    }
  });

  let destino = censo.getSheetByName("Perfiles de la feria");
  if (!destino) destino = censo.insertSheet("Perfiles de la feria");
  destino.clearContents();
  const todo = [["carnet", "correo", "pais", "ciudad"]].concat(egresados);
  destino.getRange(1, 1, todo.length, 4).setValues(todo);
  return invitados ? [invitados + " invitación(es) al censo enviadas."] : [];
}

function invitarAlCenso_(p) {
  const url = config_("url_censo");
  if (!url) return false;
  try {
    MailApp.sendEmail(p.correo, "Censo de Egresados CESEG USB",
      "Hola " + (p.nombre || "") + ",\n\nGracias por registrarte en la Feria de Empleo de la USB. Como egresado o egresada de la USB, " +
      "te invitamos a llenar también el Censo de Egresados de la CESEG: así tu ciudad aparece en el mapa de egresados por el mundo y " +
      "podemos mantenerte informado.\n\n" + url + "\n\nCoordinación de Emprendimiento y Seguimiento de Egresados (CESEG)\nUniversidad Simón Bolívar");
    return true;
  } catch (e) { return false; }
}

/**
 * Empresas fundadas por egresados USB → pestaña Empresas de «Datos CESEG –
 * edición», como Borrador. La Coordinación la verifica y la publica en el mapa
 * con su flujo de siempre. Se envía una sola vez (`enviada_mapa`).
 */
function enviarAlMapa_() {
  const pendientes = leerTabla_("Empresas").filter((e) => e.fundada_por_egresados === "Sí" && !e.enviada_mapa && e.fundadores && e.demo !== "Sí");
  if (!pendientes.length) return [];
  const id = config_("id_datos_ceseg");
  if (!id) return ["Hay " + pendientes.length + " empresa(s) de egresados para el mapa, pero falta id_datos_ceseg en Configuración."];
  const mapa = SpreadsheetApp.openById(id).getSheetByName("Empresas");
  if (!mapa) return ["El archivo id_datos_ceseg no tiene la pestaña Empresas."];
  const cabM = mapa.getRange(1, 1, 1, mapa.getLastColumn()).getValues()[0].map(String);
  const stands = leerTabla_("Stands");
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Empresas");
  const cabE = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  pendientes.forEach((e) => {
    const stand = stands.filter((s) => s.empresa_id === e.id).pop() || {};
    const fila = {
      estado: "Borrador", empresa: e.nombre_comercial || e.razon_social, fundador: e.fundadores, carrera: e.carreras_fundadores,
      ciudad: e.ciudad, pais: e.pais, rubro: e.sector, descripcion: stand.descripcion || "", fuente: e.web || "",
      fuente_texto: "Registro en la Feria de Empleo CESEG",
      verificacion: "La empresa declaró en su registro de la Feria de Empleo que la fundaron egresados de la USB.",
      notas: "Desde la Feria de Empleo (" + e.id + "). Verificar con una fuente pública o con la CESEG antes de aprobar.",
      fecha_propuesta: new Date(), contacto_nombre: e.contacto_nombre, contacto_correo: e.correo_dueno
    };
    mapa.appendRow(cabM.map((c) => (c in fila && fila[c] != null ? fila[c] : "")));
    hoja.getRange(e._fila, cabE.indexOf("enviada_mapa") + 1).setValue(new Date());
  });
  return [pendientes.length + " empresa(s) de egresados enviada(s) al mapa como Borrador."];
}

// =====================================================================
// FASE 5: CHARLAS DEL AUDITORIO → GOOGLE CALENDAR «CESEG – Eventos»
// =====================================================================

const NOMBRE_CALENDARIO = "CESEG – Eventos";

/** Calendario de la CESEG: el de Configuración, o uno con ese nombre, o uno nuevo. */
function calendario_() {
  const id = config_("calendario_id");
  let cal = id ? CalendarApp.getCalendarById(id) : null;
  if (!cal) cal = CalendarApp.getCalendarsByName(NOMBRE_CALENDARIO)[0] || null;
  if (!cal) {
    cal = CalendarApp.createCalendar(NOMBRE_CALENDARIO, { timeZone: ZONA, summary: "Eventos de la Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG), USB" });
  }
  if (cal.getId() !== id) guardarConfig_("calendario_id", cal.getId());
  guardarConfig_("url_calendario", "https://calendar.google.com/calendar/embed?src=" + encodeURIComponent(cal.getId()) + "&ctz=" + encodeURIComponent(ZONA));
  return cal;
}

/**
 * Charlas → calendario. Aprobada: crea o actualiza su evento. Rechazada (o
 * vuelta a Solicitada): borra el evento si lo tenía. Avisa a la empresa una
 * vez cuando su charla se confirma o se rechaza.
 */
function sincronizarCalendario_() {
  // Columnas y claves nuevas de la fase 5 en una hoja ya instalada.
  prepararPestana_(SpreadsheetApp.getActiveSpreadsheet(), "Charlas");
  asegurarConfig_();
  // Las charlas de ejemplo no van al calendario real ni mandan correos.
  const charlas = leerTabla_("Charlas").filter((c) => c.id && c.demo !== "Sí");
  if (!charlas.length) return [];
  const cal = calendario_();
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Charlas");
  const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  const col = (c) => cab.indexOf(c) + 1;
  const empresas = {};
  leerTabla_("Empresas").forEach((e) => { empresas[e.id] = e; });
  const auditorio = config_("url_auditorio_sitio");
  const avisos = [];
  let creados = 0, cambiados = 0, borrados = 0;

  charlas.forEach((c) => {
    const emp = empresas[c.empresa_id];
    const nombre = emp ? (emp.nombre_comercial || emp.razon_social) : "CESEG";
    let evento = c.evento_calendario ? cal.getEventById(c.evento_calendario) : null;

    if (c.estado === "Aprobada") {
      const inicio = inicioISO_(c.fecha, c.hora);
      if (!inicio) { avisos.push("Charla «" + c.titulo + "»: falta la fecha o la hora para el calendario"); return; }
      const ini = new Date(inicio), fin = new Date(ini.getTime() + (Number(c.duracion) || 30) * 60000);
      const titulo = "Charla: " + c.titulo + " — " + nombre;
      const descripcion = [
        "Feria de Empleo CESEG USB · Auditorio virtual",
        c.ponente ? "Ponente: " + c.ponente : "",
        c.youtube ? "Transmisión: " + c.youtube : "El enlace de la transmisión se publicará en el auditorio.",
        auditorio ? "Auditorio: " + auditorio : ""
      ].filter(Boolean).join("\n");
      if (!evento) {
        evento = cal.createEvent(titulo, ini, fin, { description: descripcion, location: auditorio || "Auditorio virtual de la Feria de Empleo CESEG" });
        hoja.getRange(c._fila, col("evento_calendario")).setValue(evento.getId());
        creados++;
      } else if (evento.getTitle() !== titulo || evento.getDescription() !== descripcion ||
          evento.getStartTime().getTime() !== ini.getTime() || evento.getEndTime().getTime() !== fin.getTime()) {
        evento.setTitle(titulo);
        evento.setDescription(descripcion);
        evento.setTime(ini, fin);
        cambiados++;
      }
      if (c.notificada !== "Confirmada" && emp && emp.correo_dueno) {
        avisarEmpresa_(emp.correo_dueno, "Charla confirmada: " + c.titulo,
          "Tu charla «" + c.titulo + "» quedó confirmada en el auditorio de la Feria de Empleo CESEG, el " +
          Utilities.formatDate(ini, ZONA, "dd/MM/yyyy 'a las' HH:mm") + " (" + (Number(c.duracion) || 30) + " min)." +
          (auditorio ? "\n\nAuditorio: " + auditorio : ""));
        hoja.getRange(c._fila, col("notificada")).setValue("Confirmada");
      }
    } else {
      if (evento) { evento.deleteEvent(); borrados++; }
      if (c.evento_calendario) hoja.getRange(c._fila, col("evento_calendario")).setValue("");
      if (c.estado === "Rechazada" && c.notificada !== "Rechazada" && emp && emp.correo_dueno) {
        avisarEmpresa_(emp.correo_dueno, "Charla no confirmada: " + c.titulo,
          "La CESEG no pudo confirmar tu charla «" + c.titulo + "»." + (c.notas ? "\n\nMotivo: " + c.notas : "") +
          "\n\nPuedes solicitar otro turno con el formulario de charlas.");
        hoja.getRange(c._fila, col("notificada")).setValue("Rechazada");
      }
    }
  });
  if (creados || cambiados || borrados) avisos.push("Calendario: " + creados + " evento(s) nuevo(s), " + cambiados + " actualizado(s), " + borrados + " borrado(s).");
  return avisos;
}

function avisarEmpresa_(para, asunto, cuerpo) {
  try {
    MailApp.sendEmail(para, "[Feria de Empleo CESEG] " + asunto, cuerpo + "\n\nCoordinación de Emprendimiento y Seguimiento de Egresados (CESEG)\nUniversidad Simón Bolívar");
  } catch (e) { /* sin cupo: el estado queda igual en la hoja */ }
}

// =====================================================================
// FASE 7A: CV A LAS EMPRESAS Y PANEL DE CANDIDATOS
// =====================================================================

const ESTADOS_CANDIDATO = PESTANAS.Postulaciones.listas.estado;
const COLUMNAS_PANEL = ["id", "fecha", "tipo", "vacante", "nombre", "apellido", "correo", "universidad", "carrera", "estatus",
  "ciudad", "pais", "idiomas", "habilidades", "linkedin", "cv", "estado", "notas"];
const COLUMNAS_BASE = ["nombre", "apellido", "correo", "universidad", "carrera", "estatus", "ciudad", "pais",
  "idiomas", "habilidades", "intereses", "linkedin", "cv"];

/** Menú «Activar tareas automáticas»: entrega de CV, paneles y cierre, cada hora. */
function activarAutomatico() {
  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === "sincronizarEmpresas")
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("sincronizarEmpresas").timeBased().everyHours(1).create();
  sincronizarEmpresas();
}

/**
 * Cada hora (o con el menú): a cada empresa aprobada y con pago confirmado le
 * crea su carpeta privada de CV y su panel de candidatos, los comparte con su
 * dueño y sus reclutadores, copia los CV que le corresponden según su plan y
 * trae de vuelta los cambios de estado que haga en su panel. Lo mismo con los
 * contactos de las vacantes de la Bolsa. Al terminar el periodo de consulta,
 * retira los accesos (fase 7C).
 */
function sincronizarEmpresas() {
  const candado = LockService.getScriptLock();
  candado.waitLock(30000);
  const resumen = [];
  try {
    const libro = SpreadsheetApp.getActiveSpreadsheet();
    ["Empresas", "Postulaciones", "CV_Entregados"].forEach((n) => prepararPestana_(libro, n));
    if (estadoEdicion_() === "Cerrada") {
      resumen.push.apply(resumen, retirarAccesos_());
    } else {
      resumen.push.apply(resumen, entregarATodos_());
    }
  } finally {
    candado.releaseLock();
  }
  const texto = resumen.length ? resumen.join("\n") : "Todo al día.";
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert("Feria CESEG", texto, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) {}
}

function correosDe_(e) {
  return [e.correo_dueno].concat(String(e.correos_reclutadores || "").split(/[\s,;]+/))
    .map(normCorreo_).filter((c) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c))
    .filter((c, i, a) => a.indexOf(c) === i);
}

// Registro de copias leído una sola vez por pasada (se reinicia en cada entrega).
let registroCv_ = null;

function entregarATodos_() {
  const resumen = [];
  registroCv_ = null;
  eventos_ = null;
  const raiz = DriveApp.getFolderById(config_("id_carpeta"));
  const perfiles = {};
  leerTabla_("Perfiles").forEach((p) => { perfiles[normCorreo_(p.correo)] = p; });
  const conCv = (correo) => { const p = perfiles[normCorreo_(correo)]; return p && p.acepta_cv === "Sí" && idDrive_(p.cv) ? p : null; };
  const vacantes = {};
  leerTabla_("Vacantes").forEach((v) => { vacantes[v.id] = v; });
  const postulaciones = leerTabla_("Postulaciones");
  const planes = {};
  leerTabla_("Planes").forEach((p) => { planes[p.id] = p; });

  // Destinos: empresas habilitadas y contactos de vacantes de la Bolsa.
  const destinos = [];
  leerTabla_("Empresas").forEach((e) => {
    if (!e.id || e.demo === "Sí" || e.estado !== "Aprobada" || (e.pago !== "Confirmado" && e.especial !== "Sí")) return;
    destinos.push({ tipo: "empresa", clave: e.id, nombre: e.nombre_comercial || e.razon_social, correos: correosDe_(e), plan: e.plan, fila: e,
      postulaciones: postulaciones.filter((p) => p.empresa_id === e.id || (vacantes[p.vacante_id] && vacantes[p.vacante_id].empresa_id === e.id)) });
  });
  const bolsa = {};
  postulaciones.forEach((p) => {
    const v = vacantes[p.vacante_id];
    if (!v || v.origen !== "Bolsa" || !v.correo_contacto) return;
    const c = normCorreo_(v.correo_contacto);
    (bolsa[c] = bolsa[c] || { tipo: "bolsa", clave: "bolsa:" + c, nombre: v.empresa_nombre || c, correos: [c], plan: "bolsa", postulaciones: [] }).postulaciones.push(p);
  });
  Object.keys(bolsa).forEach((c) => destinos.push(bolsa[c]));

  let copias = 0, cambios = 0;
  destinos.forEach((d) => {
    const acceso = accesoDe_(d, raiz);
    // CV de quienes se postularon o compartieron su CV con este destino.
    const filas = d.postulaciones.map((p) => {
      const perfil = conCv(p.perfil_correo);
      let cv = "";
      if (perfil) {
        const r = entregarCV_(d.clave, perfil, acceso.carpeta);
        cv = r.url; if (r.nueva) copias++;
        if (p.cv_copiado !== "Sí") marcarPostulacion_(p, { cv_copiado: "Sí" });
      }
      const pf = perfil || perfiles[normCorreo_(p.perfil_correo)] || {};
      const v = vacantes[p.vacante_id];
      return { id: p.id, fecha: p.fecha, tipo: p.tipo, vacante: v ? v.titulo : "", nombre: pf.nombre, apellido: pf.apellido, correo: p.perfil_correo,
        universidad: pf.universidad, carrera: pf.carrera, estatus: pf.estatus, ciudad: pf.ciudad, pais: pf.pais, idiomas: pf.idiomas,
        habilidades: pf.habilidades, linkedin: pf.linkedin, cv: cv || (perfil ? "" : "Sin CV autorizado"), estado: p.estado, _postulacion: p, _vacante: v };
    });
    cambios += escribirPanel_(acceso.panel, filas, d);
    if (d.tipo === "empresa" && typeof escribirMetricas_ === "function") escribirMetricas_(acceso.panel, d, planes[d.plan]);
  });

  // Platinum: toda la base que autorizó compartir su CV, en una carpeta común.
  const platinum = destinos.filter((d) => d.plan === "platinum");
  if (platinum.length) {
    const base = baseDeCv_(raiz, platinum);
    const filas = Object.keys(perfiles).map((c) => conCv(c)).filter(Boolean).map((p) => {
      const r = entregarCV_("base-platinum", p, base);
      if (r.nueva) copias++;
      return { nombre: p.nombre, apellido: p.apellido, correo: p.correo, universidad: p.universidad, carrera: p.carrera, estatus: p.estatus,
        ciudad: p.ciudad, pais: p.pais, idiomas: p.idiomas, habilidades: p.habilidades, intereses: p.intereses, linkedin: p.linkedin, cv: r.url };
    });
    platinum.forEach((d) => escribirTabla_(SpreadsheetApp.openById(accesoDe_(d, raiz).panelId), "Base de CV", COLUMNAS_BASE, filas));
  }
  try { escribirAnaliticaCeseg_(); } catch (e) { resumen.push("Analítica: " + e.message); }
  resumen.push(destinos.length + " destino(s) al día: " + copias + " CV copiado(s), " + cambios + " cambio(s) de estado traído(s) de los paneles.");
  return resumen;
}

/**
 * Carpeta privada y panel de un destino: los crea la primera vez, los comparte
 * con los correos que falten y les manda un aviso con los enlaces.
 */
function accesoDe_(d, raiz) {
  if (d._acceso) return d._acceso;
  const guardado = d.tipo === "empresa"
    ? { carpeta: d.fila.carpeta_cv, panel: d.fila.panel, compartido: String(d.fila.compartido_con || "") }
    : JSON.parse(PropertiesService.getScriptProperties().getProperty(d.clave) || "{}");
  let carpeta = guardado.carpeta ? DriveApp.getFolderById(guardado.carpeta) : null;
  if (!carpeta) carpeta = raiz.createFolder("CV – " + d.nombre + " (privado)");
  let panelId = guardado.panel;
  if (!panelId) {
    const ss = SpreadsheetApp.create("Panel de candidatos – " + d.nombre);
    panelId = ss.getId();
    DriveApp.getFileById(panelId).moveTo(carpeta);
    ss.getSheets()[0].setName("Candidatos");
  }
  const ya = String(guardado.compartido || "").split(/\s*,\s*/).filter(Boolean);
  const nuevos = d.correos.filter((c) => ya.indexOf(c) === -1);
  if (nuevos.length) {
    nuevos.forEach((c) => {
      try { carpeta.addViewer(c); } catch (e) { /* correo sin cuenta de Google */ }
      try { DriveApp.getFileById(panelId).addEditor(c); } catch (e) {}
    });
    avisarEmpresa_(nuevos.join(","), "Tu carpeta de CV y tu panel de candidatos",
      "Ya puedes ver los CV de quienes se postulan" + (d.tipo === "empresa" ? " a " + d.nombre : " a tus vacantes de la Bolsa de Trabajo CESEG") + ".\n\n" +
      "Carpeta de CV (privada): " + carpeta.getUrl() + "\nPanel de candidatos: https://docs.google.com/spreadsheets/d/" + panelId + "/edit\n\n" +
      "En el panel puedes cambiar el estado de cada candidato (Recibido, En revisión, Entrevista, Descartado); el postulante recibe un aviso. " +
      "Los datos son confidenciales y solo pueden usarse para reclutamiento, según los Términos y Condiciones para empresas.");
  }
  const compartido = ya.concat(nuevos).join(", ");
  if (d.tipo === "empresa") {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Empresas");
    const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
    hoja.getRange(d.fila._fila, cab.indexOf("carpeta_cv") + 1).setValue(carpeta.getId());
    hoja.getRange(d.fila._fila, cab.indexOf("panel") + 1).setValue(panelId);
    hoja.getRange(d.fila._fila, cab.indexOf("compartido_con") + 1).setValue(compartido);
  } else {
    PropertiesService.getScriptProperties().setProperty(d.clave, JSON.stringify({ carpeta: carpeta.getId(), panel: panelId, compartido: compartido }));
  }
  d._acceso = { carpeta: carpeta, panel: SpreadsheetApp.openById(panelId), panelId: panelId };
  return d._acceso;
}

/** Carpeta común de la base de CV para las empresas Platinum. */
function baseDeCv_(raiz, platinum) {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("base_platinum");
  let carpeta = id ? DriveApp.getFolderById(id) : null;
  if (!carpeta) { carpeta = raiz.createFolder("Base de CV – Platinum (privado)"); props.setProperty("base_platinum", carpeta.getId()); }
  const ya = String(props.getProperty("base_platinum_compartido") || "").split(/\s*,\s*/).filter(Boolean);
  const todos = [];
  platinum.forEach((d) => d.correos.forEach((c) => { if (todos.indexOf(c) === -1) todos.push(c); }));
  todos.filter((c) => ya.indexOf(c) === -1).forEach((c) => { try { carpeta.addViewer(c); } catch (e) {} ya.push(c); });
  props.setProperty("base_platinum_compartido", ya.join(", "));
  return carpeta;
}

/** Copia el CV del perfil a la carpeta del destino (una vez; si el CV cambió, reemplaza la copia). */
function entregarCV_(destino, perfil, carpeta) {
  const origen = idDrive_(String(perfil.cv).split(/\s*\|\s*/)[0]);
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CV_Entregados");
  if (!registroCv_) {
    registroCv_ = {};
    leerTabla_("CV_Entregados").forEach((f) => { registroCv_[f.destino + "|" + normCorreo_(f.perfil_correo)] = f; });
  }
  const clave = destino + "|" + normCorreo_(perfil.correo);
  const previa = registroCv_[clave];
  if (previa && previa.cv_origen === origen) return { url: "https://drive.google.com/file/d/" + previa.copia + "/view", nueva: false };
  const nombre = [perfil.documento, perfil.apellido, perfil.nombre].filter(Boolean).join("-").replace(/[^\w\-áéíóúñÁÉÍÓÚÑ]+/g, "_") + ".pdf";
  const copia = DriveApp.getFileById(origen).makeCopy(nombre, carpeta);
  if (previa) {
    try { DriveApp.getFileById(previa.copia).setTrashed(true); } catch (e) {}
    hoja.getRange(previa._fila, 3, 1, 3).setValues([[origen, copia.getId(), new Date()]]);
    previa.cv_origen = origen; previa.copia = copia.getId();
  } else {
    hoja.appendRow([destino, perfil.correo, origen, copia.getId(), new Date()]);
    registroCv_[clave] = { destino: destino, perfil_correo: perfil.correo, cv_origen: origen, copia: copia.getId(), _fila: hoja.getLastRow() };
  }
  return { url: "https://drive.google.com/file/d/" + copia.getId() + "/view", nueva: true };
}

function marcarPostulacion_(p, valores) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Postulaciones");
  const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  Object.keys(valores).forEach((c) => { if (cab.indexOf(c) !== -1) hoja.getRange(p._fila, cab.indexOf(c) + 1).setValue(valores[c]); });
}

/**
 * Escribe la pestaña «Candidatos» del panel conservando el estado y las notas
 * que puso la empresa, y trae de vuelta los cambios de estado: actualiza la
 * postulación y avisa al postulante. Devuelve cuántos estados cambiaron.
 */
function escribirPanel_(panel, filas, d) {
  let hoja = panel.getSheetByName("Candidatos");
  if (!hoja) hoja = panel.insertSheet("Candidatos");
  const previos = {};
  if (hoja.getLastRow() > 1) {
    const datos = hoja.getDataRange().getValues();
    const cab = datos[0].map(String);
    datos.slice(1).forEach((f) => { previos[f[cab.indexOf("id")]] = { estado: f[cab.indexOf("estado")], notas: f[cab.indexOf("notas")] }; });
  }
  let cambios = 0;
  filas.forEach((f) => {
    const previo = previos[f.id];
    if (previo) f.notas = previo.notas;
    if (previo && previo.estado && ESTADOS_CANDIDATO.indexOf(previo.estado) !== -1 && previo.estado !== f._postulacion.estado) {
      marcarPostulacion_(f._postulacion, { estado: previo.estado });
      avisarPostulante_(f.correo, f.nombre, f._vacante, d.nombre, previo.estado);
      f.estado = previo.estado;
      cambios++;
    }
  });
  hoja.clear();
  const todo = [COLUMNAS_PANEL].concat(filas.map((f) => COLUMNAS_PANEL.map((c) => (f[c] == null ? "" : f[c]))));
  hoja.getRange(1, 1, todo.length, COLUMNAS_PANEL.length).setValues(todo);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, COLUMNAS_PANEL.length).setFontWeight("bold").setBackground("#dbe7f5");
  if (todo.length > 1) {
    const regla = SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS_CANDIDATO, true).setAllowInvalid(false).build();
    hoja.getRange(2, COLUMNAS_PANEL.indexOf("estado") + 1, todo.length - 1, 1).setDataValidation(regla);
  }
  return cambios;
}

function avisarPostulante_(correo, nombre, vacante, empresa, estado) {
  if (!correo) return;
  const que = vacante ? "tu postulación a «" + vacante.titulo + "»" : "tu CV compartido";
  try {
    MailApp.sendEmail(correo, "Feria de Empleo CESEG: " + empresa + " actualizó " + que,
      "Hola " + (nombre || "") + ",\n\n" + empresa + " cambió el estado de " + que + " a: " + estado + ".\n\n" +
      "Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG)\nUniversidad Simón Bolívar");
  } catch (e) {}
}

// =====================================================================
// FASE 7C: CIERRE DE LA EDICIÓN Y RETIRO DE ACCESOS
// =====================================================================

/**
 * Estado de la edición según las fechas de Configuración (vacías = por definir):
 * Preparación, Convocatoria, Feria, Consulta (hasta consulta_dias después) o Cerrada.
 */
function estadoEdicion_(ahora) {
  const cfg = {};
  leerTabla_("Configuracion").forEach((f) => { cfg[f.clave] = f.valor; });
  const fecha = (v, finDelDia) => {
    if (!v) return null;
    const d = v instanceof Date ? new Date(v) : new Date(String(v) + "T00:00:00-04:00");
    if (isNaN(d)) return null;
    if (finDelDia) d.setTime(d.getTime() + 86400000 - 1);
    return d;
  };
  const t = ahora || new Date();
  const ci = fecha(cfg.convocatoria_inicio), fi = fecha(cfg.feria_inicio), ff = fecha(cfg.feria_fin, true);
  const dias = Number(cfg.consulta_dias) || 15;
  if (ff && t > new Date(ff.getTime() + dias * 86400000)) return "Cerrada";
  if (ff && t > ff) return "Consulta";
  if (fi && t >= fi) return "Feria";
  if (ci && t >= ci) return "Convocatoria";
  return "Preparación";
}

/** Al cerrar la edición: quita a las empresas el acceso a sus carpetas, paneles y a la base Platinum. */
function retirarAccesos_() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Empresas");
  const cab = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
  let retirados = 0;
  const quitar = (carpetaId, panelId, correos) => {
    correos.forEach((c) => {
      try { if (carpetaId) DriveApp.getFolderById(carpetaId).removeViewer(c); } catch (e) {}
      try { if (panelId) DriveApp.getFileById(panelId).removeEditor(c); } catch (e) {}
    });
  };
  leerTabla_("Empresas").forEach((e) => {
    if (e.acceso_retirado || !e.compartido_con) return;
    quitar(e.carpeta_cv, e.panel, String(e.compartido_con).split(/\s*,\s*/).filter(Boolean));
    hoja.getRange(e._fila, cab.indexOf("acceso_retirado") + 1).setValue(new Date());
    retirados++;
  });
  const props = PropertiesService.getScriptProperties();
  props.getKeys().filter((k) => k.indexOf("bolsa:") === 0).forEach((k) => {
    const g = JSON.parse(props.getProperty(k) || "{}");
    if (g.retirado) return;
    quitar(g.carpeta, g.panel, String(g.compartido || "").split(/\s*,\s*/).filter(Boolean));
    g.retirado = new Date().toISOString();
    props.setProperty(k, JSON.stringify(g));
    retirados++;
  });
  if (props.getProperty("base_platinum") && props.getProperty("base_platinum_compartido")) {
    quitar(props.getProperty("base_platinum"), null, props.getProperty("base_platinum_compartido").split(/\s*,\s*/).filter(Boolean));
    props.deleteProperty("base_platinum_compartido");
  }
  return retirados ? ["Edición cerrada: se retiró el acceso de " + retirados + " empresa(s) o contacto(s). Los datos quedan bajo resguardo de la CESEG."] : ["Edición cerrada."];
}

// =====================================================================
// FASE 7B: ANALÍTICA POR PLAN
// =====================================================================

// Eventos que pueden mandar los widgets. No llevan datos personales: solo un
// identificador anónimo del visitante, generado en su navegador.
const TIPOS_EVENTO = ["feria_vista", "pabellon_vista", "stand_vista", "clic_web", "clic_whatsapp", "clic_red", "clic_video",
  "clic_folleto", "clic_sala", "clic_postular", "clic_cv", "auditorio_vista", "charla_vista", "bolsa_vista"];

/**
 * Receptor de visitas. Se publica con Implementar › Nueva implementación ›
 * Aplicación web (Ejecutar como: yo; Quién tiene acceso: cualquier persona).
 * Recibe un lote de eventos en JSON: [{ t: tipo, e: empresa_id, v: vacante_id, u: visitante, d: detalle }].
 */
function doPost(e) {
  try {
    const lote = JSON.parse(e && e.postData ? e.postData.contents : "[]");
    guardarEventos_(Array.isArray(lote) ? lote : []);
  } catch (err) { /* un lote mal formado se descarta */ }
  return ContentService.createTextOutput("ok");
}

function doGet() {
  return ContentService.createTextOutput("Receptor de visitas de la Feria de Empleo CESEG.");
}

function guardarEventos_(lote) {
  const limpio = (v, n) => String(v == null ? "" : v).replace(/[\r\n\t]/g, " ").slice(0, n);
  const filas = lote.slice(0, 50).filter((x) => x && TIPOS_EVENTO.indexOf(x.t) !== -1).map((x) =>
    [new Date(), x.t, limpio(x.e, 40), limpio(x.v, 40), limpio(x.u, 40), limpio(x.d, 80)]);
  if (!filas.length) return 0;
  const candado = LockService.getScriptLock();
  candado.waitLock(20000);
  try {
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Eventos");
    hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, 6).setValues(filas);
  } finally {
    candado.releaseLock();
  }
  return filas.length;
}

// Eventos agregados una sola vez por pasada.
let eventos_ = null;

function eventosAgregados_() {
  if (eventos_) return eventos_;
  const porEmpresa = {};
  leerTabla_("Eventos").forEach((f) => {
    if (!f.empresa_id) return;
    const m = porEmpresa[f.empresa_id] = porEmpresa[f.empresa_id] || { visitas: 0, unicos: {}, clics: 0, porTipo: {}, porDia: {} };
    if (f.tipo === "stand_vista") {
      m.visitas++;
      if (f.visitante) m.unicos[f.visitante] = true;
      const dia = f.fecha instanceof Date ? Utilities.formatDate(f.fecha, ZONA, "yyyy-MM-dd") : String(f.fecha).slice(0, 10);
      m.porDia[dia] = (m.porDia[dia] || 0) + 1;
    } else if (f.tipo.indexOf("clic_") === 0) {
      m.clics++;
      m.porTipo[f.tipo] = (m.porTipo[f.tipo] || 0) + 1;
    }
  });
  eventos_ = porEmpresa;
  return eventos_;
}

const NOMBRES_CLIC = { clic_web: "Sitio web", clic_whatsapp: "WhatsApp", clic_red: "Redes sociales", clic_video: "Video",
  clic_folleto: "Folleto", clic_sala: "Sala de entrevistas", clic_postular: "Postular", clic_cv: "Compartir mi CV" };

/** Pestaña «Métricas» del panel de una empresa, según su plan (básica o completa). */
function escribirMetricas_(panel, d, plan) {
  const m = eventosAgregados_()[d.clave] || { visitas: 0, unicos: {}, clics: 0, porTipo: {}, porDia: {} };
  const posts = d.postulaciones;
  const completa = plan && plan.analitica === "Completa";
  const filas = [
    ["Métrica", "Valor"],
    ["Visitas al stand", m.visitas],
    ["Visitantes únicos", Object.keys(m.unicos).length],
    ["Clics en el stand", m.clics],
    ["Postulaciones", posts.filter((p) => p.tipo === "Postulación").length],
    ["CV compartidos", posts.filter((p) => p.tipo === "CV compartido").length]
  ];
  if (completa) {
    filas.push(["", ""], ["Clics por tipo", ""]);
    Object.keys(NOMBRES_CLIC).forEach((k) => filas.push(["  " + NOMBRES_CLIC[k], m.porTipo[k] || 0]));
    filas.push(["", ""], ["Postulaciones por vacante", ""]);
    const porVac = {};
    const vacantes = {};
    leerTabla_("Vacantes").forEach((v) => { vacantes[v.id] = v.titulo; });
    posts.filter((p) => p.vacante_id).forEach((p) => { porVac[p.vacante_id] = (porVac[p.vacante_id] || 0) + 1; });
    Object.keys(porVac).forEach((id) => filas.push(["  " + (vacantes[id] || id), porVac[id]]));
    filas.push(["", ""], ["Puesto en su pabellón por visitas", puestoEnPabellon_(d)]);
    filas.push(["", ""], ["Visitas por día", ""]);
    Object.keys(m.porDia).sort().forEach((dia) => filas.push(["  " + dia, m.porDia[dia]]));
  }
  filas.push(["", ""], ["Análisis " + (completa ? "completo" : "básico") + " (plan " + (plan ? plan.nombre : "") + ")",
    "Actualizado: " + Utilities.formatDate(new Date(), ZONA, "dd/MM/yyyy HH:mm") + ". Para CSV: Archivo › Descargar."]);
  escribirTabla_(panel, "Métricas", ["metrica", "valor"], filas.slice(1).map((f) => ({ metrica: f[0], valor: f[1] })));
}

function puestoEnPabellon_(d) {
  const ev = eventosAgregados_();
  const mismas = leerTabla_("Empresas").filter((e) => e.pabellon === d.fila.pabellon && e.estado === "Aprobada");
  const orden = mismas.map((e) => ({ id: e.id, v: (ev[e.id] || { visitas: 0 }).visitas })).sort((a, b) => b.v - a.v);
  const i = orden.findIndex((x) => x.id === d.clave);
  return i === -1 ? "" : (i + 1) + " de " + orden.length;
}

/** Pestaña «Analítica» del archivo de edición: todas las empresas, ordenadas por visitas. */
function escribirAnaliticaCeseg_() {
  const ev = eventosAgregados_();
  const posts = leerTabla_("Postulaciones");
  const filas = leerTabla_("Empresas").filter((e) => e.id && e.estado === "Aprobada").map((e) => {
    const m = ev[e.id] || { visitas: 0, unicos: {}, clics: 0 };
    const p = posts.filter((x) => x.empresa_id === e.id);
    return { empresa: e.nombre_comercial || e.razon_social, plan: e.plan, pabellon: e.pabellon, visitas: m.visitas,
      unicos: Object.keys(m.unicos).length, clics: m.clics, postulaciones: p.filter((x) => x.tipo === "Postulación").length,
      cv_compartidos: p.filter((x) => x.tipo === "CV compartido").length };
  }).sort((a, b) => b.visitas - a.visitas);
  const totales = {};
  leerTabla_("Eventos").forEach((f) => { totales[f.tipo] = (totales[f.tipo] || 0) + 1; });
  filas.push({}, { empresa: "Totales de la feria", plan: "", pabellon: "", visitas: totales.stand_vista || 0, unicos: "",
    clics: Object.keys(totales).filter((k) => k.indexOf("clic_") === 0).reduce((s, k) => s + totales[k], 0),
    postulaciones: posts.filter((x) => x.tipo === "Postulación").length, cv_compartidos: posts.filter((x) => x.tipo === "CV compartido").length });
  filas.push({ empresa: "Visitas a la feria (pabellones)", visitas: totales.pabellon_vista || 0 },
    { empresa: "Visitas al auditorio", visitas: totales.auditorio_vista || 0 }, { empresa: "Visitas a la Bolsa", visitas: totales.bolsa_vista || 0 });
  escribirTabla_(SpreadsheetApp.getActiveSpreadsheet(), "Analítica", ["empresa", "plan", "pabellon", "visitas", "unicos", "clics", "postulaciones", "cv_compartidos"], filas);
}
