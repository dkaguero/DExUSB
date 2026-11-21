// Lectura de la hoja pública «Ciudades CESEG» (pais, ciudad, lat, lng, egresados).
// La usan el globo de Egresados y el banner del censo. Cada dirección se
// descarga una sola vez por página, aunque la pidan los dos.

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

export function normal(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

// Convierte las filas en una entrada por ciudad. Si la hoja trae dos filas
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

// Totales para el resumen y el banner.
export function totales(ciudades) {
  return {
    egresados: ciudades.reduce((suma, c) => suma + c.egresados, 0),
    ciudades: ciudades.length,
    paises: new Set(ciudades.map((c) => normal(c.pais))).size
  };
}

const DEMO = "src/data/egresadosMundoDemo.csv";
const cache = new Map();

// Devuelve la dirección a usar: con ?demo en la página, el CSV de prueba.
export function direccion(elemento) {
  if (/[?&]demo\b/.test(location.search)) return DEMO;
  return (elemento.getAttribute("data-csv") || "").trim();
}

// Promesa con la lista de ciudades; una sola descarga por dirección.
export function cargarCiudades(url) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url, { cache: "no-store" })
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error("csv");
        return respuesta.text();
      })
      .then(ciudadesDesdeCSV));
  }
  return cache.get(url);
}
