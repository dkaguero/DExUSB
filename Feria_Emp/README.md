# Feria de Empleo CESEG en Google Sites

Versión de la **Feria Virtual de Empleo Inmersiva** para Google Sites, Google Forms, Google Sheets, Apps Script y Google Drive, sin servidor propio. Es para la **próxima edición** de la feria. Se hace completa, sin recortes.

- **Proyecto original:** `/home/karina/feria-empleo/feria-empleo-proy` (repositorio `dkaguero/feria-empleo-proy`, Express + Prisma + React, de Domotai Tech). **Es solo de consulta: no se modifica.** De allí se copian, a esta carpeta, el compositor del 360, las imágenes del panorama y del auditorio, y los textos legales.
- **Dónde queda:** como sección **Feria de Empleo** del sitio de la CESEG (https://sites.google.com/usb.ve/dex-ceseg). La Bolsa de Trabajo actual se une a la feria.
- **Plan aprobado:** 22 de noviembre de 2026.

## Decisiones (22 de noviembre de 2026)

| Tema | Decisión |
|---|---|
| Alcance y fecha | Completo, para la próxima edición. La feria de diciembre de 2026 no depende de esta versión |
| Ubicación | Sección del sitio de la CESEG |
| Inicio de sesión | Con cuenta de Google en los formularios con archivos (CV, logos, folletos) |
| CV para empresas | Carpeta privada por empresa en el Drive de la CESEG, compartida con las cuentas de Google de la empresa, según su plan y el consentimiento del postulante. La USB permite compartir fuera |
| Planes | Silver 150 $, Gold 200 $ y Platinum 250 $, con sus límites, y 15 posiciones por pabellón. **Pago informativo:** la CESEG confirma el pago **antes** de ubicar a la empresa en su stand y de que disfrute los beneficios |
| Stand | La empresa lo envía por formulario y la CESEG lo aprueba antes de publicarlo |
| Registro de participantes | **El censo no cambia.** La feria tiene su propio formulario, **Perfil de postulante** (con inicio de sesión de Google y CV), para egresados de la USB, estudiantes y personas de otras universidades. Se llena una vez; cada postulación es un formulario mínimo. El script **cruza perfil y censo por carnet o correo**: marca a quien ya está en el censo e invita a llenarlo al egresado USB que no lo está. **El globo cuenta solo a los egresados de la USB**, sin contar dos veces a nadie. Las 240 respuestas actuales del censo cuentan como egresados de la USB |
| Auditorio | Canal de YouTube de la CESEG, con YouTube Live (en proceso) |
| Charlas | 15 o 30 min, de 9:00 a 16:00, de lunes a viernes, hasta 3 por empresa, solo Gold y Platinum |
| Mensajería | El buzón se reemplaza por correo, WhatsApp y el enlace de entrevista del stand |
| Imágenes | Dentro de los widgets: todo se maneja desde Google Sites. Las imágenes que suben las empresas quedan en Drive, con permiso de solo lectura |
| Stands especiales, patrocinantes, universidades | Se mantienen por ahora (FUNINDES, AJEUSB, Asociación de Egresados) |
| Analítica | Cada empresa recibe las métricas de su plan (BASIC o FULL) |
| Relación con la USB | Pregunta del Perfil de postulante: egresado o egresada de la USB / estudiante de la USB / egresado o estudiante de otra universidad / otra |
| Fechas de la próxima edición | Por definir; configurables en la hoja de la feria |
| Textos legales | Se reutilizan los 5 textos que la CESEG aprobó el 3 de noviembre de 2026, adaptados a Google Workspace, sin nueva revisión |

## Cómo se replica cada función

| Feria original | Versión Google |
|---|---|
| Cuentas con clave, roles y equipos | Formularios con inicio de sesión de Google; la empresa declara su dueño y sus reclutadores por correo |
| Registro y aprobación de empresas | Formulario → hoja privada → la CESEG aprueba y confirma el pago → menú «Publicar» |
| Stand autogestionado | Formulario de stand (logo, banner, video, galería, folleto, redes, WhatsApp, enlace de entrevista) → aprobación → publicación |
| Feria 360 (Pannellum + compositor) | Widget `feria-360` que compone los stands desde la hoja pública, con pabellones, pasillos, directorio y ficha del stand |
| Vacantes y postulación | Formulario de vacantes (también para la Bolsa) → widget `bolsa-vacantes` con filtros → formulario de postulación con la vacante prellenada, CV y consentimiento |
| Acceso a CV según el plan | El script copia el CV a la carpeta privada de la empresa (Silver y Gold: solo los compartidos o postulados; Platinum: toda la base que consintió) |
| Estado de candidatos y notas | Hoja privada por empresa («Panel de empresa») con estado y notas; correo al postulante cuando cambia el estado |
| Buzón | Correo, WhatsApp y el enlace de entrevista del stand |
| Auditorio | Widget `auditorio` (gradas, video de YouTube en la pantalla, agenda); calendario incrustado |
| Reserva de charlas | Formulario → Platinum: aprobación automática si el turno está libre; Gold: la CESEG confirma → evento en Google Calendar «CESEG – Eventos» |
| Analítica por plan | Receptor de visitas (aplicación web de Apps Script) → hoja de eventos → métricas por empresa en su panel, según el plan, con descarga CSV |
| Estados de la edición y cierre | Disparadores de tiempo de Apps Script: convocatoria, feria, consulta (15 días) y cierre del acceso de las empresas |
| Exportación ZIP | Los datos ya quedan en las hojas y en el Drive de la CESEG |
| Textos legales y consentimientos | Página de Sites y casillas obligatorias en cada formulario; cada aceptación queda registrada con su versión |
| Correos automáticos | Apps Script (Workspace permite hasta 1500 al día) |

## Conexiones con el sitio de la CESEG

- **Vacantes:** un solo flujo. El formulario «Publicar una vacante» se amplía y alimenta la Bolsa de Trabajo y el stand de cada empresa.
- **Mapa «USBistas por el mundo»:** el registro de empresa tiene una sección opcional, «¿La fundaron egresados de la USB?». Si se marca, entra como Borrador en la pestaña Empresas de *Datos CESEG – edición* y sigue la aprobación que ya existe.
- **Censo y globo:** el Perfil de postulante se cruza con el censo por carnet o correo. El globo suma a los egresados de la USB del perfil que no estén en el censo.
- **Calendario:** cada charla aprobada se crea en «CESEG – Eventos».

## Páginas nuevas de Google Sites

| Página | Contenido |
|---|---|
| **Feria de Empleo** | Fechas, estado, planes y precios, patrocinantes, accesos |
| ↳ Recorrido 360 | Widget `feria-360` en un recuadro vertical, para que en el teléfono quede alto |
| ↳ Auditorio | Widget `auditorio` y el calendario |
| ↳ Empresas participantes | Widget `directorio` |
| ↳ Participa | Botones a los formularios: perfil de postulante, empresa, stand, vacante, charla; enlace al censo |
| ↳ Términos y privacidad | Los 5 textos legales |
| ↳ Preguntas frecuentes | Desplegables |
| **Bolsa de Trabajo** (existe) | Widget `bolsa-vacantes` |

## Estructura

```
Feria_Emp/
├── README.md          este plan
├── back/              lo que vive en Google
│   ├── apps-script/   instalar, respuestas, aprobación y publicación, correos,
│   │                  charlas → Calendar, CV → carpetas por empresa, estados por fecha,
│   │                  receptor de visitas (aplicación web)
│   ├── esquema/       columnas de cada pestaña, privadas y públicas
│   └── textos-legales/
├── front/             widgets para «Incorporar código»
│   ├── src/           feria-360, auditorio, bolsa-vacantes, directorio, estado-feria
│   ├── assets/        imágenes del panorama y del auditorio (copiadas del original)
│   └── tools/         generador de widgets autocontenidos
└── docs/              CONTENIDO (páginas de Sites) y PENDIENTES
```

## Fases

| Fase | Qué | Resultado |
|---|---|---|
| 0 | Decisiones | ✅ 22 de noviembre de 2026 |
| 1 | Datos: archivos *Feria CESEG – edición* (privado) y *Feria CESEG – público*, Apps Script con `instalar`, datos de prueba. **Prueba temprana:** un widget de ~1 MB en Sites, para confirmar que acepta el tamaño del 360 | Base lista |
| 2 | Formularios: perfil de postulante, postulación, empresa, stand, vacante, charla | Formularios creados por script |
| 3 | Bolsa de Trabajo unificada | Widget `bolsa-vacantes` |
| 4 | Conexiones: empresas → mapa; perfil ↔ censo (carnet o correo) → globo, solo egresados USB y sin duplicados | Integración con lo ya migrado |
| 5 | Auditorio y charlas → Calendar | Widget `auditorio` |
| 6 | Feria 360 | Widget `feria-360` |
| 7 | CV y paneles de empresa, analítica por plan, estados por fecha | Flujo de candidatos y métricas |
| 8 | Páginas de Sites, textos legales, prueba de punta a punta, publicación | Feria lista |

Cada fase termina con pruebas, y se pide aprobación antes de la siguiente.

## Avance

- **22 de noviembre de 2026, fase 1:** prueba de tamaño en Google Sites (widget de 0,81 MB con visor 360 y video): **aceptado y funcionando**.
- **Adelantado de las fases 5 y 6, con datos de muestra:**
  - `feria-360.html` (0,63 MB): 4 pabellones de muestra del original con 15 stands **vacíos** cada uno, con la forma de su plan (Platinum 1-5, Gold 6-10, Silver 11-15); pórtico CESEG, pasillos entre pabellones, directorio, ficha de espacio disponible (plan, precio, beneficios, «Reservar») y ficha de ejemplo con todo lo que mostrará un stand (logo, banner, descripción, video, galería, redes, web, WhatsApp, folleto, sala de entrevistas, vacantes con «Postular», «Compartir mi CV»). En el original los espacios vacíos se ven todos como Silver; aquí muestran la forma de su plan.
  - `auditorio.html` (0,33 MB): sala desde las gradas con el video de YouTube de la charla en curso en la pantalla, cuenta regresiva de la próxima y agenda del día.
  - Los botones que dependen de formularios o enlaces que aún no existen dicen «Disponible pronto». Los datos llegarán de la hoja pública en las fases 6 y 7.
- Generar: `node Feria_Emp/front/tools/build.js` → `Feria_Emp/dist/`.
- **22 de noviembre de 2026, fase 1 (base de datos):** `back/apps-script/feria.gs` crea el archivo de edición (12 pestañas, listas desplegables, planes, pabellones, universidades), el archivo público y la carpeta privada; publica con reglas (pago confirmado antes de ubicar a la empresa, plan por posición, límite de vacantes, charlas solo en los planes que las incluyen) y carga o borra datos de ejemplo. Reglas probadas con una simulación. Los widgets leen el archivo público (`front/src/comun/hoja.js`) y, sin él, muestran los datos de muestra; probado de punta a punta con la salida simulada. Instalación: `docs/instalacion.md`.
- **22 de noviembre de 2026, fase 1 instalada:** archivo público `1m4ZiAck0yV9DJeYnum_qEmZ3gOpRU4Uad5QVUzBasV8`, conectado en `front/src/comun/hoja.js`. Con los datos de ejemplo publica 6 stands, 9 vacantes y 1 charla; los widgets los leen de la hoja real.
- **22 de noviembre de 2026, fase 2 (formularios):** el menú **Crear formularios** crea los seis (perfil de postulante, postulación, registro de empresa, mi stand, vacante, charla) con inicio de sesión de Google y correo verificado, los textos legales aprobados con su casilla, y el disparador que guarda cada respuesta pendiente de la CESEG. Reglas probadas con una simulación: actualización del perfil y del registro sin perder lo asignado, stand en borrador sin quitar el aprobado, vacantes Feria o Bolsa según el correo, charlas (plan, horario, turno, máximo, choques; Platinum válida se aprueba sola), postulación sin perfil anotada. Las preguntas de archivos se agregan a mano (`docs/formularios.md`). Los widgets activan «Reservar», «Postular», «Compartir mi CV» y «Crear mi perfil» con los enlaces publicados.
- **22 de noviembre de 2026, fase 2 instalada:** seis formularios creados; los enlaces se publican en Edicion y activan los botones de la feria (comprobado con la hoja real). El Perfil de postulante ya tiene su pregunta de CV; faltan las de archivos del Registro de empresa y de Mi stand.

