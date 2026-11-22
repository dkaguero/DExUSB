# CV, paneles de candidatos y analítica (fase 7)

## Entrega de CV y panel de cada empresa (7A)

Cada hora (después de **Feria CESEG › Activar tareas automáticas**) o con **Entregar CV y actualizar paneles**:

1. Toda empresa **Aprobada** con pago **Confirmado** (o especial) recibe, en la carpeta privada de la feria:
   - **«CV – Empresa (privado)»**: carpeta con los CV que le corresponden;
   - **«Panel de candidatos – Empresa»**: hoja de Google con una fila por postulación o CV compartido.
2. Ambas se comparten con el **dueño** y los **reclutadores** declarados en el registro (carpeta: lector; panel: editor). Cada correo nuevo recibe un aviso con los dos enlaces y el recordatorio de confidencialidad.
3. **Qué CV recibe según su plan** (columna `acceso_cv` de Planes):
   - **Silver y Gold:** los de quienes se postularon a sus vacantes o le compartieron su CV.
   - **Platinum:** además, **toda la base** de quienes autorizaron compartir su CV, en la carpeta común **«Base de CV – Platinum (privado)»** y en la pestaña «Base de CV» de su panel.
4. **Nunca se copia un CV sin la autorización** («Autorizo compartir mi CV», columna `acepta_cv` = Sí). Sin ella, el panel dice «Sin CV autorizado».
5. Si el postulante sube un CV nuevo, se reemplazan sus copias (las viejas van a la papelera). Cada copia queda registrada en la pestaña **CV_Entregados**.
6. **Estado del candidato:** la empresa cambia la columna `estado` de su panel (Recibido, En revisión, Entrevista, Descartado) y escribe en `notas`. En la siguiente pasada, el estado vuelve a la pestaña Postulaciones y **el postulante recibe un correo**. Las notas se conservan.
7. **Bolsa de Trabajo:** las postulaciones a vacantes de la Bolsa siguen el mismo camino hacia el **correo de contacto** de la vacante.

## Analítica por plan (7B)

Los widgets mandan, en lotes, las visitas y los clics (vista de pabellón y de stand, sitio web, WhatsApp, redes, video, folleto, sala de entrevistas, Postular, Compartir mi CV, auditorio y Bolsa) a un **receptor de visitas**. **No viajan datos personales**: solo un identificador anónimo que genera el navegador del visitante. Se guardan en la pestaña **Eventos**.

Con cada entrega, el panel de cada empresa tiene su pestaña **Métricas**:

| Plan | Analítica | Incluye |
|---|---|---|
| Silver, Gold | Básica | Visitas al stand, visitantes únicos, clics, postulaciones, CV compartidos |
| Platinum | Completa | Lo anterior, más clics por tipo, postulaciones por vacante, puesto en su pabellón por visitas y visitas por día |

Para CSV: en el panel, **Archivo › Descargar › Valores separados por comas**.

La CESEG tiene la pestaña **Analítica** en *Feria CESEG – edición*: todas las empresas ordenadas por visitas, y los totales de la feria, del auditorio y de la Bolsa.

### Publicar el receptor de visitas (una sola vez)

1. En *Feria CESEG – edición*: **Extensiones › Apps Script**.
2. Arriba a la derecha: **Implementar › Nueva implementación**.
3. En el engranaje de «Seleccionar tipo»: **Aplicación web**.
4. Descripción: `Receptor de visitas`. **Ejecutar como: Yo.** **Quién tiene acceso: Cualquier persona.**
5. **Implementar** › acepta los permisos › copia la **URL de la aplicación web** (termina en `/exec`).
6. En la pestaña **Configuracion**, pégala en `url_receptor`. Pulsa **Feria CESEG › Publicar cambios**: los widgets la leen del archivo público.

Si después se cambia el script, el receptor sigue funcionando con su versión. Para actualizarlo: **Implementar › Gestionar implementaciones › ✏️ › Versión: Nueva versión › Implementar** (la URL no cambia).

## Cierre de la edición (7C)

Con las fechas de la edición en Configuración (`feria_fin`, `consulta_dias` = 15), la tarea automática calcula el estado: Preparación, Convocatoria, Feria, **Consulta** (hasta 15 días después del cierre) y **Cerrada**. Al pasar a **Cerrada**, retira a todas las empresas, contactos de la Bolsa y empresas Platinum el acceso a sus carpetas, paneles y a la base de CV, y lo anota en `acceso_retirado`. **Los datos quedan bajo resguardo de la CESEG**, como dicen los términos.
