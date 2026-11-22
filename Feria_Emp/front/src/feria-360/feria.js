// Widget «feria-360»: recorrido por los pabellones de la feria con el visor
// Pannellum. Cada pabellón es una rotonda con el pórtico CESEG al frente, sus
// 15 stands (Platinum 1-5, Gold 6-10, Silver 11-15) y un pasillo hacia cada
// uno de los otros pabellones. Los stands sin empresa se ven vacíos, con la
// forma de su plan, y su ficha dice cómo reservarlos.
(function (FE) {
  "use strict";

  var D = FE.DATOS;
  var visor = null;
  var arte = null;
  var actual = 0;
  var slots = [];
  var cargando, titulo, directorio, pills;

  function esc(t) {
    return String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function tierDe(posicion) {
    var p = D.planes.filter(function (pl) { return posicion >= pl.desde && posicion <= pl.hasta; })[0];
    return p ? p.id : "silver";
  }

  // Stands de un pabellón: una casilla por posición, ocupada o vacía.
  function standsDe(pab) {
    var out = [];
    for (var pos = 1; pos <= pab.posiciones; pos++) {
      var s = D.stands.filter(function (x) { return x.pabellon === pab.slug && Number(x.posicion) === pos; })[0];
      out.push({
        position: pos,
        tier: tierDe(pos),
        occupied: !!s,
        brandColor: s && s.color ? s.color : pab.color,
        name: s ? s.empresa : "Espacio disponible",
        datos: s || null
      });
    }
    return out;
  }

  function iniciales(n) {
    return String(n).split(/\s+/).filter(function (p) { return !/^(de|del|la|las|y|&)$/i.test(p); })
      .slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  }

  // Rótulo de un hotspot (lo dibuja Pannellum dentro de su div).
  function rotulo(div, args) {
    div.classList.add("fe-hs", "fe-hs--" + args.tipo);
    if (args.tier) div.classList.add("fe-hs--" + args.tier);
    if (args.color) div.style.setProperty("--fe-color", args.color);
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");
    div.setAttribute("aria-label", args.etiqueta);
    div.innerHTML = '<span class="fe-hs-placa">' + args.html + "</span>";
    div.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); args.accion(); }
    });
  }

  function hotspot(ancla, args) {
    return {
      pitch: ancla.pitch,
      yaw: ancla.yaw,
      cssClass: "fe-hs-base",
      createTooltipFunc: rotulo,
      createTooltipArgs: args,
      clickHandlerFunc: function () { args.accion(); }
    };
  }

  function hotspots(pab) {
    var E = FE.escena;
    var lista = [];
    slots.forEach(function (slot) {
      if (slot.kind === "host") {
        var a = E.hostAnchors(slot);
        lista.push(hotspot(a.logos, { tipo: "host", etiqueta: "Pórtico CESEG", html: "<b>CESEG</b>", accion: FE.ficha.host }));
        lista.push(hotspot(a.auditorium, { tipo: "chico", etiqueta: "Asistir a una charla", html: "Asistir a una charla", accion: FE.ficha.host }));
      } else if (slot.kind === "corridor") {
        var destino = slot.pavilion;
        lista.push(hotspot(E.corridorAnchor(slot), {
          tipo: "pasillo", color: destino.color, etiqueta: "Ir al pabellón " + destino.nombre,
          html: "Pabellón <b>" + esc(destino.nombre) + "</b> →",
          accion: function () { irA(D.pabellones.indexOf(destino)); }
        }));
      } else {
        var st = slot.stand;
        var abrir = st.occupied
          ? function () { FE.ficha.stand(st.datos, pab, st.position, st.tier); }
          : function () { FE.ficha.vacio(pab, st.position, st.tier); };
        lista.push(hotspot(E.standAnchor(slot), st.occupied
          ? {
            tipo: "stand", tier: st.tier, color: st.brandColor, etiqueta: st.name, accion: abrir,
            html: (st.datos.logo ? '<img src="' + esc(st.datos.logo) + '" alt="">' : "<i>" + esc(iniciales(st.name)) + "</i>") + esc(st.name)
          }
          : { tipo: "vacio", tier: st.tier, etiqueta: "Espacio disponible, posición " + st.position, accion: abrir, html: "#" + st.position + " Disponible" }));
      }
    });
    lista.push(hotspot(E.luchaAnchor(slots), { tipo: "info", etiqueta: "La Lucha del Hombre por la Cima", html: "i", accion: FE.ficha.lucha }));
    return lista;
  }

  function pintarDirectorio(pab) {
    var stands = slots.filter(function (s) { return s.kind === "stand"; })
      .sort(function (a, b) { return a.stand.position - b.stand.position; });
    var planes = D.planes.map(function (p) {
      var items = stands.filter(function (s) { return s.stand.tier === p.id; }).map(function (s) {
        return '<li><button type="button" data-pos="' + s.stand.position + '">' +
          '<span class="fe-dir-pos">#' + s.stand.position + "</span>" +
          (s.stand.occupied ? esc(s.stand.name) : '<span class="fe-dir-libre">Espacio disponible</span>') + "</button></li>";
      }).join("");
      return '<h3><span class="fe-plan fe-plan--' + p.id + '">' + esc(p.nombre) + "</span> " + p.precio + " $</h3><ul>" + items + "</ul>";
    }).join("");
    directorio.querySelector(".fe-dir-cuerpo").innerHTML =
      "<h2>Pabellón " + esc(pab.nombre) + "</h2>" + planes;
  }

  function enfocarStand(pos) {
    var slot = slots.filter(function (s) { return s.kind === "stand" && s.stand.position === pos; })[0];
    if (!slot || !visor) return;
    directorio.hidden = true;
    var ancla = FE.escena.standAnchor(slot);
    visor.lookAt(ancla.pitch - 4, slot.yaw, visor.getHfov(), 900, function () {
      var st = slot.stand, pab = D.pabellones[actual];
      if (st.occupied) FE.ficha.stand(st.datos, pab, st.position, st.tier);
      else FE.ficha.vacio(pab, st.position, st.tier);
    });
  }

  function pintarPills() {
    pills.innerHTML = D.pabellones.map(function (p, i) {
      return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === actual) + '" style="--fe-color:' + esc(p.color) + '">' + esc(p.nombre) + "</button>";
    }).join("");
  }

  // Arma el pabellón `i` y lo muestra.
  function irA(i) {
    if (i < 0 || i >= D.pabellones.length) return;
    actual = i;
    var pab = D.pabellones[i];
    FE.ficha.cerrar();
    directorio.hidden = true;
    cargando.hidden = false;
    titulo.textContent = "Pabellón " + pab.nombre;
    if (FE.registrar) FE.registrar("pabellon_vista", "", "", pab.slug);
    pintarPills();
    // Deja pintar el aviso de carga antes de componer.
    setTimeout(function () {
      var destinos = D.pabellones.filter(function (p) { return p !== pab; });
      slots = FE.escena.layoutRing(standsDe(pab), destinos);
      var canvas = FE.compositor.componer(slots, arte);
      var imagen = canvas.toDataURL("image/jpeg", 0.9);
      if (visor) visor.destroy();
      visor = pannellum.viewer("fe-visor", {
        type: "equirectangular",
        panorama: imagen,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: false,
        compass: false,
        pitch: -6,
        yaw: 0,
        hfov: window.innerWidth < 500 ? 110 : 100,
        minHfov: 40,
        maxHfov: 120,
        hotSpots: hotspots(pab)
      });
      visor.on("load", function () { cargando.hidden = true; });
      visor.on("error", function (m) { cargando.textContent = "No se pudo mostrar el pabellón: " + m; });
      pintarDirectorio(pab);
    }, 30);
  }

  function iniciar() {
    cargando = document.getElementById("fe-cargando");
    titulo = document.getElementById("fe-titulo");
    pills = document.getElementById("fe-pabellones");
    directorio = document.getElementById("fe-directorio");
    FE.ficha.montar(document.getElementById("fe-ficha"));
    FE.pantallaCompleta(document.getElementById("fe-pantalla"), document.getElementById("fe-app"));

    pills.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]");
      if (b) irA(Number(b.getAttribute("data-i")));
    });
    document.getElementById("fe-abrir-directorio").addEventListener("click", function () {
      FE.ficha.cerrar();
      directorio.hidden = !directorio.hidden;
    });
    directorio.addEventListener("click", function (e) {
      if (e.target.closest(".fe-dir-cerrar")) { directorio.hidden = true; return; }
      var b = e.target.closest("button[data-pos]");
      if (b) enfocarStand(Number(b.getAttribute("data-pos")));
    });

    if (typeof pannellum === "undefined") {
      cargando.textContent = "No se pudo cargar el visor 360. Revisa tu conexión y recarga la página.";
      return;
    }
    var ancho = window.innerWidth * (window.devicePixelRatio || 1) > 1200 ? 4096 : 2048;
    Promise.all([FE.compositor.cargarArte(ancho), FE.cargarDatos()]).then(function (r) {
      arte = r[0];
      D = FE.DATOS;
      if (FE.registrar) FE.registrar("feria_vista");
      irA(0);
    }).catch(function (err) {
      cargando.textContent = "No se pudo armar la feria: " + err.message;
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
}(window.FE = window.FE || {}));
