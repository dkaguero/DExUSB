#!/usr/bin/env node
// Genera las páginas de la CESEG (ceseg*.html, calendarioCeseg.html y
// feriaVirtual.html) a partir de tools/plantilla/ceseg-original.html, la
// página única de la CESEG antes de dividirla (commit 51196f2). De ella se
// toman la cabecera, la columna derecha, el pie y los textos originales.
//
// Uso:  node tools/generar-paginas-ceseg.js
// Después de cambiar este archivo: regenerar, revisar el diff y, si cambian
// los bloques que usan los widgets, node tools/build-google-sites.js.
"use strict";
const fs = require("fs");
const path = require("path");

const repo = path.resolve(__dirname, "..");
const orig = fs.readFileSync(path.join(__dirname, "plantilla", "ceseg-original.html"), "utf8").split(/\r?\n/);
const L = (a, b) => orig.slice(a - 1, b).join("\n"); // líneas a..b, 1-indexadas

const cabeceraHead = L(1, 10);             // doctype .. favicon
const hojas = L(14, 17);                   // CSS del Decanato
const antesMenu = L(450, 468);             // logo, botón del menú en el teléfono
const redes = L(483, 489);                 // separador y redes sociales del Decanato
const despuesMenu = L(490, 495);           // cierre del menú, comentario del centro
const cuerpoFin = L(692, 749);             // columna derecha y pie

// Menú lateral de las páginas de la CESEG, con el mismo formato que el del
// Decanato: primero «Volver al DEx», luego las secciones y el tema oscuro.
function menuLateral(actual) {
  const item = (archivo, nombre) =>
    '              <li role="presentation"><a href="' + archivo + '"' +
    (archivo === actual ? ' aria-current="page"' : "") + ">" + nombre + "</a></li>";
  return [
    '            <ul class="nav nav-stacked ceseg-menu" align="right" aria-label="Secciones de la CESEG">',
    item("index.html", "Volver al DEx"),
    '              <li role="separator" class="divider"></li>',
    SECCIONES.map(([archivo, nombre]) => item(archivo, nombre) +
      (archivo === "cesegEgresados.html"
        ? '\n              <li role="presentation"><a href="' + CENSO + '" class="ceseg-menu-censo" target="_blank" rel="noopener">Censo de egresados</a></li>'
        : "")).join("\n"),
    '              <li role="separator" class="divider"></li>',
    '              <li role="presentation"><a href="#" id="ceseg-tema" role="button" aria-pressed="false">Tema oscuro</a></li>',
    redes
  ].join("\n");
}

const SECCIONES = [
  ["ceseg.html", "Inicio"],
  ["cesegEmprendimiento.html", "Emprendimiento"],
  ["cesegEgresados.html", "Egresados"],
  ["cesegRedGlobal.html", "Red Global"],
  ["cesegBolsa.html", "Bolsa de Trabajo"],
  ["cesegTramites.html", "Trámites"],
  ["calendarioCeseg.html", "Calendario"],
  ["cesegContacto.html", "Contacto"]
];

const SUBTITULO = '<p class="rtejustify">Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG) de la Universidad Simón Bolívar, Sede Sartenejas.</p>';

function pagina({ archivo, titulo, contenido, modulos = [] }) {
  const scripts = [
    '  <script src="cursos/static/js2/jquery.min.js"></script>',
    '  <script src="cursos/static/js2/bootstrap.min.js"></script>',
    '  <script src="src/components/cesegComun.js"></script>'
  ].concat(modulos.map((m) => '  <script type="module" src="src/components/' + m + '"></script>'));
  return [
    cabeceraHead,
    "    <title>" + titulo + "</title>",
    "",
    "    <!-- CSS -->",
    hojas,
    '    <link rel="stylesheet" href="src/ceseg.css"/>',
    "",
    "  </head>",
    "<body>",
    '<script>try { if (localStorage.getItem("ceseg-tema") === "oscuro") document.body.setAttribute("data-tema", "oscuro"); } catch (e) {}</script>',
    "",
    antesMenu,
    menuLateral(archivo),
    despuesMenu,
    '            <div class="col-md-6 col-xs-12 ceseg-portal">',
    "",
    contenido.trim(),
    "",
    "</div>",
    "",
    cuerpoFin,
    "</body>",
    "",
    "  <!--  JavaScript -->",
    scripts.join("\n"),
    "",
    "</html>",
    ""
  ].join("\n");
}

// Formulario «Censo de Egresados CESEG». CENSO_VIEJO, el que traía la plantilla,
// enviaba a otro formulario; se reemplaza en todas las páginas generadas.
const CENSO_VIEJO = "https://docs.google.com/forms/d/e/1FAIpQLSeJ-je68chbQBldDe4RiR2LIyZjBm91u55G-wSURRih7geLJg/viewform";
const CENSO = "https://docs.google.com/forms/d/e/1FAIpQLSeWRBYT_m98uIP7xnXQVKWIvPpHWH0IUi7wWJss2DHt5VBIwA/viewform";

// Pestaña «Ciudades» de «Ciudades CESEG», leída como CSV. Nunca la hoja de respuestas.
const CSV_CIUDADES = "https://docs.google.com/spreadsheets/d/12z13lgy7Z_Em34rRlHqD8ckCrf-NTZo6zGDwk7JwMZM/gviz/tq?tqx=out:csv&amp;sheet=Ciudades";

// Banner del censo. El contador lo llena src/components/censoBanner.js.
function bannerCenso(id) {
  return `<section class="ceseg-censo ceseg-item" id="${id}" aria-labelledby="${id}-titulo" data-csv="${CSV_CIUDADES}">
<p class="ceseg-censo-antetitulo">Censo de Egresados CESEG</p>
<h2 class="ceseg-censo-titulo" id="${id}-titulo">¿Eres egresado de la USB? Pon tu ciudad en el mapa</h2>
<p class="ceseg-censo-cifra" aria-live="polite" hidden></p>
<p><a class="ceseg-censo-boton" href="${CENSO}" target="_blank" rel="noopener">Registrarme en el censo →</a></p>
<p class="ceseg-censo-nota">En el mapa solo aparece tu ciudad. No publicamos tu nombre ni tus datos de contacto.</p>
</section>`;
}

function acceso(archivo, nombre, texto) {
  return (
    '<article class="ceseg-panel ceseg-item">\n' +
    '<h2 class="title"><a href="' + archivo + '">' + nombre + "</a></h2>\n" +
    "<p>" + texto + "</p>\n" +
    "</article>"
  );
}

const paginas = [
  {
    archivo: "ceseg.html",
    titulo: "CESEG | Decanato de Extension",
    modulos: ["censoBanner.js"],
    contenido: `
<header>
<h1 class="title" id="page-title">Impulsamos el talento y los proyectos de la comunidad USBista</h1>
<p class="rtejustify">Coordinación de Emprendimiento y Seguimiento de Egresados de la Universidad Simón Bolívar, Sede Sartenejas.</p>
<p class="ceseg-acciones">
<a class="ceseg-primario" href="cesegEmprendimiento.html">Tengo un Proyecto</a>
<a class="ceseg-secundario" href="cesegEgresados.html">Soy Egresado</a>
</p>
</header>

<form role="search" aria-label="Buscar en la CESEG" onsubmit="return false;">
<label for="ceseg-buscar">Buscar en esta página</label>
<input class="ceseg-buscar" id="ceseg-buscar" type="search" placeholder="Sección, feria o trámite">
</form>
<p id="ceseg-buscar-vacio" hidden>Ningún bloque de esta página coincide con la búsqueda.</p>

${L(513, 520)}

${bannerCenso("censo")}

<article class="ceseg-panel ceseg-item">
<h2 class="title">Convocatoria abierta</h2>
<p><strong>II Feria de Emprendedores USB.</strong> Del lunes 30 de noviembre al viernes 4 de diciembre de 2026, de 9:00 a.m. a 3:00 p.m., en el Conjunto de Auditorios. <a href="cesegEmprendimiento.html#feria-emprendedores">Más información</a></p>
</article>

<article class="ceseg-panel ceseg-item" id="feria-empleo">
<h2 class="title">Feria Virtual de Pasantías, Empleo y PYMES</h2>
<p><a href="feriaVirtual.html"><img src="cursos/static/img2/feriaEmpleo.jpg" alt="Feria Virtual de Pasantías, Empleo y PYMES. Próximamente." class="img-responsive"></a></p>
<p>La Feria de Pasantías, Empleo y PYMES USB 2026-1, prevista del 1 al 3 de julio de 2026, no se realizó por el terremoto. La versión virtual está en desarrollo. <strong>Próximamente.</strong> <a href="feriaVirtual.html">Más información</a></p>
</article>
`
  },
  {
    archivo: "cesegEmprendimiento.html",
    titulo: "CESEG · Emprendimiento e Incubación | Decanato de Extension",
    contenido: `
<h1 class="title" id="page-title">Emprendimiento e Incubación</h1>
${SUBTITULO}

${L(534, 552)}

<article class="ceseg-panel ceseg-item" id="la-simon-emprende">
<h2 class="title">La Simón Emprende</h2>
${L(681, 687)}
</article>
`
  },
  {
    archivo: "cesegEgresados.html",
    titulo: "CESEG · Egresados | Decanato de Extension",
    modulos: ["censoBanner.js", "orgulloUSBista.js", "globoEgresados.js"],
    contenido: `
<h1 class="title" id="page-title">Egresados</h1>
${SUBTITULO}

${bannerCenso("censo")}

<section id="orgullo-usbista" class="ceseg-item" aria-label="Orgullo USBista"></section>

<section id="egresados-mundo" class="ceseg-item" aria-label="Egresados por el mundo">
<h2 class="title">Egresados por el mundo</h2>
<p>Cada cebolla es una ciudad donde vive al menos un egresado que respondió el <a href="${CENSO}" target="_blank" rel="noopener">Censo de Egresados CESEG</a>. La ficha muestra solo la ciudad, el país y cuántos egresados hay allí. No se publican nombres ni datos de contacto.</p>
<p id="egresados-mundo-resumen" class="ceseg-filtro-cuenta" aria-live="polite"></p>
<!-- data-csv: pestaña «Ciudades» del archivo «Ciudades CESEG», leída como CSV. Nunca la hoja de respuestas. Ver docs/globo-egresados.md -->
<div id="globo-egresados" class="ceseg-globo" data-csv="${CSV_CIUDADES}" data-censo="${CENSO}" aria-label="Globo con las ciudades donde viven egresados"></div>
</section>

<article class="ceseg-panel ceseg-item" id="formacion">
<h2 class="title">Formación continua</h2>
<p><a href="ofertaAcad.html">Cursos de extensión</a> y <a href="diplomados.html">Diplomados</a>. Las charlas de la CESEG se agregarán aquí. Próximamente.</p>
</article>

${L(569, 577)}

${acceso("cesegRedGlobal.html", "Red Global USBista", "Cifras de la red, filtro y el globo de las empresas fundadas por egresados de la USB.")}
`
  },
  {
    archivo: "cesegRedGlobal.html",
    titulo: "CESEG · Red Global USBista | Decanato de Extension",
    modulos: ["impactoGlobal.js", "filtroRed.js", "globeUSB.js"],
    contenido: `
<h1 class="title" id="page-title">Red Global USBista</h1>
${SUBTITULO}

${L(556, 557)}
${L(559, 563)}
`
  },
  {
    archivo: "cesegBolsa.html",
    titulo: "CESEG · Bolsa de Trabajo | Decanato de Extension",
    contenido: `
<h1 class="title" id="page-title">Bolsa de Trabajo</h1>
${SUBTITULO}

${L(581, 628)}
`
  },
  {
    archivo: "cesegTramites.html",
    titulo: "CESEG · Trámites y Certificaciones | Decanato de Extension",
    contenido: `
<h1 class="title" id="page-title">Trámites y Certificaciones</h1>
${SUBTITULO}

${L(632, 649)}
`
  },
  {
    archivo: "cesegContacto.html",
    titulo: "CESEG · Contacto y equipo | Decanato de Extension",
    contenido: `
<h1 class="title" id="page-title">Contacto y equipo</h1>
${SUBTITULO}

<article class="ceseg-panel" id="contacto">
${L(657, 663)}
</article>
`
  },
  {
    archivo: "calendarioCeseg.html",
    titulo: "CESEG · Calendario | Decanato de Extension",
    contenido: `
<h1 class="title" id="page-title">Calendario de la CESEG</h1>
<p class="rtejustify">Eventos programados por la Coordinación de Emprendimiento y Seguimiento de Egresados, Sede Sartenejas. Cada actividad nueva se agrega como una fila de esta tabla.</p>
<table class="table">
<tbody>
<tr><td>30 de noviembre al 4 de diciembre de 2026</td><td>II Feria de Emprendedores USB. De 9:00 a.m. a 3:00 p.m., en el Conjunto de Auditorios. <a href="cesegEmprendimiento.html#feria-emprendedores">Más información</a></td></tr>
<tr><td>Próximamente</td><td>Feria Virtual de Pasantías, Empleo y PYMES. <a href="feriaVirtual.html">Más información</a></td></tr>
</tbody>
</table>
<!-- Para agregar un evento, copia una fila: la fecha va en la primera celda y el texto en la segunda. -->
`
  },
  {
    archivo: "feriaVirtual.html",
    titulo: "CESEG · Feria Virtual de Pasantías, Empleo y PYMES | Decanato de Extension",
    contenido: `
<h1 class="title" id="page-title">Feria Virtual de Pasantías, Empleo y PYMES</h1>
<p><img src="cursos/static/img2/feriaEmpleo.jpg" alt="Feria Virtual de Pasantías, Empleo y PYMES. Próximamente." class="img-responsive"></p>
<p><strong>Próximamente.</strong></p>
<p>La Feria de Pasantías, Empleo y PYMES USB 2026-1, prevista del 1 al 3 de julio de 2026, no se realizó por el terremoto. La versión virtual está en desarrollo.</p>
<p><a href="cesegBolsa.html#feria-virtual">Bolsa de Trabajo de la CESEG</a></p>
`
  }
];

for (const p of paginas) {
  fs.writeFileSync(path.join(repo, p.archivo), pagina(p).split(CENSO_VIEJO).join(CENSO));
  console.log("escrito", p.archivo);
}
