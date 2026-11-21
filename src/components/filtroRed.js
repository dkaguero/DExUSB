import { cargarEmpresas } from "../data/fuentes.js";

// Región de cada país, para el filtro. Las empresas llegan del formulario de
// la CESEG desde cualquier país, así que la lista cubre todos los continentes.
const REGIONES = {
  "Norteamérica": ["Estados Unidos", "Canadá"],
  "Latinoamérica": ["Venezuela", "México", "Colombia", "Argentina", "Chile", "Perú", "Ecuador",
    "Uruguay", "Paraguay", "Bolivia", "Brasil", "Panamá", "Costa Rica", "República Dominicana",
    "Puerto Rico", "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Cuba"],
  "Europa": ["Alemania", "España", "Francia", "Italia", "Portugal", "Reino Unido", "Irlanda",
    "Países Bajos", "Bélgica", "Suiza", "Austria", "Suecia", "Noruega", "Dinamarca", "Finlandia",
    "Polonia", "Hungría", "República Checa", "Grecia"],
  "Asia y Oceanía": ["Japón", "China", "Corea del Sur", "India", "Singapur", "Emiratos Árabes Unidos",
    "Israel", "Australia", "Nueva Zelanda"],
  "África": ["Sudáfrica", "Marruecos", "Egipto", "Nigeria", "Kenia"]
};
const REGION = {};
Object.keys(REGIONES).forEach((region) => {
  REGIONES[region].forEach((pais) => { REGION[pais] = region; });
});

const estado = { texto: "", rubro: "", region: "", fuente: "" };
const oyentes = new Set();

export function regionDe(pais) {
  return REGION[pais] || (pais ? "Otras regiones" : "");
}

export function filtrarEmpresas(lista, filtro) {
  const q = (filtro.texto || "").trim().toLowerCase();
  return lista.filter((empresa) => {
    if (filtro.rubro && empresa.rubro !== filtro.rubro) return false;
    if (filtro.region && regionDe(empresa.pais) !== filtro.region) return false;
    if (filtro.fuente && empresa.fuenteTexto !== filtro.fuente) return false;
    if (!q) return true;
    const bolsa = (empresa.empresa + " " + empresa.fundador + " " + empresa.ciudad + " " + empresa.pais).toLowerCase();
    return bolsa.indexOf(q) !== -1;
  });
}

export function filtroActivo(filtro) {
  return !!(filtro.texto || filtro.rubro || filtro.region || filtro.fuente);
}

export function alCambiarFiltro(fn) {
  oyentes.add(fn);
  fn(Object.assign({}, estado));
  return function () { oyentes.delete(fn); };
}

function avisar() {
  const copia = Object.assign({}, estado);
  oyentes.forEach((fn) => fn(copia));
}

function unicos(empresas, campo) {
  return Array.from(new Set(empresas.map((empresa) => empresa[campo]).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "es"));
}

function escapar(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function opciones(valores, actual, etiquetaTodas) {
  const todas = '<option value="">' + escapar(etiquetaTodas) + "</option>";
  return todas + valores.map((valor) =>
    '<option value="' + escapar(valor) + '"' + (valor === actual ? " selected" : "") + ">" + escapar(valor) + "</option>"
  ).join("");
}

function montar(raiz, empresas) {
  const rubros = unicos(empresas, "rubro");
  const fuentes = unicos(empresas, "fuenteTexto");
  const regiones = Array.from(new Set(empresas.map((empresa) => regionDe(empresa.pais)).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "es"));
  const total = empresas.length;

  raiz.innerHTML =
    '<form class="ceseg-filtro-red" role="search" aria-label="Filtrar empresas publicadas">' +
    "<label>Empresa, fundador o ciudad" +
    '<input type="search" data-campo="texto" placeholder="Escribe para filtrar"></label>' +
    "<label>Rubro" +
    '<select data-campo="rubro">' + opciones(rubros, "", "Todos") + "</select></label>" +
    '<div class="ceseg-filtros" role="group" aria-label="Región"></div>' +
    "<label>Fuente" +
    '<select data-campo="fuente">' + opciones(fuentes, "", "Todas") + "</select></label>" +
    '<p class="ceseg-filtro-cuenta" aria-live="polite"></p>' +
    '<p class="ceseg-controles"><button type="button" data-limpiar hidden>Limpiar filtros</button></p>' +
    "</form>";

  const form = raiz.querySelector("form");
  const cuenta = raiz.querySelector(".ceseg-filtro-cuenta");
  const limpiar = raiz.querySelector("[data-limpiar]");
  const grupo = raiz.querySelector(".ceseg-filtros");

  function pintarRegion() {
    const nombres = ["Todas"].concat(regiones);
    grupo.innerHTML = nombres.map((nombre) => {
      const valor = nombre === "Todas" ? "" : nombre;
      const activo = estado.region === valor;
      return '<button type="button" data-region="' + escapar(valor) + '" aria-pressed="' + activo + '">' + escapar(nombre) + "</button>";
    }).join("");
  }

  function pintarCuenta() {
    const n = filtrarEmpresas(empresas, estado).length;
    cuenta.textContent = "Mostrando " + n + " de " + total + " empresas publicadas.";
    limpiar.hidden = !filtroActivo(estado);
  }

  form.addEventListener("input", (evento) => {
    const campo = evento.target.getAttribute("data-campo");
    if (!campo || campo === "region") return;
    estado[campo] = evento.target.value;
    pintarCuenta();
    avisar();
  });
  form.addEventListener("change", (evento) => {
    const campo = evento.target.getAttribute("data-campo");
    if (!campo) return;
    estado[campo] = evento.target.value;
    pintarCuenta();
    avisar();
  });
  grupo.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    estado.region = boton.getAttribute("data-region") || "";
    pintarRegion();
    pintarCuenta();
    avisar();
  });
  limpiar.addEventListener("click", () => {
    estado.texto = "";
    estado.rubro = "";
    estado.region = "";
    estado.fuente = "";
    form.reset();
    pintarRegion();
    pintarCuenta();
    avisar();
  });

  pintarRegion();
  pintarCuenta();
}

const raiz = document.getElementById("filtro-red");
if (raiz && !raiz.dataset.listo) {
  raiz.dataset.listo = "1";
  cargarEmpresas().then((empresas) => montar(raiz, empresas));
}
