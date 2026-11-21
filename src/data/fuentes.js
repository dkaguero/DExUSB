// Fuente de datos de Orgullo USBista y de las empresas de egresados.
//
// Los datos los mantiene la CESEG en Google Sheets: el archivo privado
// «Datos CESEG – edición» y, al pulsar «CESEG › Publicar cambios», las
// pestañas públicas «Orgullo» y «Empresas» del archivo «Ciudades CESEG».
// Ver docs/datos-ceseg.md.
//
// Si la hoja no responde, o la pestaña aún no existe o no trae las columnas
// esperadas, se usan los datos del repositorio (egresadosData.js y
// empresasUSBData.js). Así la página nunca queda vacía.
import egresadosLocal from "./egresadosData.js";
import empresasLocal from "./empresasUSBData.js";
import { leerCSV, normal } from "../components/ciudadesCSV.js";

// headers=1: solo la primera fila son títulos. Sin esto, Google puede juntar
// las primeras filas de datos con los títulos.
const HOJA = "https://docs.google.com/spreadsheets/d/12z13lgy7Z_Em34rRlHqD8ckCrf-NTZo6zGDwk7JwMZM/gviz/tq?tqx=out:csv&headers=1&sheet=";

function slug(texto) {
  return normal(texto).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function numero(valor) {
  return parseFloat(String(valor == null ? "" : valor).replace(",", "."));
}

function verdadero(valor) {
  return /^(si|sí|true|verdadero|x|1)$/i.test(String(valor || "").trim());
}

// Lee una pestaña y devuelve objetos con las columnas pedidas, o null si la
// pestaña no tiene esas columnas (por ejemplo, porque aún no existe).
function leerPestana(nombre, obligatorias) {
  return fetch(HOJA + encodeURIComponent(nombre), { cache: "no-store" })
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error("hoja");
      return respuesta.text();
    })
    .then((texto) => {
      const filas = leerCSV(texto);
      if (filas.length < 2) return null;
      const cabecera = filas[0].map(normal);
      if (!obligatorias.every((columna) => cabecera.indexOf(columna) !== -1)) return null;
      return filas.slice(1).map((fila) => {
        const objeto = {};
        cabecera.forEach((columna, i) => { objeto[columna] = (fila[i] || "").trim(); });
        return objeto;
      });
    });
}

function aEgresado(f) {
  return {
    id: slug(f.nombre),
    nombre: f.nombre,
    carrera: f.carrera,
    cohorte: f.cohorte,
    cargo: f.cargo,
    "ubicación": f.ubicacion,
    logro: f.logro,
    fotoUrl: f.foto,
    "categoría": f.categoria,
    destacado: verdadero(f.destacado),
    fuente: f.fuente,
    fuenteTexto: f.fuente_texto
  };
}

function aEmpresa(f) {
  return {
    id: slug(f.empresa),
    empresa: f.empresa,
    fundador: f.fundador,
    carrera: f.carrera,
    ciudad: f.ciudad,
    pais: f.pais,
    lat: numero(f.lat),
    lng: numero(f.lng),
    rubro: f.rubro,
    descripcion: f.descripcion,
    fuente: f.fuente,
    fuenteTexto: f.fuente_texto,
    verificacion: f.verificacion
  };
}

let egresadosPromesa = null;
let empresasPromesa = null;

export function cargarEgresados() {
  if (!egresadosPromesa) {
    egresadosPromesa = leerPestana("Orgullo", ["nombre", "carrera", "logro", "categoria", "fuente"])
      .then((filas) => {
        const lista = (filas || []).filter((f) => f.nombre && f.logro).map(aEgresado);
        return lista.length ? lista : egresadosLocal;
      })
      .catch(() => egresadosLocal);
  }
  return egresadosPromesa;
}

export function cargarEmpresas() {
  if (!empresasPromesa) {
    empresasPromesa = leerPestana("Empresas", ["empresa", "fundador", "ciudad", "pais", "lat", "lng"])
      .then((filas) => {
        const lista = (filas || []).map(aEmpresa).filter((e) => e.empresa);
        // «Publicar cambios» nunca publica coordenadas imposibles. Si aparece
        // alguna, la hoja está dañada: se usan los datos del repositorio.
        const sanas = lista.every((e) => isFinite(e.lat) && isFinite(e.lng) &&
          Math.abs(e.lat) <= 90 && Math.abs(e.lng) <= 180);
        return lista.length && sanas ? lista : empresasLocal;
      })
      .catch(() => empresasLocal);
  }
  return empresasPromesa;
}
