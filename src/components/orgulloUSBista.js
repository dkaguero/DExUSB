import egresados from "../data/egresadosData.js";
import empresas from "../data/empresasUSBData.js";
import { alCambiarFiltro, filtrarEmpresas } from "./filtroRed.js";

const ORDEN = [
  "Aeroespacial & Ciencia",
  "Inteligencia Artificial",
  "Tech & Software",
  "Corporativo & Energía",
  "Deporte de alto rendimiento",
  "Academia"
];

function iniciales(nombre) {
  const partes = nombre.split(/\s+/).filter((parte) => !/^(de|del|la|las|y)$/i.test(parte));
  return (partes[0][0] + (partes[1] ? partes[1][0] : "")).toUpperCase();
}

function ordenar(lista) {
  return lista.slice().sort((a, b) => {
    if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}

function categoriasPresentes() {
  const usadas = new Set(egresados.map((persona) => persona.categoría));
  return ORDEN.filter((nombre) => usadas.has(nombre));
}

function escapar(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function retrato(persona) {
  const letras = iniciales(persona.nombre);
  if (!persona.fotoUrl) {
    return '<span class="ceseg-inicial" aria-hidden="true">' + letras + "</span>";
  }
  return '<img class="ceseg-foto" src="' + escapar(persona.fotoUrl) + '" alt="" data-iniciales="' + letras + '">';
}

function tarjeta(persona) {
  const estudio = [persona.carrera, persona.cohorte].filter(Boolean).join(" · ");
  const lugar = persona.ubicación
    ? '<span class="ceseg-badge"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ' + escapar(persona.ubicación) + "</span>"
    : "";
  const fuente = pieFuente(persona);
  return (
    '<article class="ceseg-caso ceseg-panel">' +
    "<header>" + retrato(persona) +
    ' <span class="ceseg-badge">' + escapar(persona.categoría) + "</span>" +
    (persona.destacado ? '<span class="ceseg-badge ceseg-destacado">Egresado destacado</span>' : "") +
    lugar +
    "</header>" +
    "<p><strong>" + escapar(persona.nombre) + "</strong></p>" +
    "<p>Talento USBista</p>" +
    (estudio ? "<p>" + escapar(estudio) + "</p>" : "") +
    (persona.cargo ? "<p>" + escapar(persona.cargo) + "</p>" : "") +
    "<p>" + escapar(persona.logro) + "</p>" +
    fuente +
    "</article>"
  );
}

const MINI = '<img class="ceseg-mini-cebolla" src="public/assets/img/logo-usb-cebolla.svg" alt="" width="14" height="14">';

function pieFuente(persona) {
  if (!persona.fuente) return "";
  const nombre = persona.fuenteTexto || (/usbnoticias\.usb\.ve/i.test(persona.fuente) ? "USB Noticias" : "Referencia");
  const marca = MINI + "Fuente verificada · ";
  if (!/^https?:\/\//i.test(persona.fuente)) {
    return '<p class="ceseg-fuente">' + marca + escapar(persona.fuente) + "</p>";
  }
  return '<p class="ceseg-fuente">' + marca + '<a href="' + escapar(persona.fuente) + '" target="_blank" rel="noopener">Ver fuente</a> · ' + escapar(nombre) + "</p>";
}

export function OrgulloUSBistaCarousel(raiz) {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let categoria = "Todos";
  let filtro = { texto: "", rubro: "", region: "", fuente: "" };
  let indice = 0;
  let timer = null;
  let pausado = false;

  raiz.innerHTML =
    '<h2 class="title">Orgullo USBista</h2>' +
    '<p>Cada ficha usa solo el dato que aparece en la fuente enlazada.</p>' +
    '<div class="ceseg-filtros" role="group" aria-label="Filtrar Orgullo USBista por categoría"></div>' +
    '<div class="ceseg-controles">' +
    '<button type="button" data-dir="-1" aria-label="Ficha anterior">Anterior</button>' +
    '<button type="button" data-dir="1" aria-label="Ficha siguiente">Siguiente</button>' +
    "</div>" +
    '<div class="ceseg-orgullo-ventana">' +
    '<div class="ceseg-carril" id="orgullo-carril" tabindex="0" aria-label="Orgullo USBista"></div>' +
    "</div>" +
    '<div class="ceseg-puntos" role="tablist" aria-label="Fichas de Orgullo USBista"></div>' +
    '<p class="ceseg-orgullo-vacio" hidden>Ningún perfil de Orgullo USBista coincide con este filtro.</p>';

  const filtros = raiz.querySelector(".ceseg-filtros");
  const carril = raiz.querySelector(".ceseg-carril");
  const puntos = raiz.querySelector(".ceseg-puntos");
  const vacio = raiz.querySelector(".ceseg-orgullo-vacio");

  function vinculado(persona, listaEmpresas) {
    const nombre = persona.nombre.toLowerCase();
    const cargo = (persona.cargo || "").toLowerCase();
    const logro = (persona.logro || "").toLowerCase();
    return listaEmpresas.some((empresa) => {
      const fundador = empresa.fundador.toLowerCase();
      const nombreEmpresa = empresa.empresa.toLowerCase();
      return fundador.indexOf(nombre) !== -1 ||
        (cargo && cargo.indexOf(nombreEmpresa) !== -1) ||
        (logro && logro.indexOf(nombreEmpresa) !== -1);
    });
  }

  function lista() {
    let base = categoria === "Todos" ? egresados : egresados.filter((persona) => persona.categoría === categoria);
    const q = (filtro.texto || "").trim().toLowerCase();
    if (q) {
      base = base.filter((persona) =>
        (persona.nombre + " " + persona.carrera + " " + persona.cargo + " " + persona.ubicación + " " + persona.logro)
          .toLowerCase()
          .indexOf(q) !== -1
      );
    }
    if (filtro.rubro || filtro.region || filtro.fuente) {
      const publicadas = filtrarEmpresas(empresas, filtro);
      base = base.filter((persona) => vinculado(persona, publicadas));
    }
    return ordenar(base);
  }

  function pintarFiltros() {
    const nombres = ["Todos"].concat(categoriasPresentes());
    filtros.innerHTML = nombres.map((nombre) =>
      '<button type="button" aria-pressed="' + (nombre === categoria) + '">' + escapar(nombre) + "</button>"
    ).join("");
  }

  function ir(nuevo, animar) {
    const personas = lista();
    if (!personas.length) return;
    indice = (nuevo + personas.length) % personas.length;
    const ficha = carril.children[indice];
    if (!ficha) return;
    carril.scrollTo({
      left: ficha.offsetLeft,
      behavior: animar && !reducir ? "smooth" : "auto"
    });
    marcarPunto();
  }

  function marcarPunto() {
    const botones = puntos.querySelectorAll("button");
    for (let i = 0; i < botones.length; i++) {
      if (i === indice) botones[i].setAttribute("aria-current", "true");
      else botones[i].removeAttribute("aria-current");
    }
  }

  function pintar() {
    const personas = lista();
    indice = 0;
    carril.innerHTML = personas.map(tarjeta).join("");
    puntos.innerHTML = personas.map((persona, i) =>
      '<button type="button" aria-label="' + escapar(persona.nombre) + '"' + (i === 0 ? ' aria-current="true"' : "") + "></button>"
    ).join("");
    vacio.hidden = personas.length > 0;
    carril.hidden = personas.length === 0;
    carril.scrollLeft = 0;
    const imagenes = carril.querySelectorAll("img.ceseg-foto");
    for (let i = 0; i < imagenes.length; i++) {
      imagenes[i].addEventListener("error", function () {
        const reemplazo = document.createElement("span");
        reemplazo.className = "ceseg-inicial";
        reemplazo.setAttribute("aria-hidden", "true");
        reemplazo.textContent = this.getAttribute("data-iniciales");
        this.replaceWith(reemplazo);
      });
    }
  }

  function arrancar() {
    detener();
    if (reducir || pausado || lista().length < 2) return;
    timer = window.setInterval(() => ir(indice + 1, true), 7000);
  }

  function detener() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  filtros.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    categoria = boton.textContent;
    pintarFiltros();
    pintar();
    arrancar();
  });

  raiz.querySelector(".ceseg-controles").addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    ir(indice + Number(boton.getAttribute("data-dir")), true);
    arrancar();
  });

  puntos.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    const todos = Array.prototype.slice.call(puntos.querySelectorAll("button"));
    ir(todos.indexOf(boton), true);
    arrancar();
  });

  carril.addEventListener("scroll", () => {
    const ancho = carril.clientWidth || 1;
    const actual = Math.round(carril.scrollLeft / ancho);
    if (actual === indice) return;
    indice = actual;
    marcarPunto();
  });

  carril.addEventListener("pointerdown", () => {
    pausado = true;
    detener();
  });
  carril.addEventListener("pointerup", () => {
    pausado = false;
    arrancar();
  });

  raiz.addEventListener("mouseenter", () => { pausado = true; detener(); });
  raiz.addEventListener("mouseleave", () => { pausado = false; arrancar(); });
  raiz.addEventListener("focusin", () => { pausado = true; detener(); });
  raiz.addEventListener("focusout", () => { pausado = false; arrancar(); });

  const buscar = document.getElementById("ceseg-buscar");
  if (buscar) {
    buscar.addEventListener("input", () => {
      const q = buscar.value.trim().toLowerCase();
      if (!q) return;
      const personas = lista();
      const hallado = personas.findIndex((persona) =>
        (persona.nombre + " " + persona.carrera + " " + persona.logro).toLowerCase().indexOf(q) !== -1
      );
      if (hallado >= 0) ir(hallado, !reducir);
    });
  }

  pintarFiltros();
  alCambiarFiltro((siguiente) => {
    filtro = siguiente;
    pintar();
    arrancar();
  });
}

const raiz = document.getElementById("orgullo-usbista");
if (raiz) OrgulloUSBistaCarousel(raiz);
