# Pendientes manuales de la migración de la CESEG a Google Sites

Lo que hay que hacer con una cuenta de Google de la USB. En orden.

## 1. Probar un widget en Google Sites

Antes de armar todo, confirmar que un widget funciona dentro de Sites.

1. En la carpeta del repositorio: `node tools/build-google-sites.js`.
2. En https://sites.google.com/usb.ve/dex-ceseg, crea una página **Prueba** y ocúltala de la navegación (tres puntos de la página › **Ocultar de la navegación**).
3. **Insertar › Incorporar › Incorporar código**. Abre `dist-google-sites/ceseg/globo-egresados.html` con un editor de texto, copia **todo** y pégalo. **Siguiente › Insertar**.
4. Arrastra el borde inferior del recuadro hasta unos 760 px.
5. **Vista previa** (ícono de pantalla), en escritorio y en teléfono. Debe verse el globo con las cebollas, el contador y el botón «¿No ves tu ciudad? Agrégala».

Avísame qué se ve. Si algo falla, ajusto los widgets antes de seguir.

## 2. Datos y formularios

Sigue [`../datos-ceseg.md`](../datos-ceseg.md), sección **Instalación**. Al terminar:
- copia los **tres enlaces de los formularios** (menú **CESEG › Ver enlaces de los formularios**) y pásamelos: los pongo en las páginas del repositorio y en `CONTENIDO.md`;
- comprueba que **Ciudades CESEG** tiene las pestañas `Orgullo` y `Empresas`.

## 3. Calendario de la CESEG

1. En Google Calendar: **Otros calendarios › + › Crear calendario**. Nombre: `CESEG – Eventos`.
2. En su configuración › **Permisos de acceso**: marcar **Hacer disponible públicamente** (ver todos los detalles del evento).
3. Crear el evento **II Feria de Emprendedores USB**: del 30 de noviembre al 4 de diciembre de 2026, de 9:00 a.m. a 3:00 p.m., Conjunto de Auditorios.
4. En la página Calendario de Sites: **Insertar › Calendario** › `CESEG – Eventos`.

## 4. Imágenes

| Imagen | Dónde | Cómo |
|---|---|---|
| `cursos/static/img2/feriaEmpleo.jpg` (118 KB) | Inicio, Bolsa de Trabajo, Feria Virtual | **Insertar › Imágenes › Subir** |

Los widgets ya llevan sus imágenes dentro (la cebolla en base64). Ninguna imagen de la CESEG pasa de 150 KB, así que no hay marcadores `REEMPLAZAR_URL_DRIVE_`. La CESEG no enlaza PDF.

Para la migración del Decanato quedarán: los 33 PDF y tres imágenes de más de 150 KB (`cct/static/img2/logo.png`, `cfcg/static/img2/logo.png`, `cfcg/static/img2/tene-mar2020.jpg`).

## 5. Armar las páginas

Sigue [`CONTENIDO.md`](CONTENIDO.md): páginas, menú, textos y widgets con sus altos.

Tema del sitio: **Temas › Personalizar** con el azul `#0055a5` y el dorado `#d4af37` de la CESEG, para que combine con los widgets. Elige el mismo tema en el sitio del DEx.

## 6. Enlaces entre los dos sitios

- En el sitio de la CESEG, el vínculo **Volver al DEx** → `https://sites.google.com/usb.ve/dexusb/inicio`.
- En el sitio del DEx, un vínculo **CESEG** en el menú → `https://sites.google.com/usb.ve/dex-ceseg/inicio` (o `https://ceseg.dex.usb.ve` cuando el dominio esté listo).

## 7. Dominio `ceseg.dex.usb.ve`

Lo hace el administrador de Google Workspace de la USB:
1. **Admin console › Apps › Google Workspace › Sites › Direcciones URL personalizadas**: asignar `ceseg.dex.usb.ve` al sitio `dex-ceseg`.
2. En el DNS de `dex.usb.ve`: registro **CNAME** `ceseg` → `ghs.googlehosted.com`.

## 8. Publicar

En Sites: **Publicar**. Revisa en **Configuración › Publicación** que el sitio sea visible para cualquier persona (no solo para usb.ve).
