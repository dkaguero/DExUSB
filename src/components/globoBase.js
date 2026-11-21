// Base común de los globos de la CESEG: carga globe.gl, dibuja una cebolla
// por punto, muestra la ficha, hace el recorrido y deja pasar el
// desplazamiento de la página en el teléfono.
import { montarCebollaSpinner } from "./cebollaSpinner.js";

export const LOGO = "public/assets/img/logo-usb-cebolla.svg";
export const MINI = '<img class="ceseg-mini-cebolla" src="' + LOGO + '" alt="" width="14" height="14">';
const GLOBE_SRC = "https://unpkg.com/globe.gl@2.46.2/dist/globe.gl.min.js";
const TIERRA = "https://unpkg.com/three-globe/example/img/earth-night.jpg";

export function escapar(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cargarGlobe() {
  if (window.Globe) return Promise.resolve(window.Globe);
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GLOBE_SRC;
    script.async = true;
    script.onload = () => {
      const publicado = window.Globe;
      resolve(typeof publicado === "function" ? publicado : publicado && publicado.default);
    };
    script.onerror = () => reject(new Error("globe"));
    document.head.appendChild(script);
  });
}

// opciones:
//   datos: lista inicial; cada punto lleva id, lat y lng
//   etiqueta(punto): nombre accesible de la cebolla
//   ficha(punto): HTML de la tarjeta
//   indice(lista): HTML de los <li> de la lista bajo el mapa
//   textos: { recorrido, error, sinResultados }
//   fijo: true para empezar sin recorrido, mirando el primer punto
export function montarGlobo(raiz, opciones) {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tactil = window.matchMedia("(pointer: coarse)").matches;
  const textos = opciones.textos;
  let visibles = opciones.datos.slice();
  let fijo = Boolean(opciones.fijo);

  const lista = document.createElement("ul");
  lista.className = "ceseg-globo-indice";
  lista.innerHTML = opciones.indice(visibles);
  // Con opciones.plegar(n), la lista queda cerrada tras un botón cuyo
  // texto da esa función (por ejemplo «Ver las 63 ciudades»).
  let pliegue = null;
  if (opciones.plegar) {
    pliegue = document.createElement("details");
    pliegue.className = "ceseg-globo-pliegue";
    const boton = document.createElement("summary");
    boton.textContent = opciones.plegar(visibles.length);
    pliegue.appendChild(boton);
    pliegue.appendChild(lista);
    raiz.insertAdjacentElement("afterend", pliegue);
  } else {
    raiz.insertAdjacentElement("afterend", lista);
  }
  const sinResultados = document.createElement("p");
  sinResultados.hidden = true;
  sinResultados.textContent = textos.sinResultados;
  (pliegue || lista).insertAdjacentElement("afterend", sinResultados);

  const tarjeta = document.createElement("div");
  tarjeta.className = "ceseg-globo-tarjeta";
  tarjeta.hidden = true;
  const aviso = document.createElement("p");
  aviso.className = "ceseg-globo-aviso";
  aviso.textContent = tactil
    ? "Toca para interactuar. Con un dedo la página sigue bajando."
    : textos.recorrido;
  let interactivo = !tactil;
  let spinner = null;
  tarjeta.addEventListener("pointerleave", (evento) => {
    if (evento.relatedTarget && activo && activo.contains(evento.relatedTarget)) return;
    ocultar();
  });

  let mundo = null;
  let activo = null;
  let listo = false;
  let puesto = 0;
  let pausado = false;
  let volando = false;
  let dentro = false;
  let timerTour = null;
  let timerReanudar = null;
  let timerFicha = null;
  const ESPERA = 5500;
  const VUELO = 2000;

  function marcar(boton) {
    if (activo) activo.classList.remove("ceseg-cebolla-activa");
    activo = boton || null;
    if (activo) activo.classList.add("ceseg-cebolla-activa");
  }

  function fichaAbierta() {
    return !tarjeta.hidden;
  }

  function mostrar(punto, boton) {
    marcar(boton);
    aviso.hidden = true;
    if (mundo && mundo.controls) mundo.controls().autoRotate = false;
    tarjeta.hidden = false;
    tarjeta.innerHTML = opciones.ficha(punto);
    const caja = raiz.getBoundingClientRect();
    const marca = boton.getBoundingClientRect();
    const ancho = Math.min(260, caja.width - 16);
    tarjeta.style.width = ancho + "px";
    const izquierda = marca.left - caja.left + marca.width / 2 - ancho / 2;
    tarjeta.style.left = Math.max(8, Math.min(izquierda, caja.width - ancho - 8)) + "px";
    // La ficha va sobre la cebolla; si no cabe, debajo. Si tampoco cabe
    // debajo, se ajusta para quedar entera dentro del globo (puede tapar la
    // cebolla: la ficha tiene prioridad). El CSS limita su alto al del globo.
    const alto = tarjeta.offsetHeight;
    const arriba = marca.top - caja.top - alto - 8;
    const abajo = marca.bottom - caja.top + 8;
    const limite = caja.height - alto - 8;
    let top;
    if (arriba >= 8) top = arriba;
    else if (abajo <= limite) top = abajo;
    else top = Math.max(8, Math.min(abajo, limite));
    tarjeta.style.top = top + "px";
  }

  function ocultar() {
    marcar(null);
    tarjeta.hidden = true;
    tarjeta.innerHTML = "";
    aviso.hidden = false;
  }

  function cebolla(punto) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "ceseg-cebolla";
    boton.dataset.id = punto.id;
    boton.setAttribute("aria-label", opciones.etiqueta(punto));
    boton.innerHTML =
      '<span class="ceseg-haz" aria-hidden="true"></span>' +
      '<img src="' + LOGO + '" alt="" width="28" height="28">';
    boton.addEventListener("pointerenter", () => mostrar(punto, boton));
    boton.addEventListener("focus", () => mostrar(punto, boton));
    boton.addEventListener("pointerleave", (evento) => {
      if (volando || evento.pointerType === "touch") return;
      if (evento.relatedTarget && tarjeta.contains(evento.relatedTarget)) return;
      ocultar();
    });
    boton.addEventListener("blur", (evento) => {
      if (evento.relatedTarget && tarjeta.contains(evento.relatedTarget)) return;
      ocultar();
    });
    boton.addEventListener("click", (evento) => {
      evento.stopPropagation();
      mostrar(punto, boton);
    });
    return boton;
  }

  function medir() {
    if (!mundo) return;
    const ancho = raiz.clientWidth;
    const alto = raiz.clientHeight;
    if (ancho < 20 || alto < 20) return;
    mundo.width(ancho);
    mundo.height(alto);
  }

  function soltarScroll(controles) {
    const lienzo = controles.domElement;
    lienzo.style.touchAction = "pan-y";
    let origen = null;
    lienzo.addEventListener("touchstart", (evento) => {
      if (evento.touches.length !== 1) {
        origen = null;
        controles.enabled = true;
        return;
      }
      origen = { x: evento.touches[0].clientX, y: evento.touches[0].clientY };
      controles.enabled = true;
    }, { passive: true });
    lienzo.addEventListener("touchmove", (evento) => {
      if (!origen || evento.touches.length !== 1) return;
      const dx = evento.touches[0].clientX - origen.x;
      const dy = evento.touches[0].clientY - origen.y;
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) controles.enabled = false;
    }, { passive: true });
    const soltar = () => {
      if (interactivo) controles.enabled = true;
      origen = null;
    };
    lienzo.addEventListener("touchend", soltar, { passive: true });
    lienzo.addEventListener("touchcancel", soltar, { passive: true });
  }

  function botonDe(punto) {
    const lista = raiz.querySelectorAll(".ceseg-cebolla");
    for (let i = 0; i < lista.length; i++) {
      if (lista[i].dataset.id === String(punto.id)) return lista[i];
    }
    return null;
  }

  function enfocar(destino, animar) {
    if (!mundo || !visibles.length) return;
    puesto = (destino + visibles.length) % visibles.length;
    const punto = visibles[puesto];
    const duracion = animar && !reducir ? VUELO : 0;
    volando = duracion > 0;
    mundo.controls().autoRotate = false;
    mundo.pointOfView({ lat: punto.lat, lng: punto.lng, altitude: 1.8 }, duracion);
    window.clearTimeout(timerFicha);
    const mostrarCuando = (intentos) => {
      volando = false;
      if (pausado || !mundo) return;
      const boton = botonDe(punto);
      if (!boton && intentos < 10) {
        timerFicha = window.setTimeout(() => mostrarCuando(intentos + 1), 150);
        return;
      }
      if (boton) mostrar(punto, boton);
      if (dentro) pausar();
    };
    timerFicha = window.setTimeout(() => mostrarCuando(0), duracion + 120);
  }

  function paso() {
    if (pausado || !mundo) return;
    enfocar(puesto + 1, true);
  }

  function iniciarTour() {
    window.clearInterval(timerTour);
    if (reducir || visibles.length < 2) return;
    pausado = false;
    enfocar(0, false);
    timerTour = window.setInterval(paso, ESPERA);
  }

  function pausar() {
    if (reducir) return;
    pausado = true;
    window.clearTimeout(timerReanudar);
    if (fichaAbierta()) return;
    aviso.hidden = false;
    aviso.textContent = "Recorrido en pausa. Continúa al salir del mapa.";
  }

  function programarReanudar() {
    if (reducir) return;
    window.clearTimeout(timerReanudar);
    timerReanudar = window.setTimeout(() => {
      if (dentro) return;
      pausado = false;
      enfocar(puesto, true);
    }, 4000);
  }

  function crear(Globe) {
    if (spinner) {
      spinner.quitar();
      spinner = null;
    }
    mundo = new Globe(raiz);
    mundo
      .globeImageUrl(TIERRA)
      .backgroundColor("#0b1329")
      .showAtmosphere(true)
      .atmosphereColor("#0055a5")
      .atmosphereAltitude(0.18)
      .htmlElementsData(visibles)
      .htmlTransitionDuration(0)
      .htmlLat((punto) => punto.lat)
      .htmlLng((punto) => punto.lng)
      .htmlAltitude(0.02)
      .htmlElement(cebolla)
      .htmlElementVisibilityModifier((elemento, visible) => {
        elemento.style.opacity = visible ? "1" : "0";
        elemento.style.pointerEvents = visible ? "auto" : "none";
      })
      .pointOfView({ lat: 28, lng: -20, altitude: 2.4 }, 0);

    medir();
    const controles = mundo.controls();
    controles.enablePan = false;
    controles.minDistance = 140;
    controles.maxDistance = 420;
    controles.zoomSpeed = 0.7;
    controles.autoRotate = false;
    controles.autoRotateSpeed = 0.5;
    controles.addEventListener("start", () => {
      controles.autoRotate = false;
      if (!volando) pausar();
    });
    soltarScroll(controles);
    if (!interactivo) controles.enabled = false;
    if (tactil) {
      const velo = document.createElement("div");
      velo.className = "ceseg-velo";
      velo.innerHTML =
        "<p>Con un dedo la página sigue bajando.</p>" +
        '<button type="button">Tocar para interactuar</button>';
      velo.querySelector("button").addEventListener("click", (evento) => {
        evento.stopPropagation();
        interactivo = true;
        controles.enabled = true;
        velo.remove();
      });
      raiz.appendChild(velo);
    }
    raiz.appendChild(tarjeta);
    raiz.appendChild(aviso);
    raiz.addEventListener("pointerover", () => {
      dentro = true;
      if (!volando) pausar();
    });
    raiz.addEventListener("pointerout", (evento) => {
      if (evento.relatedTarget && raiz.contains(evento.relatedTarget)) return;
      dentro = false;
      programarReanudar();
    });
    raiz.addEventListener("pointerdown", (evento) => {
      pausar();
      if (evento.target.closest(".ceseg-cebolla, .ceseg-globo-tarjeta")) return;
      ocultar();
    });
    raiz.addEventListener("pointerup", () => {
      if (!dentro) programarReanudar();
    });
    window.addEventListener("resize", medir);
    listo = true;
    if (fijo) {
      pausado = true;
      if (visibles.length) {
        mundo.pointOfView({ lat: visibles[0].lat, lng: visibles[0].lng, altitude: 1.8 }, 0);
      }
    } else {
      iniciarTour();
    }
  }

  function arrancar() {
    if (listo || raiz.clientWidth < 20) return;
    if (!spinner) spinner = montarCebollaSpinner(raiz, "Cargando el mapa");
    cargarGlobe()
      .then((Globe) => {
        if (!Globe) throw new Error("globe");
        if (!listo) crear(Globe);
      })
      .catch(() => {
        if (spinner) {
          spinner.quitar();
          spinner = null;
        }
        aviso.textContent = textos.error;
        raiz.appendChild(aviso);
      });
  }

  // Cambia los puntos visibles. Con fijo = true se detiene el recorrido
  // y la cámara mira el primer punto (lo usa el filtro de la Red Global).
  function actualizar(nuevos, opcionesCambio) {
    visibles = nuevos.slice();
    fijo = Boolean(opcionesCambio && opcionesCambio.fijo);
    lista.hidden = visibles.length === 0;
    if (pliegue) {
      pliegue.hidden = visibles.length === 0;
      pliegue.querySelector("summary").textContent = opciones.plegar(visibles.length);
    }
    sinResultados.hidden = visibles.length !== 0;
    lista.innerHTML = opciones.indice(visibles);
    if (!mundo) return;
    ocultar();
    mundo.htmlElementsData(visibles);
    window.clearInterval(timerTour);
    window.clearTimeout(timerFicha);
    volando = false;
    if (!visibles.length) return;
    if (fijo) {
      pausado = true;
      mundo.pointOfView({ lat: visibles[0].lat, lng: visibles[0].lng, altitude: 1.8 }, reducir ? 0 : 800);
      return;
    }
    if (!dentro) iniciarTour();
  }

  arrancar();
  return { actualizar };
}
