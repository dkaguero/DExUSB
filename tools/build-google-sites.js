#!/usr/bin/env node
// Genera los widgets de la CESEG para Google Sites («Insertar › Incorporar código»).
//
// Uso:  node tools/build-google-sites.js
// Sale en dist-google-sites/ceseg/ (carpeta ignorada por git: se regenera).
//
// Cada widget es un solo archivo HTML autocontenido:
//  - el bloque de HTML se copia de la página de la CESEG que ya lo usa, así el
//    contenido vive en un solo lugar;
//  - los módulos de src/components se unen en un único <script> clásico;
//  - el CSS de src/ceseg.css va en <style>, con una base mínima (sin Bootstrap);
//  - las imágenes locales de menos de 150 KB van en base64; las más grandes
//    se reemplazan por REEMPLAZAR_URL_DRIVE_[archivo] y se listan en PENDIENTES;
//  - el tema claro u oscuro sigue al sistema del visitante;
//  - los enlaces sin destino se abren fuera del iframe (target="_top").
// Los CDN (globe.gl, Font Awesome) se dejan como enlaces externos.

"use strict";
const fs = require("fs");
const path = require("path");

const RAIZ = path.resolve(__dirname, "..");
const SALIDA = path.join(RAIZ, "dist-google-sites", "ceseg");
const LIMITE_BASE64 = 150 * 1024;
const FONT_AWESOME = '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">';

const pendientes = [];
const avisos = [];

function leer(relativo) {
  return fs.readFileSync(path.join(RAIZ, relativo), "utf8");
}

// ---------- bloques de HTML copiados de las páginas ----------

// Copia el elemento <etiqueta id="id" …>…</etiqueta> de una página.
// Los bloques que se copian no tienen elementos de la misma etiqueta anidados.
function bloque(pagina, etiqueta, id) {
  const html = leer(pagina);
  const re = new RegExp("<" + etiqueta + "\\b[^>]*\\bid=\"" + id + "\"[^>]*>[\\s\\S]*?</" + etiqueta + ">");
  const encontrado = html.match(re);
  if (!encontrado) throw new Error("No encontré <" + etiqueta + " id=\"" + id + "\"> en " + pagina);
  return encontrado[0];
}

// ---------- imágenes ----------

const TIPOS = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif" };

function incrustarImagenes(texto, origen) {
  return texto.replace(/(?:public|cursos|src|cct|cfcg|censo|uast)\/[\w./-]+\.(?:svg|png|jpe?g|gif)/g, (ruta) => {
    const archivo = path.join(RAIZ, ruta);
    if (!fs.existsSync(archivo)) {
      avisos.push(origen + ": la imagen " + ruta + " no existe.");
      return ruta;
    }
    const tamano = fs.statSync(archivo).size;
    if (tamano > LIMITE_BASE64) {
      const nombre = path.basename(ruta);
      pendientes.push({ origen, ruta, tamano });
      return "REEMPLAZAR_URL_DRIVE_" + nombre;
    }
    const tipo = TIPOS[path.extname(ruta).toLowerCase()];
    return "data:" + tipo + ";base64," + fs.readFileSync(archivo).toString("base64");
  });
}

// ---------- unión de módulos ES en un script clásico ----------

function resolver(desde, pedido) {
  return path.posix.normalize(path.posix.join(path.posix.dirname(desde), pedido));
}

function transformar(id, codigo) {
  const dependencias = [];
  const exportados = [];
  const ref = (dep) => "__m[" + JSON.stringify(dep) + "]";

  let cuerpo = codigo.replace(/^import\s+([\s\S]*?)\s+from\s+"([^"]+)";?[ \t]*$/gm, (_, que, desde) => {
    const dep = resolver(id, desde);
    dependencias.push(dep);
    const lineas = [];
    let resto = que.trim();
    const porDefecto = resto.match(/^([A-Za-z_$][\w$]*)\s*(?:,\s*(\{[\s\S]*\}))?$/);
    if (porDefecto) {
      lineas.push("const " + porDefecto[1] + " = " + ref(dep) + ".default;");
      resto = porDefecto[2] || "";
    }
    const nombrados = resto.match(/^\{([\s\S]*)\}$/);
    if (nombrados) {
      nombrados[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => {
        const [original, alias] = s.split(/\s+as\s+/);
        lineas.push("const " + (alias || original).trim() + " = " + ref(dep) + "." + original.trim() + ";");
      });
    }
    return lineas.join(" ");
  });

  cuerpo = cuerpo.replace(/^export\s+(function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm, (_, tipo, nombre) => {
    exportados.push(nombre + ": " + nombre);
    return tipo + " " + nombre;
  });
  cuerpo = cuerpo.replace(/^export\s+default\s+([A-Za-z_$][\w$]*);?[ \t]*$/gm, (_, nombre) => {
    exportados.push("default: " + nombre);
    return "";
  });
  if (/^export\s/m.test(cuerpo)) throw new Error("Forma de export no soportada en " + id);

  const envuelto =
    ref(id) + " = (function () {\n" + cuerpo + "\nreturn { " + exportados.join(", ") + " };\n})();";
  return { dependencias, envuelto };
}

function unirModulos(entradas) {
  const hechos = new Map();
  const orden = [];
  function visitar(id) {
    if (hechos.has(id)) return;
    hechos.set(id, null);
    const { dependencias, envuelto } = transformar(id, leer(id));
    dependencias.forEach(visitar);
    orden.push(envuelto);
  }
  entradas.forEach(visitar);
  return '"use strict";\nvar __m = {};\n' + orden.join("\n\n");
}

// ---------- plantilla del widget ----------

const BASE_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { background: var(--ceseg-fondo); }
body {
  font-family: Verdana, Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.5;
  color: var(--ceseg-texto);
  -webkit-text-size-adjust: 100%;
}
[hidden] { display: none !important; }
img { max-width: 100%; height: auto; }
a { color: var(--ceseg-azul); }
p { margin: 0 0 8px; }
.ceseg-portal { padding: 8px; }
body[data-tema="oscuro"], html[data-tema="oscuro"] { background: var(--ceseg-noche); }
/* En el widget la lista de ciudades abierta se desplaza por dentro: el iframe
   de Google Sites tiene un alto fijo. */
.ceseg-globo-pliegue[open] .ceseg-globo-indice { max-height: 220px; overflow-y: auto; }
`;

// Tema según el sistema y enlaces fuera del iframe. No usa localStorage.
const SCRIPT_ENTORNO = `
(function () {
  var consulta = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function aplicar() {
    var tema = consulta && consulta.matches ? "oscuro" : "claro";
    document.body.setAttribute("data-tema", tema);
    document.documentElement.setAttribute("data-tema", tema);
  }
  aplicar();
  if (consulta) {
    if (consulta.addEventListener) consulta.addEventListener("change", aplicar);
    else if (consulta.addListener) consulta.addListener(aplicar);
  }
  document.addEventListener("click", function (evento) {
    var enlace = evento.target.closest ? evento.target.closest("a[href]") : null;
    if (enlace && !enlace.getAttribute("target")) enlace.setAttribute("target", "_top");
  });
}());
`;

function pagina(widget, css) {
  const contenido = incrustarImagenes(widget.html, widget.archivo);
  const codigo = incrustarImagenes(unirModulos(widget.modulos), widget.archivo);
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${widget.titulo}</title>
${(widget.cdn || []).join("\n")}
<style>
${BASE_CSS}
${css}
</style>
</head>
<body>
<div class="ceseg-portal ceseg-widget">
${contenido}
</div>
<script>${SCRIPT_ENTORNO}</script>
<script>
${codigo}
</script>
</body>
</html>
`;
}

// ---------- widgets ----------

const WIDGETS = [
  {
    archivo: "censo-banner.html",
    titulo: "Censo de Egresados CESEG",
    pagina: "Inicio y Egresados",
    html: bloque("cesegEgresados.html", "section", "censo"),
    modulos: ["src/components/censoBanner.js"]
  },
  {
    archivo: "orgullo-usbista.html",
    titulo: "Orgullo USBista",
    pagina: "Egresados",
    cdn: [FONT_AWESOME],
    html: bloque("cesegEgresados.html", "section", "orgullo-usbista"),
    modulos: ["src/components/orgulloUSBista.js"]
  },
  {
    archivo: "globo-egresados.html",
    titulo: "Egresados por el mundo",
    pagina: "Egresados",
    html: bloque("cesegEgresados.html", "section", "egresados-mundo"),
    modulos: ["src/components/globoEgresados.js"]
  },
  {
    archivo: "red-global.html",
    titulo: "Red Global USBista",
    pagina: "Red Global",
    html: [
      bloque("cesegRedGlobal.html", "section", "impacto-global"),
      bloque("cesegRedGlobal.html", "div", "filtro-red"),
      bloque("cesegRedGlobal.html", "section", "usbistas-mundo")
    ].join("\n"),
    modulos: ["src/components/impactoGlobal.js", "src/components/filtroRed.js", "src/components/globeUSB.js"]
  }
];

// ---------- salida ----------

function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const css = incrustarImagenes(leer("src/ceseg.css"), "src/ceseg.css");
  const filas = [];
  for (const widget of WIDGETS) {
    const html = pagina(widget, css);
    const relativos = html.match(/(?:src|href)="(?!https?:|data:|mailto:|#|')[^"]+"/g);
    if (relativos) avisos.push(widget.archivo + ": quedan rutas locales: " + relativos.join(", "));
    if (/localStorage|sessionStorage/.test(html.replace(/\/\/.*$/gm, ""))) {
      avisos.push(widget.archivo + ": usa almacenamiento local; revisar que esté en try/catch.");
    }
    fs.writeFileSync(path.join(SALIDA, widget.archivo), html);
    filas.push({ archivo: widget.archivo, pagina: widget.pagina, kb: (Buffer.byteLength(html) / 1024).toFixed(1) });
  }

  // Página de prueba local con los widgets en iframes, como en Google Sites.
  const prueba = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Prueba de widgets</title>
<style>body{font-family:Verdana,sans-serif;font-size:12px;margin:16px;max-width:820px}
iframe{width:100%;border:1px dashed #94a3b8;display:block;margin:4px 0 24px}</style></head><body>
<h1>Widgets de la CESEG para Google Sites</h1>
${WIDGETS.map((w) => `<h2>${w.titulo} <small>(${w.archivo})</small></h2>
<iframe src="${w.archivo}" title="${w.titulo}" data-widget="${w.archivo}" height="600"></iframe>`).join("\n")}
</body></html>
`;
  fs.writeFileSync(path.join(SALIDA, "_prueba.html"), prueba);

  console.log("Widgets en " + path.relative(RAIZ, SALIDA) + "/");
  filas.forEach((f) => console.log("  " + f.archivo.padEnd(24) + f.kb.padStart(7) + " KB   → " + f.pagina));
  if (pendientes.length) {
    console.log("\nImágenes de más de 150 KB (subir a Drive):");
    pendientes.forEach((p) => console.log("  " + p.ruta + " (" + Math.round(p.tamano / 1024) + " KB) en " + p.origen));
  }
  if (avisos.length) {
    console.log("\nAvisos:");
    avisos.forEach((a) => console.log("  " + a));
  }
}

main();
