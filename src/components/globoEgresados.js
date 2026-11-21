// Globo «Egresados por el mundo» de la página Egresados.
// Lee la hoja pública «Ciudades CESEG» (CSV publicado desde Google Sheets),
// que el Apps Script del Censo de Egresados llena con una fila por ciudad:
//   pais, ciudad, lat, lng, egresados
// La hoja no tiene nombres ni datos de contacto. La ficha muestra solo la
// ciudad, el país y cuántos egresados hay allí.
//
// La dirección del CSV va en el atributo data-csv del contenedor.
// Para probar en local sin la hoja: agrega ?demo a la dirección de la página.
import { escapar, montarGlobo } from "./globoBase.js";

const DEMO = "src/data/egresadosMundoDemo.csv";

// Lector de CSV que respeta comillas y comas dentro de un campo.
export function leerCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"';
        i += 1;
      } else if (c === '"') {
        comillas = false;
      } else {
        campo += c;
      }
    } else if (c === '"') {
      comillas = true;
    } else if (c === ",") {
      fila.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i += 1;
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else {
      campo += c;
    }
  }
  if (campo !== "" || fila.length) {
    fila.push(campo);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((valor) => valor.trim() !== ""));
}

function normal(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

// Convierte las filas en una cebolla por ciudad. Si la hoja trae dos filas
// de la misma ciudad, se suman sus egresados.
export function ciudadesDesdeCSV(texto) {
  const filas = leerCSV(texto);
  if (!filas.length) return [];
  const cabecera = filas[0].map(normal);
  const col = (nombre) => cabecera.indexOf(nombre);
  const iPais = col("pais");
  const iCiudad = col("ciudad");
  const iLat = col("lat");
  const iLng = col("lng");
  const iCuenta = col("egresados");
  if (iPais < 0 || iCiudad < 0 || iLat < 0 || iLng < 0) return [];

  const porCiudad = new Map();
  filas.slice(1).forEach((f) => {
    const pais = (f[iPais] || "").trim();
    const ciudad = (f[iCiudad] || "").trim();
    const lat = parseFloat(String(f[iLat] || "").replace(",", "."));
    const lng = parseFloat(String(f[iLng] || "").replace(",", "."));
    const cuenta = iCuenta >= 0 ? parseInt(f[iCuenta], 10) : 1;
    if (!pais || !ciudad || !isFinite(lat) || !isFinite(lng)) return;
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
    const n = isFinite(cuenta) && cuenta > 0 ? cuenta : 1;
    const clave = normal(ciudad) + "|" + normal(pais);
    const previo = porCiudad.get(clave);
    if (previo) {
      previo.egresados += n;
    } else {
      porCiudad.set(clave, { id: clave, pais, ciudad, lat, lng, egresados: n });
    }
  });
  return Array.from(porCiudad.values()).sort((a, b) =>
    b.egresados - a.egresados || a.ciudad.localeCompare(b.ciudad, "es")
  );
}

function cuantos(n) {
  return n === 1 ? "1 egresado" : n + " egresados";
}

function ficha(punto) {
  return (
    "<p><strong>" + escapar(punto.ciudad) + ", " + escapar(punto.pais) + "</strong></p>" +
    "<p>" + cuantos(punto.egresados) + "</p>"
  );
}

function indice(lista) {
  return lista.map((punto) =>
    "<li><strong>" + escapar(punto.ciudad) + ", " + escapar(punto.pais) + "</strong> · " +
    cuantos(punto.egresados) + "</li>"
  ).join("");
}

function resumen(nodo, lista) {
  if (!nodo) return;
  const total = lista.reduce((suma, punto) => suma + punto.egresados, 0);
  const paises = new Set(lista.map((punto) => normal(punto.pais))).size;
  nodo.textContent =
    cuantos(total) + " en " +
    (lista.length === 1 ? "1 ciudad" : lista.length + " ciudades") + " de " +
    (paises === 1 ? "1 país" : paises + " países") + ".";
}

function avisar(raiz, texto) {
  const p = document.createElement("p");
  p.className = "ceseg-globo-aviso";
  p.textContent = texto;
  raiz.appendChild(p);
}

export function GloboEgresados(raiz) {
  const demo = /[?&]demo\b/.test(location.search);
  const url = demo ? DEMO : (raiz.getAttribute("data-csv") || "").trim();
  const nodoResumen = document.getElementById("egresados-mundo-resumen");
  if (!url) {
    avisar(raiz, "Aún no hay ciudades registradas.");
    return;
  }
  fetch(url, { cache: "no-store" })
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error("csv");
      return respuesta.text();
    })
    .then((texto) => {
      const ciudades = ciudadesDesdeCSV(texto);
      if (!ciudades.length) {
        avisar(raiz, "Aún no hay ciudades registradas.");
        return;
      }
      resumen(nodoResumen, ciudades);
      montarGlobo(raiz, {
        datos: ciudades,
        etiqueta: (punto) => punto.ciudad + ", " + punto.pais + ": " + cuantos(punto.egresados),
        ficha,
        indice,
        plegar: (n) => (n === 1 ? "Ver la ciudad" : "Ver las " + n + " ciudades"),
        textos: {
          recorrido: "El recorrido pasa por cada ciudad. Pasa el cursor por el mapa para detenerlo.",
          error: "El globo no pudo cargarse. Las ciudades están en la lista.",
          sinResultados: "Aún no hay ciudades registradas."
        }
      });
    })
    .catch(() => {
      avisar(raiz, "No se pudo leer la lista de ciudades. Intenta más tarde.");
    });
}

const raiz = document.getElementById("globo-egresados");
if (raiz) GloboEgresados(raiz);
