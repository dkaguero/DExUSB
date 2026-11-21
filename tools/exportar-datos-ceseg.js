#!/usr/bin/env node
// Exporta Orgullo USBista y las empresas del repositorio a CSV, para la carga
// inicial del archivo privado «Datos CESEG – edición» (ver docs/datos-ceseg.md).
//
// Uso:  node tools/exportar-datos-ceseg.js
// Sale en dist-google-sites/datos/:
//   orgullo-edicion.csv, empresas-edicion.csv  → se importan en el archivo de edición
//   orgullo-publico.csv, empresas-publico.csv  → solo para pruebas locales
// Las filas salen con estado «Aprobado»: ya están publicadas y verificadas.

"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = path.resolve(__dirname, "..");
const SALIDA = path.join(RAIZ, "dist-google-sites", "datos");

// Los archivos de datos son módulos ES; se leen como texto y se evalúan.
function cargar(relativo) {
  const codigo = fs.readFileSync(path.join(RAIZ, relativo), "utf8")
    .replace(/^export\s+const\s+/m, "const ")
    .replace(/^export\s+default\s+([\w$]+);?\s*$/m, "module.exports = $1;");
  const modulo = { exports: null };
  vm.runInNewContext(codigo, { module: modulo });
  return modulo.exports;
}

function csv(filas) {
  return filas.map((fila) => fila.map((v) => {
    const texto = v == null ? "" : String(v);
    return '"' + texto.replace(/"/g, '""') + '"';
  }).join(",")).join("\r\n") + "\r\n";
}

const VERIFICADO = "Coordinación CESEG (carga inicial)";

const egresados = cargar("src/data/egresadosData.js");
const empresas = cargar("src/data/empresasUSBData.js");

const ORGULLO_EDICION = ["estado", "nombre", "carrera", "cohorte", "cargo", "ubicacion", "logro", "categoria",
  "destacado", "foto", "fuente", "fuente_texto", "verificado_por", "notas",
  "fecha_propuesta", "propuesto_por", "correo_proponente", "relacion"];
const ORGULLO_PUBLICO = ["nombre", "carrera", "cohorte", "cargo", "ubicacion", "logro", "categoria",
  "destacado", "foto", "fuente", "fuente_texto"];
const EMPRESAS_EDICION = ["estado", "empresa", "fundador", "carrera", "ciudad", "pais", "lat", "lng", "rubro",
  "descripcion", "fuente", "fuente_texto", "verificacion", "verificado_por", "notas",
  "fecha_propuesta", "contacto_nombre", "contacto_correo"];
const EMPRESAS_PUBLICO = ["empresa", "fundador", "carrera", "ciudad", "pais", "lat", "lng", "rubro",
  "descripcion", "fuente", "fuente_texto", "verificacion"];

// Mismo nombre de fuente que muestra hoy el carrusel cuando falta fuenteTexto.
function fuenteTexto(persona) {
  if (persona.fuenteTexto) return persona.fuenteTexto;
  return /usbnoticias\.usb\.ve/i.test(persona.fuente || "") ? "USB Noticias" : "Referencia";
}

const orgullo = egresados.map((p) => ({
  estado: "Aprobado",
  nombre: p.nombre,
  carrera: p.carrera,
  cohorte: p.cohorte,
  cargo: p.cargo,
  ubicacion: p["ubicación"],
  logro: p.logro,
  categoria: p["categoría"],
  destacado: p.destacado ? "Sí" : "No",
  foto: p.fotoUrl,
  fuente: p.fuente,
  fuente_texto: fuenteTexto(p),
  verificado_por: VERIFICADO
}));

const empresasFilas = empresas.map((e) => ({
  estado: "Aprobado",
  empresa: e.empresa,
  fundador: e.fundador,
  carrera: e.carrera,
  ciudad: e.ciudad,
  pais: e.pais,
  lat: e.lat,
  lng: e.lng,
  rubro: e.rubro,
  descripcion: e.descripcion,
  fuente: e.fuente,
  fuente_texto: e.fuenteTexto,
  verificacion: e.verificacion,
  verificado_por: VERIFICADO
}));

function tabla(objetos, columnas) {
  return [columnas].concat(objetos.map((o) => columnas.map((c) => o[c])));
}

fs.mkdirSync(SALIDA, { recursive: true });
const archivos = {
  "orgullo-edicion.csv": tabla(orgullo, ORGULLO_EDICION),
  "empresas-edicion.csv": tabla(empresasFilas, EMPRESAS_EDICION),
  "orgullo-publico.csv": tabla(orgullo, ORGULLO_PUBLICO),
  "empresas-publico.csv": tabla(empresasFilas, EMPRESAS_PUBLICO)
};
Object.keys(archivos).forEach((nombre) => {
  fs.writeFileSync(path.join(SALIDA, nombre), csv(archivos[nombre]));
  console.log("  " + nombre.padEnd(22) + (archivos[nombre].length - 1) + " filas");
});
console.log("En " + path.relative(RAIZ, SALIDA) + "/");
