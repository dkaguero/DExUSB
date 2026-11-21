# Datos de la CESEG: propuestas, verificación y publicación

Orgullo USBista y el mapa de empresas («USBistas por el mundo») se alimentan de Google Sheets. Los mantiene la **Coordinación de la CESEG**, que también decide qué se publica.

## Los dos archivos

| Archivo | Quién lo ve | Para qué |
|---|---|---|
| **Datos CESEG – edición** | Solo el equipo de la CESEG (compartido como editor) | Aquí llegan las propuestas de los formularios, se verifican y se aprueban |
| **Ciudades CESEG** (`12z13lgy…`) | Público, solo lectura con enlace | Lo leen las páginas y Google Sites. Tiene tres pestañas: `Ciudades` (la llena el script del censo), `Orgullo` y `Empresas` (las llena «Publicar cambios») |

Nunca se edita a mano el archivo público: lo que se escribe ahí se ve al instante en la página.

## Cómo llega una propuesta

```
Formulario «Proponer un egresado destacado»   ─┐
Formulario «Registrar una empresa de egresados» ┼─► Datos CESEG – edición
Formulario «Publicar una vacante»              ─┘    fila nueva con estado «Borrador»
                                                         │
                       la Coordinación de la CESEG verifica y cambia el estado
                                                         │
                         menú CESEG › Publicar cambios   ▼
                                     Ciudades CESEG (pestañas Orgullo y Empresas)
                                                         │
                                     Google Sites y las páginas de la CESEG
```

Las vacantes no se publican solas: la CESEG las revisa en la pestaña `Vacantes` y las escribe en la página Bolsa de Trabajo de Google Sites.

## Cómo verificar (Coordinación de la CESEG)

Abre **Datos CESEG – edición** y filtra la columna `estado` por «Borrador».

**Orgullo USBista.** Una ficha se aprueba solo si:
- una página pública dice que la persona egresó de la USB, o USB Noticias publica el reconocimiento;
- el texto de la ficha dice solo lo que confirma la fuente (no se completa lo que la fuente no dice);
- tiene `categoria`. Si en `notas` dice «Área propuesta: …», elige una categoría de la lista o escribe una nueva.

**Empresas.** Una empresa se aprueba solo si:
- una fuente pública nombra a la persona como egresada de la USB y como fundadora o cofundadora, o la CESEG la confirma con nombre;
- no se publica un «equipo USB» sin nombres;
- completa `fuente_texto` (por ejemplo, «Sitio de la empresa» o «CESEG») y `verificacion` (una frase sobre cómo se confirmó).

Luego:
1. Corrige lo que haga falta en la fila. Puedes editar cualquier columna.
2. Escribe tu cargo en `verificado_por` y, si hace falta, una nota en `notas`.
3. Cambia `estado` a **Aprobado** o **Rechazado**.
4. Marca `destacado` como «Sí» si la ficha debe llevar la etiqueta «Egresado destacado».
5. Cuando termines la revisión, menú **CESEG › Publicar cambios**.

«Publicar cambios» copia todas las filas «Aprobado» (no solo las nuevas) y muestra un resumen. Si una fila aprobada no se puede publicar, el resumen dice por qué: falta un dato obligatorio, o no se pudo ubicar la ciudad de una empresa. En ese caso, escribe `lat` y `lng` a mano: clic derecho sobre la ciudad en Google Maps; el primer renglón son las coordenadas.

Para quitar algo ya publicado, cambia su estado a «Rechazado» y vuelve a pulsar «Publicar cambios».

Las coordenadas `lat` y `lng` se aceptan con coma o con punto decimal. «Publicar cambios» siempre las guarda como números. Si una coordenada es imposible (por ejemplo, 10409), la repara: usa las coordenadas verificadas de la carga inicial o, para empresas nuevas, la ciudad y el país. Eso pasa al importar un CSV en una hoja configurada en español, donde «10.409» se lee como diez mil cuatrocientos nueve.

## Qué se publica y qué no

| Pestaña | Columnas públicas | Columnas que nunca salen del archivo de edición |
|---|---|---|
| Orgullo | nombre, carrera, cohorte, cargo, ubicacion, logro, categoria, destacado, foto, fuente, fuente_texto | estado, verificado_por, notas, fecha_propuesta, propuesto_por, correo_proponente, relacion |
| Empresas | empresa, fundador, carrera, ciudad, pais, lat, lng, rubro, descripcion, fuente, fuente_texto, verificacion | estado, verificado_por, notas, fecha_propuesta, contacto_nombre, contacto_correo |

## Instalación (una sola vez)

1. **Generar los datos actuales.** En la carpeta del repositorio: `node tools/exportar-datos-ceseg.js`. Crea `dist-google-sites/datos/orgullo-edicion.csv` y `empresas-edicion.csv` (21 fichas y 9 empresas, ya «Aprobado»).
2. **Crear el archivo de edición.** En Google Drive, hoja de cálculo nueva llamada `Datos CESEG – edición`. Compártela como **editor** solo con el equipo de la CESEG. No la compartas con enlace.
3. **Cargar Orgullo.** Cambia el nombre de la primera pestaña a `Orgullo`. **Archivo › Importar › Subir** › `orgullo-edicion.csv` › «Reemplazar la hoja actual».
4. **Cargar Empresas.** Crea una pestaña `Empresas` y repite con `empresas-edicion.csv`.
5. **Instalar el script.** **Extensiones › Apps Script**, borra lo que haya y pega [`apps-script/datosCeseg.gs`](apps-script/datosCeseg.gs). Guarda. Elige la función `instalar` y pulsa **Ejecutar**. Acepta los permisos (si sale «Google no ha verificado esta aplicación»: Configuración avanzada › Ir a … › Permitir).
   - Crea la pestaña `Vacantes`, las listas desplegables y los tres formularios, con este archivo como destino de sus respuestas.
   - Al terminar muestra los **enlaces de los tres formularios**. También se ven después con el menú **CESEG › Ver enlaces de los formularios**.
6. **Publicar por primera vez.** Recarga la hoja. Aparece el menú **CESEG**. Pulsa **Publicar cambios**. En `Ciudades CESEG` aparecen las pestañas `Orgullo` y `Empresas`.

Mientras esas pestañas no existan, las páginas usan los datos del repositorio (`src/data/`). Cuando existen, usan la hoja.

## Actualizar el script

Cuando cambie `datosCeseg.gs` en el repositorio: **Extensiones › Apps Script**, borra todo el código, pega la versión nueva y guarda. No hace falta volver a ejecutar `instalar`; los formularios y el disparador siguen igual. Después, **CESEG › Publicar cambios**.

## Los formularios

`instalar` los crea con las preguntas de [`apps-script/datosCeseg.gs`](apps-script/datosCeseg.gs) (constante `FORMULARIOS`). Si se cambia el título de una pregunta en Google Forms, hay que cambiarlo también en el script; si no, esa respuesta no llega a su columna.

- **Proponer un egresado destacado:** cualquier persona propone a un egresado con logros nacionales o internacionales. Pide un enlace a una fuente pública. El nombre y el correo de quien propone no se publican.
- **Registrar una empresa de egresados USB:** la llena la propia empresa. Los datos de contacto no se publican. Incluye una autorización para publicar.
- **Publicar una vacante:** reemplaza el formulario que abría un correo.

Los formularios quedan abiertos a personas fuera de la USB (`setRequireLogin(false)`). Si Google Workspace de la USB lo impide, en cada formulario: **Configuración › Respuestas › desmarcar «Restringir a usuarios de usb.ve»**.
