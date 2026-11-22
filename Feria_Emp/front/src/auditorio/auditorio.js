// Widget «auditorio»: la sala del Conjunto de Auditorios vista desde las
// gradas (acabado A+ del original), con el video de YouTube de la charla en
// curso dentro de la pantalla. Sin charla en curso, la pantalla muestra la
// próxima con cuenta regresiva. Debajo, la agenda del día.
(function (FE) {
  "use strict";

  var D = FE.DATOS;
  var SALA = FE.SALA;
  var caja, img, iframe, cartel, agenda, enVivo;

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Id de un video de YouTube (watch, youtu.be, live o embed).
  function idYouTube(url) {
    var m = String(url || "").match(/(?:v=|youtu\.be\/|\/live\/|\/embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function charlas() {
    return D.charlas.map(function (c) {
      var ini = new Date(c.inicio);
      return { titulo: c.titulo, empresa: c.empresa, inicio: ini, fin: new Date(ini.getTime() + (c.duracion || 30) * 60000), youtube: c.youtube };
    }).filter(function (c) { return !isNaN(c.inicio); }).sort(function (a, b) { return a.inicio - b.inicio; });
  }

  function hora(d) {
    return d.toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit", timeZone: "America/Caracas" });
  }
  function mismoDia(a, b) {
    var f = function (d) { return d.toLocaleDateString("es-VE", { timeZone: "America/Caracas" }); };
    return f(a) === f(b);
  }

  // Coloca el video (o el cartel) sobre la pantalla de la imagen.
  function colocar() {
    var r = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 16 / 9;
    var box = caja.getBoundingClientRect();
    var w = box.width, h = box.height, iw, ih;
    if (w / h > r) { ih = h; iw = h * r; } else { iw = w; ih = w / r; }
    var x0 = (w - iw) / 2, y0 = (h - ih) / 2;
    var pw = SALA.pantalla.w * iw, ph = pw * 9 / 16;
    [iframe, cartel].forEach(function (el) {
      el.style.left = (x0 + SALA.pantalla.x * iw) + "px";
      el.style.top = (y0 + SALA.pantalla.y * ih) + "px";
      el.style.width = pw + "px";
      el.style.height = ph + "px";
    });
  }

  function actualizar() {
    var ahora = new Date();
    var lista = charlas();
    var actual = lista.filter(function (c) { return c.inicio <= ahora && ahora < c.fin; })[0];
    var proxima = lista.filter(function (c) { return c.inicio > ahora; })[0];

    var id = actual && idYouTube(actual.youtube);
    if (id) {
      var src = "https://www.youtube.com/embed/" + id + "?autoplay=1&mute=1&rel=0";
      if (iframe.getAttribute("src") !== src) {
        iframe.setAttribute("src", src);
        if (FE.registrar) FE.registrar("charla_vista", "", "", actual.titulo);
      }
      iframe.hidden = false;
      cartel.hidden = true;
      enVivo.textContent = "En vivo: " + actual.titulo;
    } else {
      iframe.hidden = true;
      iframe.removeAttribute("src");
      cartel.hidden = false;
      if (proxima) {
        var falta = proxima.inicio - ahora, min = Math.floor(falta / 60000);
        var cuenta = min >= 1440 ? Math.floor(min / 1440) + " d " + Math.floor((min % 1440) / 60) + " h"
          : min >= 60 ? Math.floor(min / 60) + " h " + (min % 60) + " min" : min + " min";
        cartel.innerHTML = "<small>Próxima charla</small><b>" + esc(proxima.titulo) + "</b><span>" + esc(proxima.empresa || "") +
          "</span><em>Empieza en " + cuenta + "</em>";
      } else {
        cartel.innerHTML = "<small>Auditorio CESEG</small><b>No hay charlas programadas</b><span>La agenda se publicará aquí.</span>";
      }
      enVivo.textContent = "";
    }

    var hoy = lista.filter(function (c) { return mismoDia(c.inicio, ahora); });
    var futuras = lista.filter(function (c) { return c.inicio > ahora && !mismoDia(c.inicio, ahora); }).slice(0, 5);
    var fila = function (c) {
      var estado = c.inicio <= ahora && ahora < c.fin ? '<span class="au-vivo">En vivo</span>' : c.fin <= ahora ? '<span class="au-fin">Terminó</span>' : "";
      var grab = c.fin <= ahora && idYouTube(c.youtube)
        ? ' <a href="https://www.youtube.com/watch?v=' + idYouTube(c.youtube) + '" target="_blank" rel="noopener">Ver grabación</a>' : "";
      return "<li><time>" + hora(c.inicio) + "</time><div><b>" + esc(c.titulo) + "</b><small>" + esc(c.empresa || "") + "</small>" + grab + "</div>" + estado + "</li>";
    };
    agenda.innerHTML =
      (hoy.length ? "<h2>Agenda de hoy</h2><ul>" + hoy.map(fila).join("") + "</ul>" : "<h2>Agenda de hoy</h2><p>Hoy no hay charlas.</p>") +
      (futuras.length ? "<h2>Próximas</h2><ul>" + futuras.map(function (c) {
        return "<li><time>" + c.inicio.toLocaleDateString("es-VE", { day: "numeric", month: "short", timeZone: "America/Caracas" }) + " " + hora(c.inicio) +
          "</time><div><b>" + esc(c.titulo) + "</b><small>" + esc(c.empresa || "") + "</small></div></li>";
      }).join("") + "</ul>" : "");
  }

  function boton(texto, url, clase) {
    if (!url) return '<span class="au-boton au-boton--off ' + (clase || "") + '">' + esc(texto) + "<small>Disponible pronto</small></span>";
    return '<a class="au-boton ' + (clase || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(texto) + "</a>";
  }

  function iniciar() {
    caja = document.getElementById("au-caja");
    img = document.getElementById("au-img");
    iframe = document.getElementById("au-video");
    cartel = document.getElementById("au-cartel");
    agenda = document.getElementById("au-agenda");
    enVivo = document.getElementById("au-envivo");
    FE.pantallaCompleta(document.getElementById("au-pantalla"), document.getElementById("au-app"));
    var grande = window.innerWidth * (window.devicePixelRatio || 1) > 1400;
    img.src = SALA.imagenes[grande ? "2560" : "1280"] || SALA.imagenes["1280"];
    img.onload = colocar;
    document.getElementById("au-acciones").innerHTML =
      boton("Ver en vivo en el canal de CESEG", D.enlaces.youtubeCanal, "au-boton--principal") +
      boton("Agenda completa", D.enlaces.calendario);
    window.addEventListener("resize", colocar);
    actualizar();
    colocar();
    setInterval(actualizar, 30000);
    // Agenda real desde la hoja pública (si está configurada).
    FE.cargarDatos().then(function (ok) {
      if (FE.registrar) FE.registrar("auditorio_vista");
      if (!ok) return;
      D = FE.DATOS;
      document.getElementById("au-acciones").innerHTML =
        boton("Ver en vivo en el canal de CESEG", D.enlaces.youtubeCanal, "au-boton--principal") +
        boton("Agenda completa", D.enlaces.calendario);
      actualizar();
    });
  }

  FE.auditorio = { actualizar: function () { actualizar(); colocar(); } };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
}(window.FE = window.FE || {}));
