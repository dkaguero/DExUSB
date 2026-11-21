// Globo «USBistas por el mundo» de la página Red Global USBista:
// empresas fundadas por egresados, con el filtro de la red.
import empresas from "../data/empresasUSBData.js";
import { escapar, MINI, montarGlobo } from "./globoBase.js";
import { alCambiarFiltro, filtrarEmpresas, filtroActivo } from "./filtroRed.js";

function ficha(empresa) {
  const fundador = empresa.carrera
    ? "Fundador: " + escapar(empresa.fundador) + ", " + escapar(empresa.carrera)
    : "Fundador: " + escapar(empresa.fundador);
  const detalle = typeof empresa.fuente === "string" && empresa.fuente.indexOf("http") === 0
    ? '<a href="' + escapar(empresa.fuente) + '" target="_blank" rel="noopener">Ver fuente</a> · ' + escapar(empresa.fuenteTexto)
    : escapar(empresa.fuenteTexto);
  const fuente = MINI + "Fuente verificada · " + detalle;
  return (
    "<p><strong>" + escapar(empresa.empresa) + "</strong></p>" +
    "<p>" + fundador + "</p>" +
    "<p>" + escapar(empresa.ciudad) + ", " + escapar(empresa.pais) + "</p>" +
    (empresa.descripcion ? "<p>" + escapar(empresa.descripcion) + "</p>" : "") +
    '<p><span class="ceseg-badge">' + escapar(empresa.rubro) + "</span></p>" +
    '<p class="ceseg-fuente">' + fuente + "</p>" +
    '<p class="ceseg-fuente">' + escapar(empresa.verificacion) + "</p>"
  );
}

function indice(lista) {
  return lista.map((empresa) =>
    "<li><strong>" + escapar(empresa.empresa) + "</strong> · " +
    escapar(empresa.ciudad) + ", " + escapar(empresa.pais) + "</li>"
  ).join("");
}

export function GlobeUSB(raiz) {
  const globo = montarGlobo(raiz, {
    datos: empresas,
    etiqueta: (empresa) => empresa.empresa,
    ficha,
    indice,
    textos: {
      recorrido: "El recorrido pasa por cada empresa. Pasa el cursor por el mapa para detenerlo.",
      error: "El globo no pudo cargarse. Las empresas publicadas están en la lista.",
      sinResultados: "Ninguna empresa publicada coincide con este filtro."
    }
  });
  alCambiarFiltro((filtro) => {
    globo.actualizar(filtrarEmpresas(empresas, filtro), { fijo: filtroActivo(filtro) });
  });
}

const raiz = document.getElementById("globe-usb");
if (raiz) GlobeUSB(raiz);
