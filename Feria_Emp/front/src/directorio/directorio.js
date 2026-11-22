// Widget «directorio»: empresas participantes publicadas, por pabellón, con
// logo, plan, sector, vacantes y botones a su web, redes y «Compartir mi CV».
(function (FE) {
  "use strict";

  var filtro = { texto: "", pabellon: "" };

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function normal(t) { return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function iniciales(n) {
    return String(n).split(/\s+/).filter(function (p) { return !/^(de|del|la|las|y|&)$/i.test(p); }).slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  }
  function plan(id) { return FE.DATOS.planes.filter(function (p) { return p.id === id; })[0] || { nombre: "" }; }
  function postular(vac, emp) {
    var base = FE.DATOS.enlaces.postular;
    return base ? base.replace("{vacante}", encodeURIComponent(vac || "")).replace("{empresa}", encodeURIComponent(emp)) : null;
  }
  function a(texto, url, ev, emp, vac, clase) {
    if (!url) return "";
    return '<a class="di-boton ' + (clase || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener" data-ev="' + ev + '" data-emp="' + esc(emp) + '"' +
      (vac ? ' data-vac="' + esc(vac) + '"' : "") + ">" + esc(texto) + "</a>";
  }

  function tarjeta(s) {
    var p = plan(s.plan || "");
    var orden = { platinum: 0, gold: 1, silver: 2 };
    var vac = (s.vacantes || []).map(function (v) {
      return "<li>" + esc(v.titulo) + " <small>" + esc([v.modalidad, v.contrato].filter(Boolean).join(" · ")) + "</small> " +
        a("Postular", postular(v.id, s.id), "clic_postular", s.id, v.id, "di-boton--chico") + "</li>";
    }).join("");
    var redes = (s.redes || []).map(function (r) { return a(r.red, r.url, "clic_red", s.id); }).join("");
    return '<li class="di-empresa" style="--di-color:' + esc(s.color || "#0055a5") + '" data-orden="' + (orden[s.plan] == null ? 3 : orden[s.plan]) + '">' +
      '<div class="di-cabeza">' +
      (s.logo ? '<img class="di-logo" src="' + esc(s.logo) + '" alt="">' : '<span class="di-logo di-logo--ini">' + esc(iniciales(s.empresa)) + "</span>") +
      "<div><h3>" + esc(s.empresa) + "</h3><p>" + esc(s.pabellonNombre) + " · Posición " + esc(s.posicion) +
      ' · <span class="di-plan di-plan--' + esc(s.plan) + '">' + esc(p.nombre) + "</span></p></div></div>" +
      (s.descripcion ? '<p class="di-desc">' + esc(s.descripcion) + "</p>" : "") +
      '<div class="di-acciones">' + a("Compartir mi CV", postular("", s.id), "clic_cv", s.id, "", "di-boton--principal") +
      a("Sitio web", s.web, "clic_web", s.id) + redes + "</div>" +
      (vac ? '<details><summary>' + s.vacantes.length + (s.vacantes.length === 1 ? " vacante" : " vacantes") + "</summary><ul class=\"di-vac\">" + vac + "</ul></details>" : "") +
      "</li>";
  }

  function pintar() {
    var D = FE.DATOS;
    var nombres = {};
    D.pabellones.forEach(function (p) { nombres[p.slug] = p.nombre; });
    var q = normal(filtro.texto);
    var lista = D.stands.map(function (s) { s.pabellonNombre = nombres[s.pabellon] || s.pabellon; return s; }).filter(function (s) {
      if (filtro.pabellon && s.pabellon !== filtro.pabellon) return false;
      return !q || normal([s.empresa, s.descripcion, s.pabellonNombre].concat((s.vacantes || []).map(function (v) { return v.titulo; })).join(" ")).indexOf(q) !== -1;
    }).sort(function (x, y) { return x.pabellon === y.pabellon ? x.posicion - y.posicion : String(x.pabellonNombre).localeCompare(y.pabellonNombre, "es"); });
    document.getElementById("di-lista").innerHTML = lista.map(tarjeta).join("");
    var vacio = document.getElementById("di-vacio");
    vacio.hidden = lista.length > 0;
    vacio.textContent = D.stands.length ? "Ninguna empresa coincide con la búsqueda." : "Las empresas participantes se publicarán aquí cuando la CESEG apruebe su stand.";
    document.getElementById("di-cuenta").textContent = D.stands.length ? lista.length + " de " + D.stands.length + " empresas" : "";
    var sel = document.getElementById("di-pabellon");
    if (sel.options.length !== D.pabellones.length + 1) {
      sel.innerHTML = '<option value="">Todos los pabellones</option>' + D.pabellones.map(function (p) {
        return '<option value="' + esc(p.slug) + '">' + esc(p.nombre) + "</option>";
      }).join("");
    }
  }

  function iniciar() {
    document.getElementById("di-filtros").addEventListener("input", function (e) {
      if (e.target.id === "di-buscar") filtro.texto = e.target.value;
      if (e.target.id === "di-pabellon") filtro.pabellon = e.target.value;
      pintar();
    });
    document.getElementById("di-lista").addEventListener("click", function (e) {
      var el = e.target.closest ? e.target.closest("a[data-ev]") : null;
      if (el && FE.registrar) FE.registrar(el.getAttribute("data-ev"), el.getAttribute("data-emp"), el.getAttribute("data-vac") || "");
    });
    pintar();
    FE.cargarDatos().then(function () { pintar(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
}(window.FE = window.FE || {}));
