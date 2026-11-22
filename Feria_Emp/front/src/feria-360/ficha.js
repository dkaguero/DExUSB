// Ficha que se abre sobre el panorama: stand de una empresa, espacio
// disponible, pórtico CESEG y La Lucha del Hombre. Contenido de la ficha del
// original (panorama/types.ts, StandSheetData): logo, banner, descripción,
// video, galería, redes, web, WhatsApp, folleto, vacantes, compartir CV,
// postular y sala de entrevistas. El buzón se reemplaza por WhatsApp y correo.
(function (FE) {
  "use strict";

  var panel, cuerpo;
  var empresaActual = "";

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function iniciales(nombre) {
    return String(nombre).split(/\s+/).filter(function (p) { return !/^(de|del|la|las|y|&)$/i.test(p); })
      .slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  }
  function plan(id) {
    return FE.DATOS.planes.filter(function (p) { return p.id === id; })[0];
  }
  // Botón a un enlace; si aún no existe, queda deshabilitado con «Disponible pronto».
  // `evento`: tipo de clic para la analítica (data-ev); `vacante`: su id (data-vac).
  function boton(texto, url, clase, destino, evento, vacante) {
    if (!url) return '<span class="fe-boton fe-boton--off ' + (clase || "") + '" title="Disponible pronto">' + esc(texto) + "<small>Disponible pronto</small></span>";
    return '<a class="fe-boton ' + (clase || "") + '" href="' + esc(url) + '" target="' + (destino || "_blank") + '" rel="noopener"' +
      (evento ? ' data-ev="' + evento + '"' : "") + (vacante ? ' data-vac="' + esc(vacante) + '"' : "") + ">" + esc(texto) + "</a>";
  }
  // Formulario de postulación prellenado con los códigos de la vacante y de la
  // empresa. Sin vacante, es «Compartir mi CV» con esa empresa.
  function enlacePostular(vacante, empresaId) {
    var base = FE.DATOS.enlaces.postular;
    if (!base || !empresaId) return null;
    return base.replace("{vacante}", encodeURIComponent(vacante ? vacante.id || "" : "")).replace("{empresa}", encodeURIComponent(empresaId));
  }

  function abrir(html, color) {
    cuerpo.innerHTML = html;
    panel.style.setProperty("--fe-marca", color || "#0055a5");
    panel.hidden = false;
    panel.scrollTop = 0;
    cuerpo.scrollTop = 0;
    var cerrar = panel.querySelector(".fe-ficha-cerrar");
    if (cerrar) cerrar.focus();
  }

  function cerrar() {
    panel.hidden = true;
    cuerpo.innerHTML = "";
    if (FE.alCerrarFicha) FE.alCerrarFicha();
  }

  // Stand de una empresa (o la ficha de ejemplo).
  function stand(s, pabellon, posicion, tier) {
    empresaActual = s.ejemplo ? "" : (s.id || "");
    if (empresaActual && FE.registrar) FE.registrar("stand_vista", empresaActual, "", pabellon.slug);
    var p = plan(tier);
    var redes = (s.redes || []).map(function (r) {
      return '<a class="fe-red" href="' + esc(r.url) + '" target="_blank" rel="noopener" data-ev="clic_red">' + esc(r.red) + "</a>";
    }).join("");
    var galeria = (s.galeria || []).slice(0, 6).map(function (g) {
      return typeof g === "number"
        ? '<span class="fe-foto" style="background:hsl(' + g + ',55%,45%)" aria-label="Foto de ejemplo"></span>'
        : '<img class="fe-foto" src="' + esc(g) + '" alt="Foto de ' + esc(s.empresa) + '">';
    }).join("");
    var vacantes = (s.vacantes || []).map(function (v) {
      return '<li><div><strong>' + esc(v.titulo) + "</strong><small>" + esc([v.modalidad, v.contrato].filter(Boolean).join(" · ")) +
        "</small></div>" + boton("Postular", s.ejemplo ? null : enlacePostular(v, s.id), "fe-boton--chico", "", "clic_postular", v.id) + "</li>";
    }).join("");
    var wa = s.whatsapp ? "https://wa.me/" + String(s.whatsapp).replace(/\D/g, "") +
      (s.whatsappMensaje ? "?text=" + encodeURIComponent(s.whatsappMensaje) : "") : null;
    var aviso = s.ejemplo
      ? '<p class="fe-aviso">Ejemplo: así se verá el stand de tu empresa. Los botones se activan cuando tu stand esté aprobado.</p>'
      : "";
    var html =
      '<div class="fe-banner"' + (s.banner ? ' style="background-image:url(' + esc(s.banner) + ')"' : "") + "></div>" +
      '<div class="fe-cabecera">' +
      (s.logo ? '<img class="fe-logo" src="' + esc(s.logo) + '" alt="Logo de ' + esc(s.empresa) + '">'
        : '<span class="fe-logo fe-logo--iniciales">' + esc(iniciales(s.empresa)) + "</span>") +
      "<div><h2>" + esc(s.empresa) + "</h2><p>" + esc(pabellon.nombre) + " · Posición " + posicion +
      ' · <span class="fe-plan fe-plan--' + tier + '">' + esc(p.nombre) + "</span></p></div></div>" +
      aviso +
      (s.descripcion ? "<p>" + esc(s.descripcion) + "</p>" : "") +
      '<div class="fe-acciones">' +
      boton("Compartir mi CV", s.ejemplo ? null : enlacePostular(null, s.id), "fe-boton--principal", "", "clic_cv") +
      (s.ejemplo ? boton("WhatsApp", null) : wa ? boton("WhatsApp", wa, "", "", "clic_whatsapp") : "") +
      (s.sala ? boton("Sala de entrevistas", s.ejemplo ? null : s.sala, "", "", "clic_sala") : "") +
      (s.web ? boton("Sitio web", s.ejemplo ? null : s.web, "", "", "clic_web") : "") +
      (s.folleto ? boton("Folleto (PDF)", s.ejemplo ? null : s.folleto, "", "", "clic_folleto") : "") +
      (s.video ? boton("Ver video", s.ejemplo ? null : s.video, "", "", "clic_video") : "") +
      "</div>" +
      (redes ? '<h3>Redes</h3><div class="fe-redes">' + (s.ejemplo ? redes.replace(/href="[^"]*"/g, 'href="#" aria-disabled="true"') : redes) + "</div>" : "") +
      (galeria ? '<h3>Galería</h3><div class="fe-galeria">' + galeria + "</div>" : "") +
      (vacantes ? "<h3>Vacantes</h3><ul class=\"fe-vacantes\">" + vacantes + "</ul>" : "");
    abrir(html, s.color || pabellon.color);
  }

  // Posición sin empresa: qué plan le toca y cómo reservarla.
  function vacio(pabellon, posicion, tier) {
    var p = plan(tier);
    var html =
      '<div class="fe-banner fe-banner--vacio"></div>' +
      '<div class="fe-cabecera"><span class="fe-logo fe-logo--iniciales">#' + posicion + "</span>" +
      "<div><h2>Espacio disponible</h2><p>" + esc(pabellon.nombre) + " · Posición " + posicion +
      ' · <span class="fe-plan fe-plan--' + tier + '">' + esc(p.nombre) + "</span></p></div></div>" +
      "<p><strong>Plan " + esc(p.nombre) + ": " + p.precio + " $.</strong> " + esc(p.forma) + ".</p>" +
      '<ul class="fe-beneficios">' + p.beneficios.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>" +
      '<p class="fe-nota">La CESEG aprueba cada empresa y confirma el pago antes de ubicarla en su stand.</p>' +
      '<div class="fe-acciones">' +
      boton("Reservar este espacio", FE.DATOS.enlaces.registroEmpresa, "fe-boton--principal") +
      '<button type="button" class="fe-boton" data-ejemplo="' + tier + '" data-pos="' + posicion + '">Ver un ejemplo de stand</button>' +
      "</div>";
    abrir(html, pabellon.color);
    cuerpo.querySelector("[data-ejemplo]").addEventListener("click", function () {
      stand(FE.EJEMPLO, pabellon, posicion, tier);
    });
  }

  // Pórtico CESEG.
  function host() {
    var e = FE.DATOS.enlaces;
    var html =
      '<div class="fe-banner" style="background:linear-gradient(120deg,#0055a5,#0b1329)"></div>' +
      '<div class="fe-cabecera"><span class="fe-logo fe-logo--iniciales">CESEG</span>' +
      "<div><h2>CESEG</h2><p>Coordinación de Emprendimiento y Seguimiento de Egresados</p></div></div>" +
      "<p>Bienvenido a la Feria de Empleo USB. Recorre los pabellones, visita los stands y comparte tu CV con las empresas.</p>" +
      '<div class="fe-acciones">' +
      // En pestaña nueva: Google Sites no deja que un widget cambie la página (target="_top").
      boton("Servicios al Egresado", e.egresados) +
      boton("Ruta Emprendedora", e.emprendimiento) +
      boton("Atención CESEG", e.contacto) +
      boton("Asistir a una charla", e.auditorio, "fe-boton--principal") +
      boton("Crear mi perfil de postulante", e.perfilPostulante) +
      "</div>";
    abrir(html, "#0055a5");
  }

  function lucha() {
    abrir(
      '<div class="fe-cabecera"><div><h2>La Lucha del Hombre por la Cima</h2><p>Carlos J. Prada · 1972</p></div></div>' +
      "<p>Escultura de unos 3 m sobre una antigua rueda de apisonar, con figuras humanas que trepan: el hombre frente a la máquina.</p>",
      "#0055a5");
  }

  FE.ficha = {
    montar: function (elPanel) {
      panel = elPanel;
      panel.innerHTML = '<button type="button" class="fe-ficha-cerrar" aria-label="Cerrar la ficha">×</button><div class="fe-ficha-cuerpo"></div>';
      cuerpo = panel.querySelector(".fe-ficha-cuerpo");
      panel.querySelector(".fe-ficha-cerrar").addEventListener("click", cerrar);
      // Clics de la ficha → analítica de la empresa.
      panel.addEventListener("click", function (e) {
        var a = e.target.closest ? e.target.closest("a[data-ev]") : null;
        if (a && empresaActual && FE.registrar) FE.registrar(a.getAttribute("data-ev"), empresaActual, a.getAttribute("data-vac") || "");
      });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) cerrar(); });
    },
    stand: stand,
    vacio: vacio,
    host: host,
    lucha: lucha,
    cerrar: cerrar
  };
}(window.FE = window.FE || {}));
