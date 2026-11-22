# Formularios de la feria

El menú **Feria CESEG › Crear formularios** crea seis formularios en el Drive de quien lo ejecuta, con el archivo *Feria CESEG – edición* como destino de sus respuestas. Cada uno pide **iniciar sesión con Google y guarda el correo verificado**: así se reconoce a la persona o a la empresa sin pedir el correo a mano.

| Formulario | Quién lo llena | Dónde cae | Estado inicial |
|---|---|---|---|
| Perfil de postulante | Egresados, estudiantes y personas de otras universidades, una vez | Perfiles (un reenvío actualiza el perfil) | — |
| Postular o compartir mi CV | Se abre desde la feria con la vacante o la empresa ya marcada | Postulaciones | Recibido |
| Registro de empresa | Empresas | Empresas (un reenvío no cambia estado, pago ni ubicación) | Pendiente, pago Pendiente |
| Mi stand | Dueño o reclutador de una empresa registrada | Stands (fila nueva; la versión aprobada sigue publicada) | Borrador |
| Publicar una vacante | Empresas de la feria (por su correo) y la Bolsa de Trabajo | Vacantes, origen Feria o Bolsa | Borrador |
| Solicitar una charla | Empresas Gold y Platinum | Charlas | Platinum válida: **Aprobada sola**. Otras: Solicitada, con lo que no cumple en `notas` |

Cada solicitud de empresa, stand, vacante o charla manda un aviso a `correo_admin` (Configuración).

## Paso manual: las preguntas de archivos

Apps Script **no puede crear preguntas de subida de archivos**. Hay que agregarlas a mano, con el **título exacto** de esta tabla: el script las reconoce por el título. **Feria CESEG › Ver formularios** dice cuáles faltan.

| Formulario | Título exacto | Tipos | Máx. archivos | Tamaño máx. | Obligatoria |
|---|---|---|---|---|---|
| Perfil de postulante | `Tu CV (PDF)` | PDF | 1 | 10 MB | Sí |
| Registro de empresa | `Logotipo oficial` | Imagen | 1 | 10 MB | No |
| Registro de empresa | `Manual de marca` | PDF | 1 | 10 MB | No |
| Mi stand | `Logo` | Imagen | 1 | 10 MB | No |
| Mi stand | `Banner` | Imagen | 1 | 10 MB | No |
| Mi stand | `Galería (hasta 6 fotos)` | Imagen | 10 (se publican 6) | 10 MB | No |
| Mi stand | `Folleto (PDF)` | PDF | 1 | 10 MB | No |

Cómo agregar una:
1. Abre el formulario en modo edición (enlace «Editar» de **Ver formularios**).
2. **+ Agregar pregunta** › tipo **Subir archivo** › **Continuar**.
3. Escribe el título exacto. Activa **Permitir solo tipos de archivo específicos** y marca el tipo. Ajusta la cantidad y el tamaño.
4. En el Perfil de postulante, colócala **antes** de los textos legales y márcala **Obligatoria**.

Los archivos quedan en el Drive de la cuenta dueña del formulario, en una carpeta que crea Google Forms. Al publicar un stand, el script deja con permiso de lectura solo los logos, banners, fotos y folletos aprobados. **Los CV nunca se publican**: en la fase 7 se copian a la carpeta privada de cada empresa, según su plan.

## Enlaces en los widgets

Al crear los formularios, el script guarda sus enlaces en Configuración (`url_perfil`, `url_postular`, `url_empresa`, `url_stand`, `url_vacante`, `url_charla`) y los publica. Los widgets activan solos sus botones: «Reservar este espacio» abre el registro de empresa, «Postular» y «Compartir mi CV» abren la postulación con la vacante y la empresa ya puestas, y «Crear mi perfil de postulante» abre el perfil.
