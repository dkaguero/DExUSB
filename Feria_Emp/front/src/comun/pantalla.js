// Botón de pantalla completa de los widgets de la feria y del auditorio.
// Si el navegador permite pantalla completa dentro del recuadro de Google
// Sites, la usa (Esc o el mismo botón para salir). Si no (iPhone, o el
// recuadro sin permiso), abre el widget en una pestaña propia, a ventana
// completa, con un botón «Cerrar» para volver.
(function (FE) {
  "use strict";

  // Copia del widget tal como llegó, antes de que el código lo modifique:
  // es la que se abre en la pestaña propia.
  var ORIGINAL = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  var EN_PESTANA = window.name === "fe-pantalla-completa";

  function permitida() {
    return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  }
  function activa() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function entrar(el) {
    var f = el.requestFullscreen || el.webkitRequestFullscreen;
    var r = f && f.call(el);
    return r && r.catch ? r : Promise.resolve();
  }
  function salir() {
    var f = document.exitFullscreen || document.webkitExitFullscreen;
    if (f) f.call(document);
  }

  function abrirPestana() {
    try {
      var url = URL.createObjectURL(new Blob([ORIGINAL], { type: "text/html" }));
      var w = window.open(url, "fe-pantalla-completa");
      if (w) return true;
    } catch (e) { /* sin permiso para abrir ventanas */ }
    return false;
  }

  // Conecta `boton` para poner a pantalla completa el elemento `el`.
  FE.pantallaCompleta = function (boton, el) {
    if (!boton) return;
    if (EN_PESTANA) {
      boton.textContent = "Cerrar";
      boton.title = "Cerrar la pantalla completa y volver al sitio";
      boton.addEventListener("click", function () { window.close(); });
      return;
    }
    function etiqueta() {
      var dentro = activa();
      boton.textContent = dentro ? "Salir de pantalla completa" : "Pantalla completa";
      boton.setAttribute("aria-pressed", String(dentro));
    }
    etiqueta();
    document.addEventListener("fullscreenchange", etiqueta);
    document.addEventListener("webkitfullscreenchange", etiqueta);
    boton.addEventListener("click", function () {
      if (activa()) { salir(); return; }
      if (permitida()) {
        entrar(el).catch(function () { if (!abrirPestana()) boton.textContent = "No disponible aquí"; });
      } else if (!abrirPestana()) {
        boton.textContent = "No disponible aquí";
      }
    });
  };
}(window.FE = window.FE || {}));
