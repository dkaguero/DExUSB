// Lectura de la hoja pública «Feria CESEG – público» (la escribe «Publicar
// cambios» del Apps Script). Convierte sus pestañas a la forma de FE.DATOS.
// Si la hoja no está configurada o no responde, se quedan los datos de muestra.
(function (FE) {
  "use strict";

  // ID del archivo público: lo muestra instalar() del Apps Script. Vacío = datos de muestra.
  FE.HOJA_PUBLICA = "1m4ZiAck0yV9DJeYnum_qEmZ3gOpRU4Uad5QVUzBasV8";

  // CSV con comillas, comas y saltos de línea dentro de un campo.
  function leerCSV(texto) {
    var filas = [], fila = [], campo = "", comillas = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (comillas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') comillas = false;
        else campo += c;
      } else if (c === '"') comillas = true;
      else if (c === ",") { fila.push(campo); campo = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && texto[i + 1] === "\n") i++;
        fila.push(campo); filas.push(fila); fila = []; campo = "";
      } else campo += c;
    }
    if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
    return filas.filter(function (f) { return f.some(function (v) { return v.trim() !== ""; }); });
  }

  function pestana(nombre, obligatorias) {
    var url = "https://docs.google.com/spreadsheets/d/" + FE.HOJA_PUBLICA +
      "/gviz/tq?tqx=out:csv&headers=1&sheet=" + encodeURIComponent(nombre);
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("hoja");
      return r.text();
    }).then(function (texto) {
      var filas = leerCSV(texto);
      if (!filas.length) return [];
      var cab = filas[0].map(function (c) { return c.trim(); });
      if (!obligatorias.every(function (c) { return cab.indexOf(c) !== -1; })) throw new Error("columnas de " + nombre);
      return filas.slice(1).map(function (f) {
        var o = {};
        cab.forEach(function (c, i) { o[c] = (f[i] || "").trim(); });
        return o;
      });
    });
  }

  function json(texto, defecto) {
    try { return texto ? JSON.parse(texto) : defecto; } catch (e) { return defecto; }
  }
  function numero(v) { return Number(String(v).replace(",", ".")); }

  // Devuelve una promesa que resuelve cuando FE.DATOS tiene los datos de la hoja
  // (o se quedan los de muestra). Nunca falla.
  FE.cargarDatos = function () {
    if (!FE.HOJA_PUBLICA) return Promise.resolve(false);
    return Promise.all([
      pestana("Edicion", ["clave", "valor"]),
      pestana("Planes", ["id", "nombre", "precio", "desde", "hasta"]),
      pestana("Pabellones", ["slug", "nombre", "color", "posiciones"]),
      pestana("Stands", ["empresa_id", "pabellon", "posicion", "empresa"]),
      pestana("Vacantes", ["id", "empresa_id", "titulo"]),
      pestana("Charlas", ["titulo", "inicio"])
    ]).then(function (t) {
      var D = FE.DATOS;
      var edicion = {};
      t[0].forEach(function (f) { edicion[f.clave] = f.valor; });
      if (edicion.edicion_nombre) D.edicion.nombre = edicion.edicion_nombre;
      D.edicion.fechas = edicion.feria_inicio ? { inicio: edicion.feria_inicio, fin: edicion.feria_fin } : null;
      if (edicion.youtube_canal) D.enlaces.youtubeCanal = edicion.youtube_canal;
      // Formularios (fase 2): activan los botones «Disponible pronto».
      if (edicion.url_perfil) D.enlaces.perfilPostulante = edicion.url_perfil;
      if (edicion.url_empresa) D.enlaces.registroEmpresa = edicion.url_empresa;
      if (edicion.url_vacante) D.enlaces.vacante = edicion.url_vacante;
      if (edicion.url_postular) {
        D.enlaces.postular = edicion.url_postular;
        D.enlaces.compartirCv = edicion.url_postular;
      }

      if (t[1].length) {
        D.planes = t[1].map(function (p) {
          return { id: p.id, nombre: p.nombre, precio: numero(p.precio), desde: numero(p.desde), hasta: numero(p.hasta),
            forma: p.forma, beneficios: String(p.beneficios || "").split(/\s*\|\s*/).filter(Boolean) };
        });
      }
      if (t[2].length) {
        D.pabellones = t[2].map(function (p) {
          return { slug: p.slug, nombre: p.nombre, sector: p.sector, color: p.color || "#0055a5", posiciones: numero(p.posiciones) || 15 };
        });
      }
      var vacantesDe = {};
      t[4].forEach(function (v) {
        if (!v.empresa_id) return;
        (vacantesDe[v.empresa_id] = vacantesDe[v.empresa_id] || []).push({ id: v.id, titulo: v.titulo, modalidad: v.modalidad, contrato: v.contrato });
      });
      D.stands = t[3].map(function (s) {
        return {
          id: s.empresa_id, pabellon: s.pabellon, posicion: numero(s.posicion), empresa: s.empresa, color: s.color,
          logo: s.logo, banner: s.banner, descripcion: s.descripcion, video: s.video, web: s.web,
          redes: json(s.redes, []), whatsapp: s.whatsapp, whatsappMensaje: s.whatsapp_mensaje,
          galeria: json(s.galeria, []), folleto: s.folleto, sala: s.sala, vacantes: vacantesDe[s.empresa_id] || []
        };
      });
      D.vacantes = t[4];
      D.charlas = t[5].map(function (c) {
        return { titulo: c.titulo, empresa: c.empresa, inicio: c.inicio, duracion: numero(c.duracion) || 30, youtube: c.youtube };
      });
      return true;
    }).catch(function () { return false; });
  };
}(window.FE = window.FE || {}));
