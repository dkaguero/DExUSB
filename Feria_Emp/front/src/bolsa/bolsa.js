// Widget «bolsa-vacantes»: la Bolsa de Trabajo de la CESEG. Reúne las vacantes
// aprobadas de las empresas de la feria y las de la Bolsa (pestaña Vacantes
// del archivo público), con filtros y el botón «Postular».
(function (FE) {
  "use strict";

  var D, lista, cuenta, vacio, filtros;
  var estado = { texto: "", sector: "", modalidad: "", contrato: "", origen: "" };

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function normal(t) {
    return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function unicos(campo) {
    var vistos = {};
    D.vacantes.forEach(function (v) { if (v[campo]) vistos[v[campo]] = true; });
    return Object.keys(vistos).sort(function (a, b) { return a.localeCompare(b, "es"); });
  }

  function enlacePostular(v) {
    var base = D.enlaces.postular;
    if (!base) return null;
    return base.replace("{vacante}", encodeURIComponent(v.id || "")).replace("{empresa}", encodeURIComponent(v.empresa_id || ""));
  }
  function boton(texto, url, clase) {
    if (!url) return '<span class="bo-boton bo-boton--off ' + (clase || "") + '">' + esc(texto) + "<small>Disponible pronto</small></span>";
    return '<a class="bo-boton ' + (clase || "") + '" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(texto) + "</a>";
  }

  function filtradas() {
    var q = normal(estado.texto);
    return D.vacantes.filter(function (v) {
      if (estado.sector && v.sector !== estado.sector) return false;
      if (estado.modalidad && v.modalidad !== estado.modalidad) return false;
      if (estado.contrato && v.contrato !== estado.contrato) return false;
      if (estado.origen && v.origen !== estado.origen) return false;
      if (!q) return true;
      return normal([v.titulo, v.empresa, v.descripcion, v.requisitos, v.ubicacion, v.sector].join(" ")).indexOf(q) !== -1;
    }).sort(function (a, b) { return String(b.fecha || "").localeCompare(String(a.fecha || "")); });
  }

  function tarjeta(v) {
    var meta = [v.ubicacion, v.modalidad, v.contrato].filter(Boolean).map(esc).join(" · ");
    var detalle = (v.descripcion ? "<p>" + esc(v.descripcion) + "</p>" : "") +
      (v.requisitos ? "<h4>Requisitos</h4><p>" + esc(v.requisitos) + "</p>" : "");
    return '<li class="bo-vacante">' +
      '<div class="bo-cabeza"><div>' +
      "<h3>" + esc(v.titulo) + "</h3>" +
      '<p class="bo-empresa">' + esc(v.empresa || "") +
      ' <span class="bo-origen bo-origen--' + (v.origen === "Bolsa" ? "bolsa" : "feria") + '">' + (v.origen === "Bolsa" ? "Bolsa de Trabajo" : "Feria de Empleo") + "</span></p>" +
      (meta ? '<p class="bo-meta">' + meta + "</p>" : "") +
      (v.salario ? '<p class="bo-meta">Salario: ' + esc(v.salario) + "</p>" : "") +
      "</div>" + boton("Postular", enlacePostular(v), "bo-boton--principal") + "</div>" +
      (detalle ? '<details class="bo-detalle"><summary>Ver detalle</summary>' + detalle +
        (v.enlace_postulacion ? "<p>" + boton("Postular también en su sitio", v.enlace_postulacion) + "</p>" : "") + "</details>" : "") +
      "</li>";
  }

  function pintar() {
    var v = filtradas();
    lista.innerHTML = v.map(tarjeta).join("");
    vacio.hidden = v.length !== 0;
    vacio.textContent = D.vacantes.length ? "Ninguna vacante coincide con estos filtros." : "Aún no hay vacantes publicadas. Vuelve pronto.";
    cuenta.textContent = D.vacantes.length ? "Mostrando " + v.length + " de " + D.vacantes.length + " vacantes." : "";
  }

  function opciones(campo, todas) {
    return '<option value="">' + todas + "</option>" + unicos(campo).map(function (o) {
      return '<option value="' + esc(o) + '">' + esc(o) + "</option>";
    }).join("");
  }

  function pintarFiltros() {
    filtros.innerHTML =
      '<input type="search" data-campo="texto" placeholder="Buscar: cargo, empresa, ciudad…" aria-label="Buscar vacantes">' +
      '<button type="button" id="bo-mas" aria-expanded="false">Filtros</button>' +
      '<select data-campo="sector" aria-label="Área o sector">' + opciones("sector", "Todas las áreas") + "</select>" +
      '<select data-campo="modalidad" aria-label="Modalidad">' + opciones("modalidad", "Toda modalidad") + "</select>" +
      '<select data-campo="contrato" aria-label="Tipo de contrato">' + opciones("contrato", "Todo contrato") + "</select>" +
      '<select data-campo="origen" aria-label="Origen"><option value="">Feria y Bolsa</option><option value="Feria">Feria de Empleo</option><option value="Bolsa">Bolsa de Trabajo</option></select>';
  }

  function iniciar() {
    D = FE.DATOS;
    D.vacantes = D.vacantes || [];
    lista = document.getElementById("bo-lista");
    cuenta = document.getElementById("bo-cuenta");
    vacio = document.getElementById("bo-vacio");
    filtros = document.getElementById("bo-filtros");
    filtros.addEventListener("click", function (e) {
      if (e.target.id !== "bo-mas") return;
      var abierto = filtros.classList.toggle("bo-abierto");
      e.target.setAttribute("aria-expanded", String(abierto));
    });
    filtros.addEventListener("input", function (e) {
      var campo = e.target.getAttribute("data-campo");
      if (!campo) return;
      estado[campo] = e.target.value;
      pintar();
    });
    var acciones = function () {
      document.getElementById("bo-acciones").innerHTML =
        boton("Publicar una vacante", D.enlaces.vacante, "bo-boton--principal") +
        boton("Crear mi perfil de postulante", D.enlaces.perfilPostulante);
    };
    acciones();
    pintarFiltros();
    pintar();
    lista.setAttribute("aria-busy", "true");
    FE.cargarDatos().then(function () {
      D = FE.DATOS;
      D.vacantes = D.vacantes || [];
      lista.removeAttribute("aria-busy");
      acciones();
      pintarFiltros();
      pintar();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
}(window.FE = window.FE || {}));
