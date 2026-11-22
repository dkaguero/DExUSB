// Geometría del recinto 360: reparto del anillo de stands, pasillos y anclas
// de los rótulos. Portado sin cambios de lógica del proyecto original
// (feria-empleo-front/src/components/fair/panorama/scene.ts y painter.ts).
// Se carga como script clásico: todo cuelga de window.FE.
(function (FE) {
  "use strict";

  var DEG = Math.PI / 180;
  // Altura de los ojos (m): mirador central elevado, el paisaje se ve sobre el anillo.
  var EYE = 3.2;
  // Distancia del visitante al frente de los stands (m) y fracción útil de cada posición.
  var RING_RADIUS = 10;
  var FILL = 0.84;

  // Ángulo relativo de cada stand según su plan (Silver = 1); pórtico y pasillos.
  var TIER_WEIGHT = { platinum: 1.5, gold: 1.2, silver: 1 };
  var HOST_WEIGHT = 2;
  var CORRIDOR_WEIGHT = 1;

  var BOOTH = {
    silver: { depth: 1.6, fascia: [2.6, 3.0] },
    gold: { depth: 2.0, fascia: [2.8, 3.25] },
    platinum: { depth: 2.6, fascia: [3.1, 3.8] }
  };
  var HOST = { lintel: [4.6, 5.6] };
  var CORRIDOR_ARCH = { lintel: [3.6, 4.1] };

  function normalizeYaw(yaw) {
    var wrapped = ((((yaw + 180) % 360) + 360) % 360) - 180;
    return wrapped === -180 ? 180 : wrapped;
  }

  // Pasillos repartidos en la mitad trasera (120°-240°); si quedan muy juntos, 90°-270°.
  function corridorTargets(count, minSpacing) {
    if (count <= 0) return [];
    if (count === 1) return [180];
    var from = 120, arc = 120;
    if (arc / (count - 1) < minSpacing) { from = 90; arc = 180; }
    var out = [];
    for (var i = 0; i < count; i++) out.push(from + (i * arc) / (count - 1));
    return out;
  }

  // CESEG al frente (yaw 0); posiciones impares a la derecha y pares a la
  // izquierda, así los Platinum (1-5) flanquean el pórtico. Un pasillo por
  // pabellón destino, en la mitad trasera.
  function layoutRing(stands, destinations) {
    var sorted = stands.slice().sort(function (a, b) { return a.position - b.position; });
    var right = sorted.filter(function (s) { return s.position % 2 === 1; });
    var left = sorted.filter(function (s) { return s.position % 2 === 0; }).reverse();
    var standItem = function (s) { return { kind: "stand", stand: s, weight: TIER_WEIGHT[s.tier] }; };
    var items = [{ kind: "host", weight: HOST_WEIGHT }].concat(right.map(standItem), left.map(standItem));

    var totalWeight = items.reduce(function (sum, it) { return sum + it.weight; }, 0) + destinations.length * CORRIDOR_WEIGHT;
    var degreesPerWeight = 360 / totalWeight;
    var corridorSpan = CORRIDOR_WEIGHT * degreesPerWeight;

    var targets = corridorTargets(destinations.length, 2 * degreesPerWeight);
    var minIndex = 1;
    destinations.forEach(function (pavilion, index) {
      var target = targets[index];
      var best = minIndex, bestDistance = Infinity;
      var edge = (HOST_WEIGHT * degreesPerWeight) / 2;
      for (var i = 1; i <= items.length; i++) {
        if (i >= minIndex) {
          var distance = Math.abs(edge + corridorSpan / 2 - target);
          if (distance < bestDistance) { best = i; bestDistance = distance; }
        }
        if (i < items.length) edge += items[i].weight * degreesPerWeight;
      }
      items.splice(best, 0, { kind: "corridor", pavilion: pavilion, weight: CORRIDOR_WEIGHT });
      minIndex = best + 2 <= items.length ? best + 2 : best + 1;
    });

    var cursor = -(HOST_WEIGHT * degreesPerWeight) / 2;
    return items.map(function (item) {
      var span = item.weight * degreesPerWeight;
      var yaw = item.kind === "host" ? 0 : normalizeYaw(cursor + span / 2);
      cursor += span;
      if (item.kind === "host") return { kind: "host", yaw: yaw, span: span };
      if (item.kind === "corridor") return { kind: "corridor", pavilion: item.pavilion, yaw: yaw, span: span };
      return { kind: "stand", stand: item.stand, occupied: !!item.stand.occupied, yaw: yaw, span: span };
    });
  }

  // Hueco entre stands más cercano a `target` (sin contar los bordes de un pasillo).
  function nearestGapYaw(slots, target) {
    var edgesOf = function (s) { return [normalizeYaw(s.yaw - s.span / 2), normalizeYaw(s.yaw + s.span / 2)]; };
    var corridorEdges = [];
    slots.filter(function (s) { return s.kind === "corridor"; }).forEach(function (s) { corridorEdges = corridorEdges.concat(edgesOf(s)); });
    var gaps = [];
    slots.forEach(function (s) { gaps = gaps.concat(edgesOf(s)); });
    gaps = gaps.filter(function (g) { return !corridorEdges.some(function (e) { return Math.abs(normalizeYaw(g - e)) < 1e-6; }); });
    return gaps.reduce(function (best, g) {
      return Math.abs(normalizeYaw(g - target)) < Math.abs(normalizeYaw(best - target)) ? g : best;
    });
  }

  function boothWidth(spanDeg) {
    return 2 * RING_RADIUS * Math.tan((spanDeg * DEG) / 2) * FILL;
  }
  function local(yawDeg, u, v, d) {
    var t = yawDeg * DEG, forward = RING_RADIUS + d;
    return [Math.cos(t) * u + Math.sin(t) * forward, v, -Math.sin(t) * u + Math.cos(t) * forward];
  }
  function yawPitchOf(p) {
    return { yaw: Math.atan2(p[0], p[2]) / DEG, pitch: Math.atan2(p[1] - EYE, Math.hypot(p[0], p[2])) / DEG };
  }

  // Dónde va el rótulo de cada stand (fascia, o banner colgante del Platinum).
  function standAnchor(slot) {
    var booth = BOOTH[slot.stand.tier];
    var v = (booth.fascia[0] + booth.fascia[1]) / 2;
    var d = slot.stand.tier === "platinum" ? booth.depth / 2 : booth.depth;
    return { yaw: slot.yaw, pitch: yawPitchOf(local(slot.yaw, 0, v, d)).pitch };
  }
  function corridorAnchor(slot) {
    var v = (CORRIDOR_ARCH.lintel[0] + CORRIDOR_ARCH.lintel[1]) / 2;
    return { yaw: slot.yaw, pitch: yawPitchOf(local(slot.yaw, 0, v, 0)).pitch };
  }
  // Pórtico CESEG: rótulo en el dintel y accesos en los pilares.
  function hostAnchors(slot) {
    var half = boothWidth(slot.span) / 2;
    var at = function (u, v, d) { return yawPitchOf(local(slot.yaw, u, v, d)); };
    return {
      logos: at(0, (HOST.lintel[0] + HOST.lintel[1]) / 2, 0),
      left: at(-half, 3.4, 0),
      center: at(-half, 1.5, 0),
      right: at(half, 2.6, 0),
      auditorium: at(half, 1.2, 0)
    };
  }
  // La Lucha del Hombre por la Cima, en el hueco más cercano a 125°.
  function luchaAnchor(slots) {
    var yaw = nearestGapYaw(slots, 125);
    return { yaw: yaw, pitch: Math.atan2(2.6 - EYE, RING_RADIUS + 1.5) / DEG };
  }

  FE.escena = {
    layoutRing: layoutRing,
    standAnchor: standAnchor,
    corridorAnchor: corridorAnchor,
    hostAnchors: hostAnchors,
    luchaAnchor: luchaAnchor,
    nearestGapYaw: nearestGapYaw,
    usableWidth: function (spanDeg) { return boothWidth(spanDeg); }
  };
}(window.FE = window.FE || {}));
