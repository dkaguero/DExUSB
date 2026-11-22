#!/usr/bin/env node
// Fase 1, prueba temprana: genera Feria_Emp/dist/prueba-360.html, un widget del
// tamaño que tendrá la feria (todas las imágenes del panorama y del auditorio
// dentro, en base64) para comprobar en Google Sites:
//   1. que «Incorporar código» acepta un widget de más de 1 MB;
//   2. que el visor 360 (Pannellum, desde jsDelivr) funciona dentro del recuadro;
//   3. que un video de YouTube se puede poner dentro de la pantalla del auditorio.
// Uso: node Feria_Emp/front/tools/prueba-tamano.js
"use strict";
const fs = require("fs");
const path = require("path");

const FRONT = path.resolve(__dirname, "..");
const SALIDA = path.resolve(FRONT, "..", "dist");
const PANO = path.join(FRONT, "assets", "panorama");
const AUDI = path.join(FRONT, "assets", "auditorio");

const dataUri = (archivo) => "data:image/webp;base64," + fs.readFileSync(archivo).toString("base64");

// Todas las piezas del panorama: en la feria real el compositor las usará.
const piezas = {};
fs.readdirSync(PANO).filter((f) => f.endsWith(".webp")).forEach((f) => {
  piezas[f.replace(/\.webp$/, "")] = dataUri(path.join(PANO, f));
});
const gradas = dataUri(path.join(AUDI, "gradas-2560.webp"));
const pantalla = JSON.parse(fs.readFileSync(path.join(AUDI, "manifest.json"), "utf8")).views.gradas.screen;

// Video público de ejemplo de la documentación de YouTube.
const VIDEO = "M7lc1UVf-VE";

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prueba de la feria 360</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css">
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #0b1329; color: #fff; font-family: Verdana, Arial, sans-serif; font-size: 12px; }
#app { height: 100%; display: flex; flex-direction: column; }
#barra { flex: 0 0 auto; display: flex; gap: 6px; align-items: center; padding: 6px; background: #0055a5; flex-wrap: wrap; }
#barra button { font: inherit; font-weight: bold; padding: 4px 10px; border: 1px solid #d4af37; background: #fff; color: #0055a5; cursor: pointer; }
#barra button[aria-pressed="true"] { background: #d4af37; color: #0b1329; }
#estado { margin-left: auto; font-size: 11px; }
#vistas { flex: 1 1 auto; position: relative; min-height: 0; }
.vista { position: absolute; inset: 0; }
[hidden] { display: none !important; }
#sala { display: flex; align-items: center; justify-content: center; }
#sala-caja { position: relative; width: 100%; max-height: 100%; aspect-ratio: 2560 / 1440; }
#sala-caja img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
#sala-pantalla { position: absolute; border: 0; }
</style>
</head>
<body>
<div id="app">
  <div id="barra">
    <button type="button" data-vista="pano" aria-pressed="true">Feria 360</button>
    <button type="button" data-vista="sala" aria-pressed="false">Auditorio</button>
    <span id="estado">Cargando…</span>
  </div>
  <div id="vistas">
    <div class="vista" id="pano"></div>
    <div class="vista" id="sala" hidden>
      <div id="sala-caja">
        <img id="sala-img" alt="Auditorio visto desde las gradas">
        <iframe id="sala-pantalla" title="Charla de prueba" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
<script>
var PIEZAS = ${JSON.stringify(piezas)};
var GRADAS = ${JSON.stringify(gradas)};
var PANTALLA = ${JSON.stringify(pantalla)};
var VIDEO = ${JSON.stringify(VIDEO)};
(function () {
  var estado = document.getElementById("estado");
  var tamano = (document.documentElement.outerHTML.length / 1048576).toFixed(2).replace(".", ",");
  var piezas = Object.keys(PIEZAS).length;
  var visor = null;
  try {
    visor = pannellum.viewer("pano", {
      type: "equirectangular",
      panorama: PIEZAS["fondo-2048"],
      autoLoad: true,
      showControls: true,
      compass: false,
      hfov: 100,
      hotSpots: [{ pitch: -5, yaw: 0, type: "info", text: "Aquí irá el pórtico CESEG" }]
    });
    estado.textContent = "Widget de " + tamano + " MB · visor 360 cargado · " + piezas + " imágenes";
  } catch (e) {
    estado.textContent = "Widget de " + tamano + " MB · ERROR del visor 360: " + e.message;
  }

  var img = document.getElementById("sala-img");
  var iframe = document.getElementById("sala-pantalla");
  img.src = GRADAS;
  function colocar() {
    var caja = document.getElementById("sala-caja").getBoundingClientRect();
    var r = 2560 / 1440, w = caja.width, h = caja.height, iw, ih;
    if (w / h > r) { ih = h; iw = h * r; } else { iw = w; ih = w / r; }
    var x0 = (w - iw) / 2, y0 = (h - ih) / 2;
    iframe.style.left = (x0 + PANTALLA.x * iw) + "px";
    iframe.style.top = (y0 + PANTALLA.y * ih) + "px";
    iframe.style.width = (PANTALLA.w * iw) + "px";
    iframe.style.height = (PANTALLA.w * iw * 9 / 16) + "px";
  }
  window.addEventListener("resize", colocar);

  document.getElementById("barra").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-vista]");
    if (!b) return;
    var cual = b.getAttribute("data-vista");
    document.querySelectorAll("#barra button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    document.getElementById("pano").hidden = cual !== "pano";
    document.getElementById("sala").hidden = cual !== "sala";
    if (cual === "sala") {
      if (!iframe.src) iframe.src = "https://www.youtube.com/embed/" + VIDEO;
      colocar();
    } else if (visor) {
      visor.resize();
    }
  });
}());
</script>
</body>
</html>
`;

fs.mkdirSync(SALIDA, { recursive: true });
const destino = path.join(SALIDA, "prueba-360.html");
fs.writeFileSync(destino, html);
console.log(path.relative(process.cwd(), destino) + ": " + (Buffer.byteLength(html) / 1048576).toFixed(2) + " MB, " + Object.keys(piezas).length + " imágenes");
