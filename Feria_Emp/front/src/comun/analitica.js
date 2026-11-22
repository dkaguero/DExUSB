// Analítica de los widgets: anota visitas y clics y los manda en lotes al
// receptor de visitas (aplicación web de Apps Script, `url_receptor`). Sin datos
// personales: solo un identificador anónimo del visitante, generado aquí.
(function (FE) {
  "use strict";

  var cola = [];
  var visitante = null;

  function idVisitante() {
    if (visitante) return visitante;
    var nuevo = "v" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    try {
      visitante = localStorage.getItem("feria-visitante");
      if (!visitante) { visitante = nuevo; localStorage.setItem("feria-visitante", visitante); }
    } catch (e) { visitante = nuevo; }
    return visitante;
  }

  function receptor() {
    return FE.DATOS && FE.DATOS.enlaces && FE.DATOS.enlaces.receptor;
  }

  function enviar() {
    var url = receptor();
    if (!url || !cola.length) return;
    var lote = JSON.stringify(cola.splice(0, 50));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url, new Blob([lote], { type: "text/plain" }))) return;
    } catch (e) { /* se intenta con fetch */ }
    try { fetch(url, { method: "POST", mode: "no-cors", body: lote, keepalive: true }); } catch (e) {}
  }

  // tipo: uno de los TIPOS_EVENTO del Apps Script. empresa, vacante y detalle son opcionales.
  FE.registrar = function (tipo, empresa, vacante, detalle) {
    cola.push({ t: tipo, e: empresa || "", v: vacante || "", u: idVisitante(), d: detalle || "" });
    if (cola.length >= 20) enviar();
  };

  setInterval(enviar, 15000);
  window.addEventListener("pagehide", enviar);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") enviar(); });
}(window.FE = window.FE || {}));
