# Conexiones de la feria con el sitio de la CESEG (fase 4)

## Empresas de egresados → mapa «USBistas por el mundo»

Cuando una empresa responde **«¿La fundaron egresados de la USB? Sí»** en su registro, el script de la feria la copia a la pestaña **Empresas** de *Datos CESEG – edición*, con estado **Borrador**:

| Columna del mapa | Sale de |
|---|---|
| empresa | Nombre comercial (o razón social) |
| fundador, carrera | Fundadores y carreras declarados |
| ciudad, pais | Sede principal |
| rubro | Sector |
| descripcion | Descripción de su stand, si ya la envió |
| fuente | Su sitio web |
| fuente_texto | «Registro en la Feria de Empleo CESEG» |
| verificacion, notas | Que lo declaró la empresa, y que hay que verificarlo |
| contacto_nombre, contacto_correo | Contacto del registro (no se publican) |

La Coordinación verifica con los criterios de siempre (`docs/datos-ceseg.md`), cambia el estado y pulsa **CESEG › Publicar cambios** en *Datos CESEG – edición*.

Se envía **una sola vez**: la columna `enviada_mapa` de la feria guarda la fecha. Las empresas de ejemplo (`demo = Sí`) no se envían. Hace falta el ID de *Datos CESEG – edición* en `id_datos_ceseg` (Configuración de la feria).

## Perfil de postulante ↔ Censo de Egresados → globo

El script de la feria, al recibir cada perfil y con el menú **Conectar con el censo y el mapa**:

1. Marca `en_censo` = Sí en cada perfil cuyo **carnet** (sin guiones ni espacios) o **correo** (el de Google, o el institucional) aparece en la hoja de respuestas del censo (`id_censo`).
2. Si alguien declaró **«Egresado o egresada de la USB»** y no está en el censo, le manda **una sola vez** un correo invitándolo a llenarlo (`url_censo`). La fecha queda en `invitado_censo`.
3. Escribe en el archivo del censo la pestaña **«Perfiles de la feria»**: carnet, correo, país y ciudad de los egresados de la USB. Es tan privada como el resto de ese archivo.

El script del censo (`docs/apps-script/ciudadesCenso.gs`), cada vez que recibe una respuesta **y cada hora**:

- cuenta las ciudades del censo, como siempre (las 240 respuestas originales cuentan como egresados de la USB);
- lee «Perfiles de la feria», **descarta a quien ya respondió el censo** (por carnet o por correo) y suma el resto.

Así nadie se cuenta dos veces, aunque llene el censo después de la feria. Los estudiantes y las personas de otras universidades no van al globo.

## Charlas del auditorio → Google Calendar (fase 5)

Cada vez que se publica (**Feria CESEG › Publicar cambios**, o sola cuando una charla Platinum se aprueba automáticamente), el script sincroniza el calendario **«CESEG – Eventos»**:

- Lo busca por `calendario_id`, luego por su nombre, y si no existe lo crea. Guarda su ID y su enlace público (`url_calendario`), que usa el botón «Agenda completa» del auditorio.
- **Aprobada:** crea el evento («Charla: título — empresa») con ponente, enlace de YouTube (columna `youtube`, que pone la CESEG) y la página del auditorio (`url_auditorio_sitio`). Si después cambian la fecha, la hora, la duración, el título o el YouTube, actualiza el evento.
- **Rechazada** o vuelta a **Solicitada:** borra el evento si lo tenía.
- Avisa **una vez** al dueño de la empresa cuando su charla se confirma o se rechaza (columna `notificada`).
- Las charlas de ejemplo (`demo = Sí`) no van al calendario ni mandan correos.

**Paso manual, una sola vez:** Google no deja que un script haga público un calendario. En Google Calendar › **CESEG – Eventos › Configuración y uso compartido › Permisos de acceso a los eventos** › marcar **Hacer disponible públicamente** (ver todos los detalles). Sin eso, «Agenda completa» y el calendario de la página Calendario solo los ve la CESEG.
