import empresas from "../data/empresasUSBData.js";

const LOGO = "public/assets/img/logo-usb-cebolla.svg";
const GLOBE_SRC = "https://unpkg.com/globe.gl@2.46.2/dist/globe.gl.min.js";
const TIERRA = "https://unpkg.com/three-globe/example/img/earth-night.jpg";

function escapar(texto) {
  return String(texto || "")
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

function ficha(empresa) {
  const fundador = empresa.carrera
    ? "Fundador: " + escapar(empresa.fundador) + ", " + escapar(empresa.carrera)
    : "Fundador: " + escapar(empresa.fundador);
  const fuente = typeof empresa.fuente === "string" && empresa.fuente.indexOf("http") === 0
    ? '<a href="' + escapar(empresa.fuente) + '" target="_blank" rel="noopener">Ver fuente</a> · ' + escapar(empresa.fuenteTexto)
    : "Fuente: " + escapar(empresa.fuenteTexto);
  return (
    "<p><strong>" + escapar(empresa.empresa) + "</strong></p>" +
    "<p>" + fundador + "</p>" +
    "<p>" + escapar(empresa.ciudad) + ", " + escapar(empresa.pais) + "</p>" +
    (empresa.descripcion ? "<p>" + escapar(empresa.descripcion) + "</p>" : "") +
    '<p><span class="ceseg-badge">' + escapar(empresa.rubro) + "</span></p>" +
    '<p class="ceseg-fuente">' + fuente + "</p>" +
    '<p class="ceseg-fuente">' + escapar(empresa.verificacion) + "</p>"
  );
}

function indice(lista) {
  return lista.map((empresa) =>
    "<li><strong>" + escapar(empresa.empresa) + "</strong> · " +
    escapar(empresa.ciudad) + ", " + escapar(empresa.pais) + "</li>"
  ).join("");
}

export function GlobeUSB(raiz) {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tactil = window.matchMedia("(pointer: coarse)").matches;
  const panel = document.getElementById("panel-egresados");
  const lista = document.createElement("ul");
  lista.className = "ceseg-globo-indice";
  lista.innerHTML = indice(empresas);
  raiz.insertAdjacentElement("afterend", lista);

  const tarjeta = document.createElement("div");
  tarjeta.className = "ceseg-globo-tarjeta";
  tarjeta.hidden = true;
  const aviso = document.createElement("p");
  aviso.className = "ceseg-globo-aviso";
  aviso.textContent = tactil
    ? "Toca una cebolla para ver la empresa. El recorrido se detiene al tocar el mapa."
    : "El recorrido pasa por cada empresa. Pasa el cursor por el mapa para detenerlo.";
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

  function mostrar(empresa, boton) {
    marcar(boton);
    tarjeta.hidden = false;
    tarjeta.innerHTML = ficha(empresa);
    aviso.hidden = true;
    if (mundo && mundo.controls) mundo.controls().autoRotate = false;
    const caja = raiz.getBoundingClientRect();
    const marca = boton.getBoundingClientRect();
    const ancho = Math.min(260, caja.width - 16);
    tarjeta.style.width = ancho + "px";
    const izquierda = marca.left - caja.left + marca.width / 2 - ancho / 2;
    const arriba = marca.top - caja.top - tarjeta.offsetHeight - 8;
    tarjeta.style.left = Math.max(8, Math.min(izquierda, caja.width - ancho - 8)) + "px";
    tarjeta.style.top = (arriba > 8 ? arriba : marca.bottom - caja.top + 8) + "px";
  }

  function ocultar() {
    marcar(null);
    tarjeta.hidden = true;
    tarjeta.innerHTML = "";
    aviso.hidden = false;
  }

  function cebolla(empresa) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "ceseg-cebolla";
    boton.dataset.id = empresa.id;
    boton.setAttribute("aria-label", empresa.empresa);
    boton.innerHTML =
      '<span class="ceseg-haz" aria-hidden="true"></span>' +
      '<img src="' + LOGO + '" alt="" width="28" height="28">';
    boton.addEventListener("pointerenter", () => mostrar(empresa, boton));
    boton.addEventListener("focus", () => mostrar(empresa, boton));
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
      mostrar(empresa, boton);
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
      controles.enabled = true;
      origen = null;
    };
    lienzo.addEventListener("touchend", soltar, { passive: true });
    lienzo.addEventListener("touchcancel", soltar, { passive: true });
  }

  function botonDe(empresa) {
    return raiz.querySelector('.ceseg-cebolla[data-id="' + empresa.id + '"]');
  }

  function enfocar(destino, animar) {
    if (!mundo || !empresas.length) return;
    puesto = (destino + empresas.length) % empresas.length;
    const empresa = empresas[puesto];
    const duracion = animar && !reducir ? VUELO : 0;
    volando = duracion > 0;
    mundo.controls().autoRotate = false;
    mundo.pointOfView({ lat: empresa.lat, lng: empresa.lng, altitude: 1.8 }, duracion);
    window.clearTimeout(timerFicha);
    const mostrarCuando = (intentos) => {
      volando = false;
      if (pausado || !mundo) return;
      const boton = botonDe(empresa);
      if (!boton && intentos < 10) {
        timerFicha = window.setTimeout(() => mostrarCuando(intentos + 1), 150);
        return;
      }
      if (boton) mostrar(empresa, boton);
      if (dentro) pausar();
    };
    timerFicha = window.setTimeout(() => mostrarCuando(0), duracion + 120);
  }

  function paso() {
    if (pausado || !mundo || (panel && panel.hidden)) return;
    enfocar(puesto + 1, true);
  }

  function iniciarTour() {
    window.clearInterval(timerTour);
    if (reducir || empresas.length < 2) return;
    pausado = false;
    enfocar(0, false);
    timerTour = window.setInterval(paso, ESPERA);
  }

  function pausar() {
    if (reducir) return;
    pausado = true;
    window.clearTimeout(timerReanudar);
    if (!tarjeta.hidden) return;
    aviso.hidden = false;
    aviso.textContent = "Recorrido en pausa. Continúa al salir del mapa.";
  }

  function programarReanudar() {
    if (reducir) return;
    window.clearTimeout(timerReanudar);
    timerReanudar = window.setTimeout(() => {
      if (dentro || (panel && panel.hidden)) return;
      pausado = false;
      enfocar(puesto, true);
    }, 4000);
  }

  function crear(Globe) {
    mundo = new Globe(raiz);
    mundo
      .globeImageUrl(TIERRA)
      .backgroundColor("#0b1329")
      .showAtmosphere(true)
      .atmosphereColor("#0055a5")
      .atmosphereAltitude(0.18)
      .htmlElementsData(empresas)
      .htmlLat((empresa) => empresa.lat)
      .htmlLng((empresa) => empresa.lng)
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
    iniciarTour();
  }

  function arrancar() {
    if (listo || !panel || panel.hidden || raiz.clientWidth < 20) return;
    cargarGlobe()
      .then((Globe) => {
        if (!Globe || listo) {
          if (!Globe) throw new Error("globe");
          return;
        }
        crear(Globe);
      })
      .catch(() => {
        aviso.textContent = "El globo no pudo cargarse. Las empresas publicadas están en la lista.";
      });
  }

  if (panel) {
    const observador = new MutationObserver(() => {
      if (panel.hidden) {
        pausado = true;
        window.clearTimeout(timerReanudar);
        return;
      }
      arrancar();
      if (listo && !dentro) programarReanudar();
    });
    observador.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  }
  arrancar();
}

const raiz = document.getElementById("globe-usb");
if (raiz) GlobeUSB(raiz);
