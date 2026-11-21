import empresas from "../data/empresasUSBData.js";
import egresados from "../data/egresadosData.js";

function paises(lista) {
  return new Set(lista.map((empresa) => empresa.pais).filter(Boolean)).size;
}

function conEnlace(lista) {
  return lista.filter((empresa) => typeof empresa.fuente === "string" && empresa.fuente.indexOf("http") === 0).length;
}

const metricas = [
  { valor: empresas.length, etiqueta: "Empresas publicadas" },
  { valor: paises(empresas), etiqueta: "Países en el mapa" },
  { valor: egresados.length, etiqueta: "Perfiles de Orgullo USBista" },
  { valor: conEnlace(empresas), etiqueta: "Con enlace de fuente" }
];

function montar(raiz) {
  const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  raiz.innerHTML =
    '<h2 class="title">Red publicada</h2>' +
    '<p>Estas cifras cuentan solo las empresas y los perfiles de Orgullo USBista que publica la CESEG.</p>' +
    '<div class="ceseg-impacto">' +
    metricas.map((metrica) =>
      '<p class="ceseg-cifra"><strong data-count="' + metrica.valor + '">0</strong> ' + metrica.etiqueta + "</p>"
    ).join("") +
    "</div>";

  const cifras = raiz.querySelectorAll("strong[data-count]");
  let animado = false;

  function mostrarFinal() {
    for (let i = 0; i < cifras.length; i++) {
      cifras[i].textContent = cifras[i].getAttribute("data-count");
    }
  }

  function animar() {
    if (animado) return;
    animado = true;
    if (reducir || !("requestAnimationFrame" in window)) {
      mostrarFinal();
      return;
    }
    const inicio = performance.now();
    function cuadro(ahora) {
      const avance = Math.min(1, (ahora - inicio) / 800);
      for (let i = 0; i < cifras.length; i++) {
        const destino = parseInt(cifras[i].getAttribute("data-count"), 10);
        cifras[i].textContent = String(Math.round(destino * avance));
      }
      if (avance < 1) window.requestAnimationFrame(cuadro);
    }
    window.requestAnimationFrame(cuadro);
  }

  const panel = document.getElementById("panel-egresados");
  function visible() {
    return !panel || !panel.hidden;
  }

  if (visible()) animar();
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver((entradas) => {
      if (entradas.some((entrada) => entrada.isIntersecting) && visible()) {
        animar();
        observador.disconnect();
      }
    }, { threshold: 0.4 });
    observador.observe(raiz);
  }
  if (panel) {
    const cambios = new MutationObserver(() => {
      if (visible()) animar();
    });
    cambios.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  }
}

const raiz = document.getElementById("impacto-global");
if (raiz && !raiz.dataset.listo) {
  raiz.dataset.listo = "1";
  montar(raiz);
}
