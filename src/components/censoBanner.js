// Banner del Censo de Egresados (Inicio y Egresados).
// El HTML del banner ya trae el título y el botón al formulario: funciona
// aunque esto no cargue. Este módulo solo llena el contador con las cifras de
// la hoja «Ciudades CESEG» (la misma del globo) y lo muestra si hay datos.
import { cargarCiudades, direccion, totales } from "./ciudadesCSV.js";

const reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function contar(nodo, meta) {
  if (reducir || !("requestAnimationFrame" in window)) {
    nodo.textContent = String(meta);
    return;
  }
  const inicio = performance.now();
  function cuadro(ahora) {
    const avance = Math.min(1, (ahora - inicio) / 900);
    nodo.textContent = String(Math.round(meta * avance));
    if (avance < 1) window.requestAnimationFrame(cuadro);
  }
  window.requestAnimationFrame(cuadro);
}

function montar(banner) {
  const cifra = banner.querySelector(".ceseg-censo-cifra");
  const url = direccion(banner);
  if (!cifra || !url) return;
  cargarCiudades(url)
    .then((ciudades) => {
      const t = totales(ciudades);
      if (!t.egresados) return;
      const plural = (n, uno, varios) => (n === 1 ? uno : varios);
      cifra.innerHTML =
        '<strong data-n="' + t.egresados + '">0</strong> ' +
        plural(t.egresados, "egresado ya se registró", "egresados ya se registraron") +
        ' en <strong data-n="' + t.ciudades + '">0</strong> ' + plural(t.ciudades, "ciudad", "ciudades") +
        ' de <strong data-n="' + t.paises + '">0</strong> ' + plural(t.paises, "país", "países") + ".";
      cifra.hidden = false;
      const numeros = cifra.querySelectorAll("strong[data-n]");
      const arrancar = () => numeros.forEach((n) => contar(n, parseInt(n.getAttribute("data-n"), 10)));
      if (!("IntersectionObserver" in window)) {
        arrancar();
        return;
      }
      const observador = new IntersectionObserver((entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          observador.disconnect();
          arrancar();
        }
      }, { threshold: 0.5 });
      observador.observe(cifra);
    })
    .catch(() => {});
}

document.querySelectorAll(".ceseg-censo[data-csv]").forEach(montar);
