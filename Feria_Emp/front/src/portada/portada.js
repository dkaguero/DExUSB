// Widget «portada-feria»: nombre, fechas y estado de la edición, los planes con
// «Reservar mi espacio» y los patrocinantes. Todo sale de la hoja pública.
(function (FE) {
  "use strict";

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fecha(texto, finDelDia) {
    if (!texto) return null;
    var d = new Date(String(texto).slice(0, 10) + "T00:00:00-04:00");
    if (isNaN(d)) return null;
    if (finDelDia) d = new Date(d.getTime() + 86400000 - 1);
    return d;
  }
  function larga(d) {
    return d.toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Caracas" });
  }

  // Mismo cálculo que estadoEdicion_ del Apps Script.
  function estado(E) {
    var ahora = new Date();
    var ci = E.convocatoria && fecha(E.convocatoria.inicio), cf = E.convocatoria && fecha(E.convocatoria.fin, true);
    var fi = E.fechas && fecha(E.fechas.inicio), ff = E.fechas && fecha(E.fechas.fin, true);
    if (ff && ahora > new Date(ff.getTime() + (E.consultaDias || 15) * 86400000)) return { t: "Edición cerrada", c: "cerrada" };
    if (ff && ahora > ff) return { t: "Feria finalizada · empresas en consulta", c: "cerrada" };
    if (fi && ahora >= fi) return { t: "¡Feria en curso!", c: "vivo" };
    if (cf && ahora > cf) return { t: "Convocatoria cerrada · pronto abre la feria", c: "pronto" };
    if (ci && ahora >= ci) return { t: "Convocatoria abierta para empresas", c: "abierta" };
    return { t: "Próximamente", c: "pronto" };
  }

  function boton(texto, url, clase) {
    if (!url) return '<span class="po-boton po-boton--off ' + (clase || "") + '">' + esc(texto) + "<small>Disponible pronto</small></span>";
    return '<a class="po-boton ' + (clase || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(texto) + "</a>";
  }

  function pintar() {
    var D = FE.DATOS, E = D.edicion;
    var e = estado(E);
    var fi = E.fechas && fecha(E.fechas.inicio), ff = E.fechas && fecha(E.fechas.fin);
    var fechas = fi ? (ff && ff.getTime() !== fi.getTime() ? "Del " + larga(fi) + " al " + larga(ff) : larga(fi)) : "Fechas por anunciar";
    var conv = E.convocatoria && fecha(E.convocatoria.inicio)
      ? "Convocatoria para empresas: " + larga(fecha(E.convocatoria.inicio)) + (E.convocatoria.fin ? " al " + larga(fecha(E.convocatoria.fin)) : "") : "";
    document.getElementById("po-cabeza").innerHTML =
      '<span class="po-estado po-estado--' + e.c + '">' + esc(e.t) + "</span>" +
      "<h1>" + esc(E.nombre) + "</h1>" +
      '<p class="po-fechas">' + esc(fechas) + "</p>" + (conv ? '<p class="po-conv">' + esc(conv) + "</p>" : "");

    document.getElementById("po-planes").innerHTML = D.planes.map(function (p) {
      return '<article class="po-plan po-plan--' + esc(p.id) + '">' +
        "<h2>" + esc(p.nombre) + "</h2>" +
        '<p class="po-precio">' + esc(p.precio) + " $</p>" +
        '<p class="po-forma">' + esc(p.forma || "") + " · posiciones " + esc(p.desde) + "-" + esc(p.hasta) + "</p>" +
        "<ul>" + (p.beneficios || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
        boton("Reservar mi espacio", D.enlaces.registroEmpresa, "po-boton--principal") +
        "</article>";
    }).join("");
    document.getElementById("po-nota").textContent =
      "La CESEG aprueba cada empresa y confirma el pago antes de ubicarla en su stand. El pago se coordina directamente con la CESEG.";

    var pat = D.patrocinantes || [];
    document.getElementById("po-patrocinantes").hidden = !pat.length;
    document.getElementById("po-logos").innerHTML = pat.map(function (p) {
      var img = p.logo ? '<img src="' + esc(p.logo) + '" alt="' + esc(p.nombre) + '">' : "<span>" + esc(p.nombre) + "</span>";
      return p.web ? '<a href="' + esc(p.web) + '" target="_blank" rel="noopener" title="' + esc(p.nombre) + '">' + img + "</a>" : '<span title="' + esc(p.nombre) + '">' + img + "</span>";
    }).join("");
  }

  function iniciar() {
    pintar();
    FE.cargarDatos().then(function () { pintar(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
}(window.FE = window.FE || {}));
