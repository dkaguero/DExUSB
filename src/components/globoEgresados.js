// Globo «Egresados por el mundo» de la página Egresados.
// Lee la hoja pública «Ciudades CESEG» (pais, ciudad, lat, lng, egresados),
// que el Apps Script del censo llena con una fila por ciudad. La hoja no tiene
// nombres ni datos de contacto. La ficha muestra solo la ciudad, el país y
// cuántos egresados hay allí.
//
// La dirección del CSV va en el atributo data-csv del contenedor, y la del
// formulario del censo en data-censo (botón «¿No ves tu ciudad?»).
// Para probar en local sin la hoja: agrega ?demo a la dirección de la página.
import { escapar, montarGlobo } from "./globoBase.js";
import { cargarCiudades, direccion, totales } from "./ciudadesCSV.js";

function cuantos(n) {
  return n === 1 ? "1 egresado" : n + " egresados";
}

function ficha(punto) {
  return (
    "<p><strong>" + escapar(punto.ciudad) + ", " + escapar(punto.pais) + "</strong></p>" +
    "<p>" + cuantos(punto.egresados) + "</p>"
  );
}

function indice(lista) {
  return lista.map((punto) =>
    "<li><strong>" + escapar(punto.ciudad) + ", " + escapar(punto.pais) + "</strong> · " +
    cuantos(punto.egresados) + "</li>"
  ).join("");
}

function resumen(nodo, lista) {
  if (!nodo) return;
  const t = totales(lista);
  nodo.textContent =
    cuantos(t.egresados) + " en " +
    (t.ciudades === 1 ? "1 ciudad" : t.ciudades + " ciudades") + " de " +
    (t.paises === 1 ? "1 país" : t.paises + " países") + ".";
}

function avisar(raiz, texto) {
  const p = document.createElement("p");
  p.className = "ceseg-globo-aviso";
  p.textContent = texto;
  raiz.appendChild(p);
}

// Botón sobre el mapa que lleva al formulario del censo.
function botonCenso(raiz) {
  const censo = (raiz.getAttribute("data-censo") || "").trim();
  if (!censo) return;
  const enlace = document.createElement("a");
  enlace.className = "ceseg-globo-cta";
  enlace.href = censo;
  enlace.target = "_blank";
  enlace.rel = "noopener";
  enlace.textContent = "¿No ves tu ciudad? Agrégala";
  raiz.appendChild(enlace);
}

export function GloboEgresados(raiz) {
  const url = direccion(raiz);
  const nodoResumen = document.getElementById("egresados-mundo-resumen");
  // Sin datos no se crea el globo, así que el botón se pone de una vez.
  const sinGlobo = (texto) => {
    avisar(raiz, texto);
    botonCenso(raiz);
  };
  if (!url) {
    sinGlobo("Aún no hay ciudades registradas.");
    return;
  }
  cargarCiudades(url)
    .then((ciudades) => {
      if (!ciudades.length) {
        sinGlobo("Aún no hay ciudades registradas.");
        return;
      }
      resumen(nodoResumen, ciudades);
      montarGlobo(raiz, {
        datos: ciudades,
        etiqueta: (punto) => punto.ciudad + ", " + punto.pais + ": " + cuantos(punto.egresados),
        ficha,
        indice,
        plegar: (n) => (n === 1 ? "Ver la ciudad" : "Ver las " + n + " ciudades"),
        alCrear: botonCenso,
        textos: {
          recorrido: "El recorrido pasa por cada ciudad. Pasa el cursor por el mapa para detenerlo.",
          error: "El globo no pudo cargarse. Las ciudades están en la lista.",
          sinResultados: "Aún no hay ciudades registradas."
        }
      });
    })
    .catch(() => {
      sinGlobo("No se pudo leer la lista de ciudades. Intenta más tarde.");
    });
}

const raiz = document.getElementById("globo-egresados");
if (raiz) GloboEgresados(raiz);
