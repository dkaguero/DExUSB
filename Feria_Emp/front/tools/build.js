#!/usr/bin/env node
// Genera los widgets de la Feria de Empleo para Google Sites («Incorporar código»).
// Uso: node Feria_Emp/front/tools/build.js
// Sale en Feria_Emp/dist/ (ignorada por git: se regenera).
//
// Cada widget es un solo archivo: su CSS y su JS van dentro, y las imágenes
// también, en base64. Solo el visor 360 (Pannellum) se carga desde jsDelivr.
"use strict";
const fs = require("fs");
const path = require("path");

const FRONT = path.resolve(__dirname, "..");
const SRC = path.join(FRONT, "src");
const ASSETS = path.join(FRONT, "assets");
const SALIDA = path.resolve(FRONT, "..", "dist");

const leer = (rel) => fs.readFileSync(path.join(SRC, rel), "utf8");
const dataUri = (archivo) => "data:image/webp;base64," + fs.readFileSync(archivo).toString("base64");

// Arte del panorama: manifiesto e imágenes (2048 y 4096) en data URI.
function artePanorama() {
  const dir = path.join(ASSETS, "panorama");
  const imagenes = {};
  fs.readdirSync(dir).filter((f) => f.endsWith(".webp")).forEach((f) => {
    imagenes[f.replace(/\.webp$/, "")] = dataUri(path.join(dir, f));
  });
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  return "window.FE = window.FE || {};\nFE.ARTE = " + JSON.stringify({ manifest, imagenes }) + ";\n";
}

function arteAuditorio() {
  const dir = path.join(ASSETS, "auditorio");
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
  const vista = manifest.views.gradas;
  const imagenes = {};
  Object.keys(vista.image).forEach((w) => { imagenes[w] = dataUri(path.join(dir, vista.image[w])); });
  return "window.FE = window.FE || {};\nFE.SALA = " + JSON.stringify({ pantalla: vista.screen, imagenes }) + ";\n";
}

const WIDGETS = [
  {
    archivo: "feria-360.html",
    plantilla: "feria-360/plantilla.html",
    css: ["feria-360/feria.css"],
    js: () => [leer("comun/pantalla.js"), artePanorama(), leer("comun/datos.js"), leer("comun/hoja.js"), leer("feria-360/escena.js"),
      leer("feria-360/compositor.js"), leer("feria-360/ficha.js"), leer("feria-360/feria.js")]
  }
];

const AUDITORIO = {
  archivo: "auditorio.html",
  plantilla: "auditorio/plantilla.html",
  css: ["auditorio/auditorio.css"],
  js: () => [leer("comun/pantalla.js"), arteAuditorio(), leer("comun/datos.js"), leer("comun/hoja.js"), leer("auditorio/auditorio.js")]
};
if (fs.existsSync(path.join(SRC, AUDITORIO.plantilla))) WIDGETS.push(AUDITORIO);

fs.mkdirSync(SALIDA, { recursive: true });
for (const w of WIDGETS) {
  const html = leer(w.plantilla)
    .replace("/*@CSS@*/", () => w.css.map(leer).join("\n"))
    .replace("/*@JS@*/", () => w.js().join("\n"));
  if (/<\/script>/i.test(w.js().join(""))) throw new Error(w.archivo + ": el JS contiene </script>");
  fs.writeFileSync(path.join(SALIDA, w.archivo), html);
  console.log("  " + w.archivo.padEnd(18) + (Buffer.byteLength(html) / 1048576).toFixed(2) + " MB");
}
console.log("En " + path.relative(process.cwd(), SALIDA) + "/");
