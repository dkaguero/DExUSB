# Contenido de la CESEG para Google Sites

Sitio: **https://sites.google.com/usb.ve/dex-ceseg/inicio** (dirección final prevista: `ceseg.dex.usb.ve`).

Cómo leer esta guía:
- **Texto nativo**: se escribe con los bloques de Google Sites (Texto, Imagen, Botón, Grupo de texto plegable). La CESEG lo edita sin código.
- **🧩 Widget**: **Insertar › Incorporar › Incorporar código**, pegar el contenido completo del archivo indicado de `dist-google-sites/ceseg/` y ajustar el alto del recuadro arrastrando su borde.
- Los widgets se generan con `node tools/build-google-sites.js`. Si cambia algo del widget, se regenera y se vuelve a pegar. Los **datos** (fichas, empresas, ciudades) no requieren volver a pegarlo: se leen de Google Sheets.

## Altos y disposición de los widgets

**Comprobado en Sites (21 de noviembre de 2026):** en el teléfono, Google Sites **achica cada recuadro en proporción a su ancho**; un recuadro de 900 × 760 queda de unos 340 × 290. Por eso cada widget llena el recuadro que le toque y ordena su contenido según el espacio, sin barra de desplazamiento interna. Mientras más alto sea el recuadro en escritorio, más alto quedará en el teléfono. Un recuadro en **media columna** se achica mucho menos (450 → 340 de ancho) que uno de ancho completo (900 → 340).

| Widget | Disposición en escritorio | Alto en escritorio | Queda en el teléfono |
|---|---|---|---|
| `censo-banner.html` | Ancho completo | **300 px** | ~115 px: título, cifras y botón |
| `orgullo-usbista.html` | **Media columna**, con el texto y el botón «Proponer» en la otra mitad | **600 px** | ~450 px: ficha completa |
| `globo-egresados.html` | Ancho completo | **800 px** | ~300 px |
| `red-global.html` | Ancho completo | **900 px** | ~340 px: cifras, «Filtrar empresas» y globo |

Todos los widgets siguen el tema claro u oscuro del sistema del visitante y abren sus enlaces fuera del recuadro.

Para pegar un widget: abrir el archivo de `dist-google-sites/ceseg/` en VS Code, Ctrl+A, Ctrl+C, y en Sites **Insertar › Incorporar › Incorporar código**, Ctrl+V.

## Navegación del sitio

**Configuración › Navegación**: modo **Lateral**, para mantener el formato de menú del Decanato.

Orden de las páginas y vínculos del menú:

1. **Volver al DEx**: vínculo (**Páginas › + › Agregar vínculo**) a `https://sites.google.com/usb.ve/dexusb/inicio`.
2. Inicio
3. Emprendimiento
4. Egresados
5. **Censo de egresados**: vínculo al formulario `https://docs.google.com/forms/d/e/1FAIpQLSeWRBYT_m98uIP7xnXQVKWIvPpHWH0IUi7wWJss2DHt5VBIwA/viewform`
6. Red Global
7. Bolsa de Trabajo (con la subpágina **Feria Virtual**)
8. Trámites
9. Calendario
10. Contacto

Google Sites no deja colorear un solo elemento del menú. El censo se destaca con los widgets y botones de las páginas.

Subtítulo que se repite debajo del título de cada página (salvo Inicio):

> Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG) de la Universidad Simón Bolívar, Sede Sartenejas.

---

## Inicio

**Título:** Impulsamos el talento y los proyectos de la comunidad USBista

**Texto:** Coordinación de Emprendimiento y Seguimiento de Egresados de la Universidad Simón Bolívar, Sede Sartenejas.

**Botones** (bloque Botón):
- «Tengo un Proyecto» → página Emprendimiento
- «Soy Egresado» → página Egresados

**Impacto** (tres cuadros de texto en una fila):
- **Próximamente** · Emprendimientos incubados
- **Próximamente** · Egresados en la red global
- **Próximamente** · Oportunidades laborales publicadas

🧩 **Widget `censo-banner.html`**, ancho completo, alto 300 px.

**Convocatoria abierta**
> **II Feria de Emprendedores USB.** Del lunes 30 de noviembre al viernes 4 de diciembre de 2026, de 9:00 a.m. a 3:00 p.m., en el Conjunto de Auditorios. [Más información → página Emprendimiento]

**Feria Virtual de Pasantías, Empleo y PYMES**
- Imagen: `cursos/static/img2/feriaEmpleo.jpg` (subir a Sites; enlace de la imagen → página Feria Virtual).
> La Feria de Pasantías, Empleo y PYMES USB 2026-1, prevista del 1 al 3 de julio de 2026, no se realizó por el terremoto. La versión virtual está en desarrollo. **Próximamente.** [Más información → página Feria Virtual]

El buscador de la página local no se lleva: Google Sites trae su propio buscador.

---

## Emprendimiento

**Título:** Emprendimiento e Incubación

**Convocatoria abierta**
> **II Feria de Emprendedores USB.** Del lunes 30 de noviembre al viernes 4 de diciembre de 2026, de 9:00 a.m. a 3:00 p.m., en el Conjunto de Auditorios. Los stands son gratuitos para estudiantes, profesores, personal administrativo y obrero, y egresados con un proyecto propio. Quien quiera exponer escribe a ceseg@usb.ve para recibir el formulario. También se puede asistir como público.

**Incubadora**
> Próximamente.
> **Propiedad intelectual y aspectos legales.** Próximamente.

**Guías**
> Canvas, registro de marca y validación de la idea. Próximamente.

**Directorio de startups USBistas**
> La vitrina de empresas nacidas en la USB se publicará en esta tarjeta. Próximamente.
> **Vitrina de talento.** Próximamente.
> La actividad abierta para mostrar proyectos es la II Feria de Emprendedores.

**La Simón Emprende**
> Audios del programa:
- Alexandra La Cruz — [10-05-2019](https://soundcloud.com/user-813591196/la-simon-emprende-alexandra-la-cruz-10-05-2019)
- Gustavo Rodríguez — [10-05-2019](https://soundcloud.com/user-813591196/la-simon-emprende-gustavo-rodriguez-10-05-2019)
- Juan Flores y Ricardo Gómez — [21-06-2019](https://soundcloud.com/user-813591196/la-simon-emprende-juan-flores-y-ricardo-gomes-21-06-2019)
- Elsy Visbal — [21-06-2019](https://soundcloud.com/user-813591196/la-simon-emprende-elsy-visbal-21-06-2019)

Opcional: en SoundCloud, **Compartir › Insertar** de cada audio da un código que se pega con **Incorporar código** para reproducirlo en la página.

---

## Egresados

**Título:** Egresados

🧩 **Widget `censo-banner.html`**, ancho completo, alto 300 px.

**Sección de dos columnas** (en Sites: **Insertar › Diseños**, el de dos columnas):
- Columna izquierda: 🧩 **Widget `orgullo-usbista.html`**, alto 600 px.
- Columna derecha (texto nativo):
  > **Orgullo USBista**
  > Egresados y egresadas de la USB con logros nacionales e internacionales. Cada ficha usa solo el dato que aparece en la fuente enlazada.
  >
  > **Proponer un egresado destacado** (ver abajo: el texto y el botón van en esta columna).

**Proponer un egresado destacado**
> ¿Conoces a un egresado o egresada de la USB con logros importantes a nivel nacional o internacional? Propónlo. La CESEG verifica cada propuesta con fuentes públicas antes de publicarla en Orgullo USBista.
- **Botón** «Proponer un egresado destacado» → `https://docs.google.com/forms/d/e/1FAIpQLSeNROc95jTP4J0QS4cVL-99r1iZoQxvCxRtTRTrtIFEWIczng/viewform`

**Egresados por el mundo** (texto nativo, encima del widget)
> Cada cebolla es una ciudad donde vive al menos un egresado que respondió el [Censo de Egresados CESEG](https://docs.google.com/forms/d/e/1FAIpQLSeWRBYT_m98uIP7xnXQVKWIvPpHWH0IUi7wWJss2DHt5VBIwA/viewform). La ficha muestra solo la ciudad, el país y cuántos egresados hay allí. No se publican nombres ni datos de contacto.

🧩 **Widget `globo-egresados.html`**, alto 800 px en escritorio. Incluye el resumen («240 egresados en 63 ciudades…»), el globo, el botón «¿No ves tu ciudad? Agrégala» y la lista plegada de ciudades. El globo llena todo el alto del recuadro, así que se adapta cuando Sites lo achica en el teléfono.

**Formación continua**
> Cursos de extensión y Diplomados. Las charlas de la CESEG se agregarán aquí. Próximamente.
> (Enlazar «Cursos de extensión» y «Diplomados» a sus páginas en el sitio del DEx cuando existan.)

**Beneficios para egresados**
> Convenios y descuentos para la comunidad registrada. Próximamente.

**Red de mentores**
> El directorio para conectar egresados con emprendedores se publicará en esta tarjeta. Próximamente.
> **Mentorías.** Próximamente.

---

## Red Global

**Título:** Red Global USBista

**USBistas por el mundo** (texto nativo, encima del widget)
> Empresas fundadas por egresados de la USB, según una fuente pública o la confirmación de la CESEG. Las cifras cuentan solo las empresas y los perfiles de Orgullo USBista que publica la CESEG.

🧩 **Widget `red-global.html`**, alto 900 px. Incluye las cuatro cifras, el botón «Filtrar empresas», el globo y la lista plegada de empresas.

**Registrar tu empresa**
> ¿Fundaste o cofundaste una empresa y egresaste de la USB? Regístrala. La CESEG verifica los datos antes de publicarla en el mapa USBistas por el mundo.
- **Botón** «Registrar tu empresa» → `https://docs.google.com/forms/d/e/1FAIpQLScm3sQ4qSHwwPqy9sHQZptGacbF1C9bogh19O3j1VMk2xQygA/viewform`

---

## Bolsa de Trabajo

**Título:** Bolsa de Trabajo

**Oportunidades publicadas**
- Imagen: `feriaEmpleo.jpg` (la misma de Inicio).
> La Feria de Pasantías, Empleo y PYMES USB 2026-1, prevista del 1 al 3 de julio de 2026, no se realizó por el terremoto. La versión virtual está en desarrollo. **Próximamente.** [Más información → página Feria Virtual]
- **Feria Virtual de Pasantías, Empleo y PYMES.** Modalidad remota. Próximamente.

Los filtros por área, país y modalidad de la página local no se llevan mientras haya una sola oportunidad. Cada vacante aprobada se agrega como un renglón más de esta lista.

**Publicar una vacante**
> Empresas y egresados envían la vacante a la CESEG, que la revisa antes de publicarla en esta bolsa.
- **Botón** «Publicar una vacante» → `https://docs.google.com/forms/d/e/1FAIpQLSdXBsKlDU6kh9AkFB9g1eMvDhQieX4RhdvpW_jmOiEydlUFrA/viewform`, o **Insertar › Formularios** para mostrarlo dentro de la página.

### Subpágina: Feria Virtual

**Título:** Feria Virtual de Pasantías, Empleo y PYMES
- Imagen: `feriaEmpleo.jpg`.
> **Próximamente.**
> La Feria de Pasantías, Empleo y PYMES USB 2026-1, prevista del 1 al 3 de julio de 2026, no se realizó por el terremoto. La versión virtual está en desarrollo.

---

## Trámites

**Título:** Trámites y Certificaciones

Tres bloques **Grupo de texto plegable**:
- **Cartas de referencia** — La guía para solicitar una carta de referencia se publicará aquí. Próximamente.
- **Verificación de títulos** — La guía para verificar un título se publicará aquí. Próximamente.
- **Legalización de programas** — La guía de legalización se publicará aquí. Próximamente.

---

## Calendario

**Título:** Calendario de la CESEG

> Eventos programados por la Coordinación de Emprendimiento y Seguimiento de Egresados, Sede Sartenejas.

**Insertar › Calendario** › calendario *CESEG – Eventos* (ver `PENDIENTES.md`). Eventos iniciales:
- **II Feria de Emprendedores USB**, del 30 de noviembre al 4 de diciembre de 2026, de 9:00 a.m. a 3:00 p.m., Conjunto de Auditorios.
- **Feria Virtual de Pasantías, Empleo y PYMES**: fecha por definir. Mientras no tenga fecha, se menciona en el texto de la página en lugar del calendario.

---

## Contacto

**Título:** Contacto y equipo

> Edificio de Comunicaciones. Piso 2. Apartado 89000. Valle de Sartenejas. Baruta. Edo. Miranda.
> Teléfono: 0212-906-3157 / 3158 / 3162
> Horario de atención: de 9:00 a.m. a 3:30 p.m.
> 09-11250@usb.ve
> ceseg@usb.ve
> **Instagram:** [@ceseg_usb](https://www.instagram.com/ceseg_usb/)
>
> **Equipo.** Coordinadora: Ing. Desiree Agüero
