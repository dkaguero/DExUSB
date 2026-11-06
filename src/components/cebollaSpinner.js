const LOGO = "public/assets/img/logo-usb-cebolla.svg";

export function montarCebollaSpinner(contenedor, texto) {
  const nodo = document.createElement("div");
  nodo.className = "ceseg-spinner";
  nodo.setAttribute("role", "status");
  nodo.innerHTML =
    '<img src="' + LOGO + '" alt="" width="48" height="48">' +
    "<p>" + texto + "</p>";
  contenedor.appendChild(nodo);
  return {
    quitar: function () {
      if (nodo.parentNode) nodo.parentNode.removeChild(nodo);
    }
  };
}
