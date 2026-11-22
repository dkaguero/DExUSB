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
| Registro de participantes | **Un solo registro: el Censo de Egresados ampliado.** Pueden registrarse egresados de la USB, estudiantes (para pasantías) y personas de otras universidades. **El globo cuenta solo a los egresados de la USB** |
| Auditorio | Canal de YouTube de la CESEG, con YouTube Live (en proceso) |
| Charlas | 15 o 30 min, de 9:00 a 16:00, de lunes a viernes, hasta 3 por empresa, solo Gold y Platinum |
| Mensajería | El buzón se reemplaza por correo, WhatsApp y el enlace de entrevista del stand |
| Imágenes | Dentro de los widgets: todo se maneja desde Google Sites. Las imágenes que suben las empresas quedan en Drive, con permiso de solo lectura |
| Stands especiales, patrocinantes, universidades | Se mantienen por ahora (FUNINDES, AJEUSB, Asociación de Egresados) |
| Analítica | Cada empresa recibe las métricas de su plan (BASIC o FULL) |
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
- **Censo y globo:** el censo ampliado sirve de registro. El globo cuenta solo a quienes declaran ser egresados de la USB.
- **Calendario:** cada charla aprobada se crea en «CESEG – Eventos».

## Páginas nuevas de Google Sites

| Página | Contenido |
|---|---|
| **Feria de Empleo** | Fechas, estado, planes y precios, patrocinantes, accesos |
| ↳ Recorrido 360 | Widget `feria-360` en un recuadro vertical, para que en el teléfono quede alto |
| ↳ Auditorio | Widget `auditorio` y el calendario |
| ↳ Empresas participantes | Widget `directorio` |
| ↳ Participa | Botones a los formularios: registro (censo), empresa, stand, vacante, charla |
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
| 2 | Formularios: empresa, stand, vacante, postulación, charla; ampliación del censo | Formularios creados por script |
| 3 | Bolsa de Trabajo unificada | Widget `bolsa-vacantes` |
| 4 | Conexiones: empresas → mapa, censo → globo (solo egresados USB) | Integración con lo ya migrado |
| 5 | Auditorio y charlas → Calendar | Widget `auditorio` |
| 6 | Feria 360 | Widget `feria-360` |
| 7 | CV y paneles de empresa, analítica por plan, estados por fecha | Flujo de candidatos y métricas |
| 8 | Páginas de Sites, textos legales, prueba de punta a punta, publicación | Feria lista |

Cada fase termina con pruebas, y se pide aprobación antes de la siguiente.
