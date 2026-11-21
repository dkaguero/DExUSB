// Comportamiento común de las páginas de la CESEG.
// Es un script clásico (no módulo): cada bloque revisa si su elemento existe
// en la página antes de activarse.
(function () {
  var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tema oscuro. La clave es la misma en todas las páginas de la CESEG,
  // así la elección se mantiene al cambiar de página.
  (function () {
    var clave = "ceseg-tema";
    var boton = document.getElementById("ceseg-tema");
    var oscuro = false;
    try { oscuro = localStorage.getItem(clave) === "oscuro"; } catch (e) {}
    function aplicar() {
      document.body.setAttribute("data-tema", oscuro ? "oscuro" : "claro");
      if (!boton) return;
      boton.setAttribute("aria-pressed", oscuro ? "true" : "false");
      boton.textContent = oscuro ? "Tema claro" : "Tema oscuro";
    }
    aplicar();
    if (boton) {
      boton.addEventListener("click", function () {
        oscuro = !oscuro;
        try { localStorage.setItem(clave, oscuro ? "oscuro" : "claro"); } catch (e) {}
        aplicar();
      });
    }
  }());

  // Acordeones.
  var acordeones = document.querySelectorAll(".ceseg-acordeon > button");
  for (var a = 0; a < acordeones.length; a++) {
    acordeones[a].addEventListener("click", function () {
      var abierto = this.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(this.getAttribute("aria-controls"));
      this.setAttribute("aria-expanded", abierto ? "false" : "true");
      if (panel) panel.hidden = abierto;
    });
  }

  // Si la dirección trae el ancla de un acordeón, se abre al llegar.
  if (location.hash) {
    var destino = null;
    try { destino = document.querySelector(location.hash); } catch (e) {}
    var acordeon = destino && destino.closest(".ceseg-acordeon");
    var disparador = acordeon && acordeon.querySelector(":scope > button");
    if (disparador && disparador.getAttribute("aria-expanded") !== "true") disparador.click();
  }

  // Buscador de la página de Inicio: filtra los bloques .ceseg-item.
  var buscar = document.getElementById("ceseg-buscar");
  if (buscar) {
    buscar.addEventListener("input", function () {
      var q = buscar.value.trim().toLowerCase();
      var items = document.querySelectorAll(".ceseg-item");
      var hallados = 0;
      for (var i = 0; i < items.length; i++) {
        var coincide = q.length === 0 || items[i].textContent.toLowerCase().indexOf(q) !== -1;
        items[i].hidden = !coincide;
        if (coincide) hallados += 1;
      }
      var vacio = document.getElementById("ceseg-buscar-vacio");
      if (vacio) vacio.hidden = hallados !== 0;
    });
  }

  // Formulario de vacantes: abre un correo a la CESEG.
  var vacante = document.getElementById("publicar-vacante");
  if (vacante) {
    vacante.addEventListener("submit", function (evento) {
      evento.preventDefault();
      var datos = new FormData(vacante);
      var cuerpo = "Empresa o egresado: " + datos.get("quien") + "\n" +
        "Correo: " + datos.get("correo") + "\n" +
        "Área: " + datos.get("area") + "\n" +
        "País: " + (datos.get("pais") || "") + "\n" +
        "Modalidad: " + datos.get("mod") + "\n\n" +
        datos.get("texto");
      window.location.href = "mailto:ceseg@usb.ve?subject=" +
        encodeURIComponent("Vacante para la bolsa de la CESEG") +
        "&body=" + encodeURIComponent(cuerpo);
    });
  }

  // Filtros de la bolsa de trabajo.
  var form = document.getElementById("bolsa-filtros");
  if (form) {
    form.addEventListener("change", function () {
      var area = document.getElementById("f-area").value;
      var pais = document.getElementById("f-pais").value;
      var mod = document.getElementById("f-mod").value;
      var ofertas = document.querySelectorAll("#bolsa-lista li");
      var visibles = 0;
      for (var i = 0; i < ofertas.length; i++) {
        var ok = (area === "" || ofertas[i].getAttribute("data-area") === area) &&
          (pais === "" || ofertas[i].getAttribute("data-pais") === pais) &&
          (mod === "" || ofertas[i].getAttribute("data-mod") === mod);
        ofertas[i].hidden = !ok;
        if (ok) visibles += 1;
      }
      document.getElementById("bolsa-vacio").hidden = visibles !== 0;
    });
  }

  // Cifras con data-count: suben al entrar en pantalla.
  var cifras = document.querySelectorAll(".ceseg-cifra strong[data-count]");
  if (!cifras.length || !("IntersectionObserver" in window)) return;
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      var el = entrada.target;
      var meta = parseInt(el.getAttribute("data-count"), 10);
      observador.unobserve(el);
      if (!isFinite(meta)) return;
      if (reducir) {
        el.textContent = String(meta);
        return;
      }
      var inicio = null;
      function cuadro(tiempo) {
        if (inicio === null) inicio = tiempo;
        var avance = Math.min(1, (tiempo - inicio) / 800);
        el.textContent = String(Math.round(meta * avance));
        if (avance < 1) window.requestAnimationFrame(cuadro);
      }
      window.requestAnimationFrame(cuadro);
    });
  }, { threshold: 0.6 });
  for (var c = 0; c < cifras.length; c++) {
    if (cifras[c].getAttribute("data-count")) observador.observe(cifras[c]);
  }
}());
