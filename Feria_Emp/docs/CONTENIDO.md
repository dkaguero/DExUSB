# Feria de Empleo en Google Sites: páginas, textos y widgets (fase 8)

Sitio: **https://sites.google.com/usb.ve/dex-ceseg** (futuro `ceseg.dex.usb.ve`). La feria es una **sección del sitio de la CESEG**.

- **Texto nativo:** bloques de Sites (cuadro de texto, botón, grupo de texto plegable). La CESEG lo edita sin código.
- **🧩 Widget:** **Insertar › Incorporar › Incorporar código**, pegando el archivo indicado de `Feria_Emp/dist/` (se generan con `node Feria_Emp/front/tools/build.js`). Leen los datos de la hoja pública: **no hay que volver a pegarlos** cuando cambian las empresas, vacantes o charlas; solo si cambia el código.
- **Altos:** el sitio mide 630 px de ancho; en el teléfono, Sites deja cada recuadro a 315 px de ancho y **la mitad del alto**. Todos los widgets llenan su recuadro.

## Formularios (enlaces publicados)

| Formulario | Enlace |
|---|---|
| Perfil de postulante | https://docs.google.com/forms/d/e/1FAIpQLSdO7oBY85zVFrueI-qvGGIGoiE8sjHgYdzVAl9mANaIuUPHBw/viewform |
| Registro de empresa | https://docs.google.com/forms/d/e/1FAIpQLSfwF6ZTNC_U0alCo3obZ1xNBQfwljkTkJh-w2gvF_h6Jo_wtQ/viewform |
| Mi stand | https://docs.google.com/forms/d/e/1FAIpQLSe3K9Bjr-u5uyg2sfi8Vuszs3QpwEnVgSAZrfqYnT8RqavUog/viewform |
| Publicar una vacante | https://docs.google.com/forms/d/e/1FAIpQLSdkKD8qGmQBkT-n-Fa22MwOitOtsgj-93eoBoo2DGAXPRqpkA/viewform |
| Solicitar una charla | https://docs.google.com/forms/d/e/1FAIpQLScnJeMMRWKXYWdbBuRmdT_rZLtT6dFuQATzgchOQ42w9Ehh8Q/viewform |
| Postular / compartir CV | Se abre solo desde los widgets, con la vacante y la empresa ya puestas |

## Estructura del menú

```
Volver al DEx
Inicio
Emprendimiento
Egresados
Censo de egresados
Red Global
Feria de Empleo            ← nueva (portada)
   ├ Recorrido 360
   ├ Auditorio
   ├ Empresas participantes
   ├ Participa
   ├ Términos y privacidad
   └ Preguntas frecuentes
Bolsa de Trabajo
Trámites
Calendario
Contacto
```

La subpágina antigua **Bolsa de Trabajo › Feria Virtual** se elimina (la reemplaza la sección Feria de Empleo). Las páginas de prueba (**Prueba feria**, **Prueba auditorio**) también.

---

## Feria de Empleo (portada)

**Título:** Feria de Empleo USB

**Texto:**
> La Feria de Empleo de la Universidad Simón Bolívar reúne a empresas, egresados y estudiantes en un recorrido virtual por los pabellones del campus de Sartenejas. Visita los stands, comparte tu CV, postula a las vacantes y asiste a las charlas del auditorio.

**Botones** (bloque Botón, en una fila):
- «Recorrer la feria» → página **Recorrido 360**
- «Auditorio» → página **Auditorio**
- «Crear mi perfil de postulante» → Perfil de postulante
- «Registrar mi empresa» → Registro de empresa

🧩 **`portada-feria.html`**, ancho completo, alto **460**. Nombre, fechas y estado de la edición (de la hoja), los tres planes con «Reservar mi espacio» y los patrocinantes.

## Recorrido 360

**Título:** Recorrido 360

**Texto:**
> Recorre los pabellones: arrastra para mirar alrededor, entra por los pasillos a otros pabellones y pulsa un stand para ver la empresa, sus vacantes y compartir tu CV. Usa «Directorio» para ir directo a una empresa y «Pantalla completa» para verla en grande.

🧩 **`feria-360.html`**, ancho completo, alto **900**.

## Auditorio

**Título:** Auditorio

**Texto:**
> Charlas de las empresas y de la CESEG, en vivo por YouTube. La pantalla muestra la charla en curso; debajo está la agenda del día.

🧩 **`auditorio.html`**, ancho completo, alto **600**.

**Agenda completa:** **Insertar › Calendario** › **CESEG – Eventos** (debe ser público: `docs/conexiones.md`).

**Para empresas** (texto + botón):
> Las empresas con plan Gold o Platinum pueden solicitar hasta 3 charlas de 15 o 30 minutos, de lunes a viernes de 9:00 a 16:00.
- Botón «Solicitar una charla» → Solicitar una charla

**Después de publicarla:** copia la dirección de esta página (vista publicada) y pégala en `url_auditorio_sitio` (Configuracion de *Feria CESEG – edición*) › **Publicar cambios**. Así «Asistir a una charla» del pórtico 360 y los correos de confirmación llevan aquí.

## Empresas participantes

**Título:** Empresas participantes

**Texto:**
> Empresas aprobadas por la CESEG, por pabellón. Comparte tu CV con la que te interese o postula a sus vacantes.

🧩 **`directorio.html`**, ancho completo, alto **800**.

## Participa

**Título:** Participa

**Para egresados y estudiantes** (texto):
> 1. **Crea tu perfil de postulante** una sola vez, con tu CV en PDF. Pide iniciar sesión con Google. Pueden participar egresados y estudiantes de la USB y de otras universidades.
> 2. **Recorre la feria y postula:** en cada stand, «Postular» en una vacante o «Compartir mi CV» con la empresa. También desde la Bolsa de Trabajo.
> 3. **Recibe noticias:** cuando una empresa cambie el estado de tu postulación (en revisión, entrevista o descartado), te llegará un correo.
>
> Tu CV solo lo ven las empresas participantes, según su plan, durante la feria y los 15 días siguientes.

Botón «Crear mi perfil de postulante» → Perfil de postulante.

**Para empresas** (texto):
> 1. **Registra tu empresa** y elige el plan: Platinum (250 $, posiciones 1 a 5), Gold (200 $, 6 a 10) o Silver (150 $, 11 a 15).
> 2. **La CESEG revisa la solicitud**, asigna el pabellón y la posición, y coordina el pago. Con la aprobación y el pago confirmado, tu stand se habilita.
> 3. **Arma tu stand** con logo, banner, descripción, video, galería, redes, WhatsApp, folleto y sala de entrevistas. La CESEG lo revisa antes de publicarlo.
> 4. **Publica tus vacantes** y, con Gold o Platinum, **solicita charlas** en el auditorio.
> 5. **Recibe los CV** en tu carpeta privada y gestiona a los candidatos en tu **Panel de candidatos**, con las métricas de tu plan.

Botones: «Registrar mi empresa», «Mi stand», «Publicar una vacante», «Solicitar una charla».

> Cada formulario de la empresa debe llenarse con la cuenta de Google registrada como dueño o reclutador.

## Términos y privacidad

**Título:** Términos y privacidad

Cinco **Grupos de texto plegable**, con el texto de [`terminos-y-privacidad.md`](terminos-y-privacidad.md) (el mismo que aceptan los formularios).

## Preguntas frecuentes

**Título:** Preguntas frecuentes. Un **Grupo de texto plegable** por pregunta:

- **¿Quién puede participar?** Egresados y estudiantes de la USB y de otras universidades. Las empresas, con un plan aprobado por la CESEG.
- **¿Necesito una cuenta?** Una cuenta de Google, para subir tu CV y postular. Para recorrer la feria y ver las charlas, no.
- **¿Quién ve mi CV?** Solo las empresas participantes: las de plan Silver y Gold, si les compartes tu CV o postulas a sus vacantes; las Platinum pueden consultar la base de quienes autorizaron compartirlo. Durante la feria y los 15 días siguientes.
- **¿Cómo actualizo mi CV o mis datos?** Vuelve a enviar el Perfil de postulante con la misma cuenta de Google: se reemplaza.
- **¿Cómo borro mis datos?** Escribe a ceseg@usb.ve.
- **¿Cómo sé si una empresa revisó mi postulación?** Te llega un correo cada vez que cambia su estado.
- **Soy empresa: ¿cuándo aparece mi stand?** Cuando la CESEG aprueba tu registro, confirma el pago y aprueba el contenido de tu stand.
- **¿Cómo pago?** El pago se coordina directamente con la CESEG (ceseg@usb.ve).
- **¿Puedo cambiar mi stand durante la feria?** Sí, con el formulario «Mi stand». La versión aprobada sigue visible mientras la CESEG revisa los cambios.

## Bolsa de Trabajo (página existente)

🧩 **`bolsa-vacantes.html`**, ancho completo, alto **800** (ya pegado en la fase 3).

---

## Configuración final (en *Feria CESEG – edición*)

| Clave en Configuracion | Qué poner |
|---|---|
| `edicion_nombre` | Nombre de la próxima edición |
| `convocatoria_inicio`, `convocatoria_fin`, `feria_inicio`, `feria_fin` | Fechas (aaaa-mm-dd), cuando se definan |
| `youtube_canal` | Canal de YouTube de la CESEG (para «Ver en vivo en el canal») |
| `url_auditorio_sitio` | Dirección publicada de la página Auditorio |
| Patrocinantes (pestaña) | nombre, logo (enlace de Drive o URL), web, orden |

Después: **Feria CESEG › Publicar cambios**.

Comprueba también que los accesos del pórtico CESEG del 360 apunten a páginas que existan: Egresados, Emprendimiento y Contacto (en `Feria_Emp/front/src/comun/datos.js`, `enlaces`). Si en Sites sus direcciones son distintas, avísame para cambiarlas.

## Antes de abrir la convocatoria

1. **Feria CESEG › Borrar datos de ejemplo** (quita las 6 empresas ficticias, sus vacantes y la charla).
2. Fechas de la edición y patrocinantes, y **Publicar cambios**.
3. **Activar tareas automáticas** (si no se hizo en la fase 7).
4. Calendario **CESEG – Eventos** público.
5. Probar con una cuenta que no sea de la CESEG: crear perfil, postular, registrar una empresa de prueba (y borrarla después).
6. En Sites: **Publicar**.
