// Compositor del panorama con el arte de Blender: fondo equirrectangular del
// campus y franjas de cada pieza (stands por plan, pórtico, pasillos, La Lucha
// del Hombre) desplazadas a su yaw y teñidas con el color de la empresa o del
// pabellón. Portado del original (panorama/compositor.ts). Las imágenes llegan
// como data URI dentro del widget (FE.ARTE), sin descargas.
(function (FE) {
  "use strict";

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("No se pudo cargar una imagen del panorama")); };
      image.src = src;
    });
  }

  // Carga el fondo y todas las piezas al ancho pedido (2048 o 4096).
  function cargarArte(width) {
    var arte = FE.ARTE;
    var manifest = arte.manifest;
    var available = manifest.widths.indexOf(width) !== -1 ? width : Math.max.apply(null, manifest.widths);
    var nombres = [manifest.background];
    manifest.pieces.forEach(function (p) {
      nombres.push(p.file);
      if (p.tint) nombres.push(p.tint);
    });
    var fondoW = (manifest.backgroundWidths && manifest.backgroundWidths.length) ? manifest.backgroundWidths[0] : available;
    return Promise.all(nombres.map(function (n) {
      var w = n === manifest.background ? fondoW : available;
      var uri = arte.imagenes[n + "-" + w] || arte.imagenes[n + "-2048"];
      return loadImage(uri).then(function (img) { return [n, img]; });
    })).then(function (pares) {
      var images = {};
      pares.forEach(function (p) { images[p[0]] = p[1]; });
      return { width: available, background: images[manifest.background], manifest: manifest, images: images };
    });
  }

  // La variante más ancha que cabe en la casilla (si ninguna cabe, la más estrecha).
  function pieceFor(slot, manifest) {
    var candidates = manifest.pieces.filter(function (p) {
      if (slot.kind === "host") return p.kind === "host";
      if (slot.kind === "corridor") return p.kind === "corridor";
      return p.kind === "stand" && p.plan === slot.stand.tier && p.occupied === slot.occupied;
    });
    candidates.sort(function (a, b) { return b.physicalWidth - a.physicalWidth; });
    var usable = FE.escena.usableWidth(slot.span);
    for (var i = 0; i < candidates.length; i++) if (candidates[i].physicalWidth <= usable) return candidates[i];
    return candidates[candidates.length - 1];
  }

  function stripPlacements(yawDeg, stripDeg, width) {
    var w = (stripDeg / 360) * width;
    var x = ((yawDeg - stripDeg / 2 + 180) / 360) * width;
    var out = [{ x: x, w: w }];
    if (x + w > width) out.push({ x: x - width, w: w });
    if (x < 0) out.push({ x: x + width, w: w });
    return out;
  }

  function tinted(image, color) {
    var layer = document.createElement("canvas");
    layer.width = image.naturalWidth;
    layer.height = image.naturalHeight;
    var ctx = layer.getContext("2d");
    ctx.drawImage(image, 0, 0);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, layer.width, layer.height);
    return layer;
  }

  function colorOf(slot) {
    if (slot.kind === "stand") return slot.occupied ? slot.stand.brandColor : null;
    if (slot.kind === "corridor") return slot.pavilion.color;
    return null;
  }

  // Monta el recinto en un canvas W x W/2 y lo devuelve.
  function componer(slots, assets) {
    var W = assets.width, H = W / 2;
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(assets.background, 0, 0, W, H);

    var draw = function (piece, yaw, color) {
      var image = assets.images[piece.file];
      if (!image) return;
      var y = ((90 - piece.pitchMax) / 180) * H;
      var h = ((piece.pitchMax - piece.pitchMin) / 180) * H;
      var tint = color && piece.tint ? assets.images[piece.tint] : null;
      var light = tint ? tinted(tint, color) : null;
      stripPlacements(yaw, piece.stripDeg, W).forEach(function (p) {
        ctx.drawImage(image, p.x, y, p.w, h);
        if (light) {
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.drawImage(light, p.x, y, p.w, h);
          ctx.restore();
        }
      });
    };

    // Stands y pasillos; luego el pórtico; La Lucha del Hombre al final (va en un hueco).
    slots.forEach(function (s) { if (s.kind !== "host") draw(pieceFor(s, assets.manifest), s.yaw, colorOf(s)); });
    slots.forEach(function (s) { if (s.kind === "host") draw(pieceFor(s, assets.manifest), s.yaw, null); });
    var lucha = assets.manifest.pieces.filter(function (p) { return p.kind === "landmark"; })[0];
    if (lucha) draw(lucha, FE.escena.nearestGapYaw(slots, 125), null);
    return canvas;
  }

  FE.compositor = { cargarArte: cargarArte, componer: componer };
}(window.FE = window.FE || {}));
