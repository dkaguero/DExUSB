# Informe de la copia local del Decanato de Extensión

Fecha del informe: 4 de noviembre de 2026. Última actualización de este texto: la misma fecha, al cerrar los enlaces locales de cursos y diplomados y dejar la carpeta lista para Git.  
Carpeta de trabajo: `C:\Users\karin\DExWeb`.  
Sigue siendo una copia estática del sitio que dejó de estar activo en http://www.dex.usb.ve. Todavía no es un repositorio Git. La sección 9 dice cómo están ordenados los archivos y qué falta para subirlo.

El informe sigue el orden de los cambios: la captura original, la reconstrucción local, las noticias confirmadas, la nómina, los ajustes posteriores, los botones bajo Somos USB y la preparación de la carpeta.

## 1. El sitio original

El sitio público del Decanato de Extensión (http://www.dex.usb.ve) no estaba activo. La referencia usada fue Internet Archive (Wayback Machine).

Ese archivo conserva dos sitios distintos, no dos versiones del mismo diseño.

### Captura de septiembre de 2017

- Fecha de referencia: 25 de septiembre de 2017.
- Sistema: Drupal 7, tema Sky.
- Contenido típico: misión, estructura, personal, documentos, noticias del decanato, galería y páginas sueltas (`node/…`).
- La hoja de estilos original de ese tema no estaba archivada. Para reconstruir la apariencia se usó el CSS público del tema Sky 7.x-1.6.
- El logotipo archivado de esa época era una imagen transparente. La cabecera visible era texto.

Esa copia se armó primero y después se dejó de usar como sitio principal.

### Captura del 17 de marzo de 2024

- Fecha exacta de la portada: 17 de marzo de 2024 (marca de archivo `20240317041152`).
- Diseño distinto: Bootstrap 3.3.7, autor indicado en la página como Mabraca.
- La portada trae el logo del Decanato, el menú, el texto de la misión y el cartel de preinscripción de inglés.
- Las demás secciones del menú no se archivaron ese mismo día. Se usaron las capturas más cercanas del mismo diseño, de abril y mayo de 2024.
- Los archivos estáticos (CSS, JavaScript e imágenes) corresponden sobre todo a capturas de julio de 2024 y, en el caso de varios PDF, de noviembre de 2023.

Esta captura de 2024 es la base de la copia que está abierta ahora.

### Lo que el original de 2024 ya traía roto

En la captura, estos elementos no tenían destino (`href="#"`):

- Galería de Imágenes
- Sede del Litoral
- Noticias
- Botones de Banco de Proyectos, Así lo Recuerdo y Extensión en Acción
- Enlaces del pie: Calendario, Directorio USB, Aula Virtual USB, Webmail y Buscador

Extensión en Acción era solo una imagen, también en el sitio de 2017: no tenía enlace.

Varios PDF de Documentos y de Documentos NAEX estaban nombrados en el HTML, pero el archivo no venía en la primera descarga.

## 2. Cambios para reconstruir la copia local

Estos cambios no reescriben el contenido institucional. Sirven para que la copia de 2024 se abra sin depender de Wayback Machine.

1. La portada (`index.html`) pasó a ser la del 17 de marzo de 2024. La reconstrucción Drupal de 2017 dejó de ser la página de inicio.
2. Se publicaron las páginas interiores del mismo diseño: estructura, personal, documentos, documentos NAEX, enlaces, reseña histórica, La Simón Emprende, apoyo administrativo, educación permanente y UCIDEX.
3. Las direcciones absolutas del sitio (`/estructuraO`, `/cursos/…`) se convirtieron en rutas relativas, para que funcionen al abrir los archivos en esta carpeta.
4. Se quitaron las direcciones de Wayback Machine del HTML. En las páginas actuales no queda ninguna URL de `web.archive.org`.
5. Se eliminó el árbol Drupal de 2017 (páginas `node/`, tema Sky, módulos y la carpeta `sites/`) después de copiar a la carpeta de 2024 los archivos que las páginas nuevas todavía necesitaban. Entre ellos, el logo OXI y los PDF de NAEX que ya estaban guardados.
6. Se completaron los PDF que el HTML de 2024 pedía y que sí estaban en el archivo:
   - Documentos: reglamento de educación permanente 2018, RAE, criterios 2015 versión ejecutiva, preproyectos, instrumento de evaluación, informe final y políticas deportivas.
   - NAEX: normativa 2013, PLANEx, informes de gestión 2010-2011, 2011-2012 y 2012-2014, lineamientos de redes, comunicado, bibliografía 2012 y el acta del 27 de marzo de 2003.
7. Enlaces que en 2024 estaban vacíos y tenían un destino conocido:
   - Sede del Litoral → http://www.ceu.sl.usb.ve/
   - Banco de Proyectos → en este paso, http://uast.dex.usb.ve/node/33. Después pasó a la copia local `bancoProyectos.html` (sección 8).
   - Así lo Recuerdo → página local `asilore.html`, con el texto y los videos de YouTube que conservaba la página de 2017
   - Calendario, Directorio USB, Aula Virtual, Webmail y Buscador → las direcciones de la USB que usaba el sitio de 2017
   - «Cursos de Extensión» en Educación Permanente → en este paso, http://curso.dex.usb.ve/ofertaAcad. Después pasó a `ofertaAcad.html` (sección 8).
   - La dirección visible http://www.dex.usb.ve apunta, al hacer clic, a `index.html`, porque el sitio original no responde
   - Correos que estaban escritos como direcciones web pasaron a `mailto:`
   - Direcciones viejas de Twitter y Facebook con `#!` se normalizaron
8. Páginas locales creadas porque el archivo de 2024 no las tenía como HTML propio:
   - `galeria.html`: lista de títulos de álbumes tomada de la galería de 2017. Los álbumes en sí no estaban archivados, así que los títulos no tienen enlace.
   - `asilore.html`: contenido de «Así lo Recuerdo».
   - `noticias.html` y `servicioComunitario.html`: primero se armaron con material de 2017 y después se actualizaron (sección 3).
9. Las tres áreas internas de UCIDEX (comunicación, informática y composición gráfica) no existen en el archivo. En `ucidex.html` quedaron como texto, no como enlaces rotos.
10. Los dos organigramas grandes de la reseña histórica no estaban en el archivo. En su lugar se usan las imágenes más pequeñas que sí se conservaban de 2017, con los nombres de archivo que pedía la página de 2024.

## 3. Actualizaciones de contenido aprobadas el 4 de noviembre de 2026

Fuente: USB Noticias (https://www.usbnoticias.usb.ve/), contrastada con el sitio de la USB (https://www.usb.ve). El texto se redactó, se mostró y se publicó solo después de la confirmación. En esta ronda no se cambiaron nombres de cargos. Esa revisión quedó para la sección 5.

### Noticias (`noticias.html`)

Se quitó el listado de 2013-2017. La primera publicación dejó cuatro notas vigentes (29/10, 27/10, 08/10 y 07/10). Después se pidió archivar la feria de julio y su cronograma, y crear la nota de la feria virtual. La lista que está publicada, de la más nueva a la más vieja, es esta:

| Fecha de la nota | Contenido |
| --- | --- |
| 04/11/2026 | Feria de Empleo Virtual de la USB, en desarrollo. Próximamente. Enlaza a `feriaEmpleo.html`. |
| 29/10/2026 | II Feria de Emprendedores USB, del 30 de noviembre al 4 de diciembre de 2026. Enlaza a La Simón Emprende. |
| 27/10/2026 | Taller de inducción al Servicio Comunitario del trimestre septiembre-diciembre 2026. El plazo para pedir cupo venció el 28 de octubre de 2026. |
| 08/10/2026 | Cronograma de Servicio Comunitario, septiembre-diciembre 2026. Enlaza a `servicioComunitario.html`. |
| 07/10/2026 | Charla informativa de inscripción de pasantías en Sartenejas, realizada el 13 de octubre de 2026. |
| 16/07/2026 | Actualización del Cronograma de Pasantías Empresariales 2025-2026. La atención de esa convocatoria cerró el 23 de julio de 2026. |
| 18/05/2026 | Feria de Pasantías, Empleo y PYMES USB 2026-1, prevista del 1 al 3 de julio de 2026. No se realizó por el terremoto. |

### Servicio Comunitario (`servicioComunitario.html`)

Se sustituyó el aviso de inscripción del 18 y 19 de septiembre de 2017 por el cronograma de septiembre-diciembre 2026 publicado por USB Noticias el 8 de octubre de 2026:

- Inscripción desde la semana 4, para quien cumple los requisitos de ley.
- Ejecución de las actividades de campo.
- Recepción de informes en las semanas 11 y 12.
- Plazos distintos para las cohortes septiembre-diciembre 2025, enero-marzo 2026 y abril-julio 2026.
- Consultas: `coord-psc@usb.ve` (Sartenejas) y `psc-sl@usb.ve` (Litoral).
- Se aclara que el plazo del Taller de Inducción venció el 28 de octubre de 2026.

### La Simón Emprende (`emprendeUSB.html`)

Se añadió, encima de los audios de 2019, la II Feria de Emprendedores USB: del 30 de noviembre al 4 de diciembre de 2026, de 9:00 a.m. a 3:00 p.m., en el Conjunto de Auditorios. Los stands son gratuitos para la comunidad universitaria y egresados con proyecto propio. El correo de expositores es `ceseg@usb.ve`. Los audios de 2019 se conservaron.

### Personal (`Personal.html`)

No se cambió ningún nombre. Solo se agregaron dos correos citados por USB Noticias el 7 de octubre de 2026:

- Coordinación de Extensión Sede Litoral: `coordext-sl@usb.ve`, junto al correo que ya tenía María Magnolia Claudeville.
- Programa de Cooperación Técnica Sede Litoral: `pct-sl@usb.ve`, junto a los correos que ya tenía Elzy Tamara Visbal Pérez.

## 4. Lo que sigue igual que en la captura de 2024

No hubo noticia que obligara a reescribir el texto institucional de estas páginas:

- Misión, en `index.html`. El cartel de la portada sí cambió: ver la sección 6.
- Estructura organizacional y organigrama (`estructuraO.html`). El dibujo del organigrama se dejó igual.
- Documentos y Documentos NAEX
- Enlaces de interés
- Reseña histórica
- Galería (sigue siendo la lista de títulos de 2017)
- Así lo Recuerdo
- Educación Permanente. El enlace «Cursos de Extensión» pasó después a `ofertaAcad.html` (sección 8).
- UCIDEX
- Unidad de Apoyo Administrativo

La nómina de `Personal.html` dejó de coincidir con la captura de 2024 a partir de las correcciones de la sección 5.

## 5. Correcciones de personal, 4 de noviembre de 2026

Archivo: `Personal.html`. Cada punto se publicó solo después de la indicación recibida. Donde se pidió usar el correo escrito, se cambió el enlace `mailto` para que abra esa dirección y se dejó el texto visible igual.

Criterio usado en los correos: vale la dirección que se lee en la página. El enlace viejo de la captura, cuando no coincidía, se descartó.

### Sartenejas

| Punto | Cargo | Cómo quedó |
| --- | --- | --- |
| 2 | Asistente al Decano, Noralih Hernández | El texto y el enlace son `noralih@usb.ve`. La captura abría `mbellorin@usb.ve`. |
| 4 | Jefe de la Unidad de Administración, Evelyn Lara | El texto y el enlace son `elara@usb.ve`. La captura abría `nrodriguez@usb.ve`. |
| 5 | Asistente administrativo, Karen Otero | El texto y el enlace son `kotero@usb.ve`. La captura abría `nrodriguez@usb.ve`. |
| 8 | Jefe de la Unidad de Participación y Acción Social | Pasa a ser Francisca Morales, con `francismoraless@usb.ve`. Sale Elinor Cones y `econes@usb.ve`. |
| 9 | Programa de Desarrollo Local Comunitario | El nombre pasa de Francis Morales a Francisca Morales. El correo sigue siendo `francismoraless@usb.ve`. |
| 11 | Coordinadora de Emprendimiento y Seguimiento de Egresados | Pasa a ser Ing. Desiree Agüero. Correos `09-11250@usb.ve` y `ceseg@usb.ve`, cada uno enlazado a su propia dirección. Salen Maribel Rodríguez de Pepe, `mpepe@usb.ve` y `ceseg@dex.usb.ve`. En este paso el texto de Twitter seguía siendo `@ueseg`. Pasó a `@ceseg_usb` en la sección 6. |
| 12 | Coordinadora de Educación Permanente | Pasa a ser Prof. Neida Salomé Sanabria, con `nsanabria@usb.ve`. El nombre completo se confirmó para publicarlo así. El correo se tomó de la página de postgrado de la USB, donde figura como responsable con `nsanabria@usb.ve`. Sale María Antonia Cervilla de Olivieri y `mcervilla@usb.ve`. Se conserva `@cursosdex_usb`. |
| 15 | Asistente de Servicio Comunitario | Se quitó el nombre de Gustavo Maiz y el correo `gmaiz@usb.ve`. Queda solo `coord-psc@usb.ve`. |
| 18 | Coordinador de Cooperación Técnica | Pasa a ser Prof. Hermann Albrecht, con `albrecht@usb.ve`. Sale Alberto Eduardo Paz Gómez y `aepaz@usb.ve`. Se mantienen `coord-ccc@usb.ve` y `@usbpasantias`. |

### Sede del Litoral

| Punto | Cargo | Cómo quedó |
| --- | --- | --- |
| 22 | Asistente administrativo, Diana Mata | El texto y el enlace son `dianamata@usb.ve`. La captura abría `meivimarodriguez@usb.ve`. |
| 23 | Administradora, Yriana Abadía | El texto y el enlace son `yabadia@usb.ve`. La captura abría `meivimarodriguez@usb.ve`. |
| 24 | Educación Permanente, Illeny Aponte | El texto y el enlace son `illenyaponte@usb.ve`. La captura abría `mclaudeville@usb.ve`. |
| 25 | Secretaria, Francys Leal | El texto y el enlace son `nathleal@usb.ve`. La captura abría `meivimarodriguez@usb.ve`. |
| 26 | Cooperación Técnica, Elzy Tamara Visbal Pérez | El correo personal abre `evisbal@usb.ve`. La captura abría `aropoeza@usb.ve`. Se mantienen `pct-sl@usb.ve` y `coop-emp@usb.ve`. El nombre pasó de Elzy a Elsy, con el prefijo Prof., en la sección 6. |
| 28 | Secretaria de Cooperación Técnica, Meivimar Rodríguez | El correo personal abre `meivimarodriguez@usb.ve`. La captura abría `zparra@usb.ve`. Se mantiene `coop-emp@usb.ve`. |
| 29 | Acción Social, Enif Cothua | Quedan `enif@usb.ve` y `psc-sl@usb.ve`, cada uno enlazado a su propia dirección. Se eliminó el enlace a `aropoeza@usb.ve`. |
| 30 | Secretaria de Acción Social, Meivimar Rodríguez | El texto y el enlace son `meivimarodriguez@usb.ve`. La captura abría `zparra@usb.ve`. |
| 31 | Emprendimiento, Laura Millán | Quedan `lauramillan@usb.ve` y `peseg-sl@usb.ve`, cada uno enlazado a su propia dirección. La captura abría `aropoeza@usb.ve` y `coop-emp@usb.ve`. |
| 33 | Representante estudiantil, Gianfranco Rodríguez | El texto y el enlace son `gianrdv@gmail.com`. La captura abría `fabianaariasp@gmail.com`. |

### Fichas retiradas

Estas personas estaban solo en comentarios del HTML y ya no trabajan en el Decanato porque están jubiladas. Se borraron los comentarios:

- Edison Izaguirre, asesor curricular (`dex-acurricular@usb.ve`)
- Yelitza Anselmi, cursos de idiomas (`yanselmi@usb.ve`)
- Judith Bracamonte, formación comunitaria (`jbracamo@usb.ve`)
- Arelys Lamas, asistente de la Coordinación de Formación General Complementaria (`evoso@usb.ve`)
- Natala Martínez, asistente de la Coordinación de Extensión del Litoral (`npmartinez@usb.ve`)

## 6. Ajustes confirmados después de la nómina

Las personas que no se corrigieron en la sección 5 siguen en su cargo. El 4 de noviembre de 2026 se pidió solo completar prefijos, un correo y dos erratas. El organigrama de `estructuraO.html` se deja como está.

### Prefijos en `Personal.html`

| Persona | Cómo queda |
| --- | --- |
| Decana | Prof. Maria Cristina Hernandez Tuero |
| Asistente al decano | Lic. Noralih Hernández |
| Unidad de Administración | Lic. Evelyn Lara |
| UCIDEX | Lic. Marhely Vivas |
| Área de Informática | Ing. Gerson Salazar |
| Diplomados | Lic. Mariana Walker |
| Formación General Complementaria | Prof. Narciso Andres Perez Santodomingo |
| Igualdad de Oportunidades | Prof. Alexander José Natera Marcano |
| Cooperación Técnica | Prof. Hermann Albrecht, que ya tenía el prefijo |
| Extensión, Sede del Litoral | Prof. María Magnolia Claudeville |
| Cooperación Técnica, Sede del Litoral | Prof. Elsy Tamara Visbal Pérez. El nombre pasa de Elzy a Elsy. |

### Correo, Twitter y erratas

- Punto 32: Fabiana Arias queda con `fabianaariasp@gmail.com`, sin el punto que había antes de `@`. Se quitó el enlace vacío que abría otra dirección.
- El Twitter de Emprendimiento y Seguimiento de Egresados pasa de `@ueseg` a `@ceseg_usb` y abre https://twitter.com/ceseg_usb.
- El título de Personal pasa de «Decanató» a «Decanato».
- «Actulización» pasa a «Actualización» en Diplomados y Cursos de Actualización Profesional.

### Afiche y noticias

- El afiche de preinscripción de inglés de la portada se sustituyó por `cursos/static/img2/feriaEmpleo.jpg`. Usa el mismo formato: marco amarillo, logo de la USB, título en rojo y la fecha en verde, «Próximamente». Abre `feriaEmpleo.html`.
- La Feria de Pasantías, Empleo y PYMES USB 2026-1 no se realizó por el terremoto. En Noticias queda como prevista del 1 al 3 de julio de 2026, y se indica que está en desarrollo la versión virtual. Se mantiene el archivo de la actualización del Cronograma de Pasantías Empresariales 2025-2026 (nota del 16/07/2026; la atención cerró el 23 de julio de 2026).

## 7. Nombres propios corregidos

- Meivimar Rodrígez pasó a Meivimar Rodríguez en las dos secretarías del Litoral. El correo sigue siendo `meivimarodriguez@usb.ve`.
- Danielys Galipoly pasó a Danielys Galipoli. El correo sigue siendo `danielysgalipoli@usb.ve`.
- En La Simón Emprende, el audio del 10 de mayo de 2019 pasó de Gustavo Rodrígez a Gustavo Rodríguez.

Al 4 de noviembre de 2026, las fuentes públicas consultadas no traen una designación nueva de la decana. En junio de 2025, María Cristina Hernández aparecía todavía como decana de Extensión en una actividad institucional. Eso no se usó para cambiar el cargo.

## 8. Botones bajo Somos USB, copias locales

Los seis botones que están debajo de Somos USB apuntaban a sitios que ya no responden (`curso.dex.usb.ve`, `cfcg.dex.usb.ve`, `cct.dex.usb.ve`, `uast.dex.usb.ve` y el censo). Se buscó la captura más cercana de cada destino en Wayback Machine y se guardó en este backup. El botón abre la copia local, no web.archive.org. El mismo cambio quedó en todas las páginas con esa columna, y en «Cursos de Extensión» de Educación Permanente.

| Botón | Archivo local | Captura usada |
| --- | --- | --- |
| Cursos | `ofertaAcad.html` | 28 de mayo de 2024, oferta académica |
| Diplomados | `diplomados.html` | 19 de febrero de 2025 |
| Servicio Comunitario | `cfcgServicio.html` | 23 de mayo de 2024, CFCG |
| Pasantías | `pasantiaEmpresarial.html` | 16 de noviembre de 2025, CCT |
| Banco de Proyectos | `bancoProyectos.html` | 15 de julio de 2018. No hay captura posterior entre 2019 y 2026 |
| Censo de egresados | `censoEgresados.html` | 6 de enero de 2020. La de 2021 solo dice «Estamos trabajando…» y no se publicó |

También se guardaron los íconos de las áreas de la oferta, los carteles de Sartenejas y Litoral, los logos y hojas de estilo de CFCG y CCT, las imágenes del formulario del censo (incluido el fondo del pie de página) y el logo del tema de 2018 del banco. El ícono InfoDEx y la imagen pequeña del banco quedaron en `cursos/static/img2/infodex2.png` y `uast/cebolla_70_45.jpg`.

En la columna lateral del banco de 2018, los botones de cursos, diplomados, servicio comunitario, pasantías, banco, InfoDEx y censo abren las mismas páginas locales. Sus imágenes salen de `cursos/static/img2/`. El logo de esa captura sale de `uast/themes/sky/logo.png`.

Después se pidió que las áreas de cursos y de diplomados tampoco salieran al sitio original. Ningún HTML de esta carpeta apunta ya a `curso.dex.usb.ve`.

| Dónde se pulsa | Abre |
| --- | --- |
| Cada área de `ofertaAcad.html`, y los carteles de Sartenejas y del Litoral en esa página | `ofertaAcad.html` |
| Ingeniería y Tecnología dentro de la oferta de cursos | `diplomados.html` |
| Cada área enlazada de `diplomados.html` | `diplomados.html` |

Administración, Artes, Idiomas y Políticas Públicas, en la página de diplomados, siguen sin enlace, igual que en la captura. Esas fichas de área no existen en el archivo: el clic abre la lista local, no una página que no se pudo guardar. El cartel viejo de idiomas que quedó comentado en `index.html` también apunta a `ofertaAcad.html`.

Lo que no estaba archivado y por eso no está en el backup:

- Las páginas de cada área de cursos y de diplomados. Un ejemplo, Administración, no tiene ninguna captura.
- Los diagramas `PlanTrimestralSC.jpg` y `ActivityDiagram_SC.jpg` de Servicio Comunitario. El texto los nombra, pero el archivo de imágenes no los tiene.
- Las hojas de estilo y scripts del tema Sky de 2018. El banco se lee como texto, sin la maquetación de entonces.
- El inicio de sesión del censo. El formulario se ve y sus imágenes cargan (`censo/img/`). La acción del formulario está vacía: el PHP que validaba la clave no está en el archivo. «Regístrese aquí» y «¿Olvidó su contraseña?» siguen apuntando a `./php/`, que tampoco se guardó.
- Las secciones internas de CFCG y de CCT (quiénes somos, formatos, reglamentos, tipos de pasantía y tutores). Siguen enlazadas a `cfcg.dex.usb.ve` y `cct.dex.usb.ve`.
- El menú interno del banco de 2018 (`/node/16`, `/node/27` y el resto). Esas páginas de la Unidad de Apoyo no tienen copia en esta carpeta.

De la captura de 2018 del banco se quitó un script de minado (CoinHive) que venía al principio del HTML. No se volvió a guardar. El texto publicado no contiene esa palabra.

## 9. Cómo quedó ordenada la carpeta

No se movió ningún HTML ni ninguna imagen para «ordenar» antes de Git. Las páginas buscan sus archivos con rutas relativas (`cursos/static/…`, `cfcg/static/…`, `cct/static/…`, `censo/…`, `uast/…`). Cambiar de carpeta esas piezas rompería el sitio.

| Qué hay | Para qué está |
| --- | --- |
| HTML en la raíz | 25 archivos. Veintitrés son páginas del sitio y dos, `emprendeUSB.html` y `feriaEmpleo.html`, solo redirigen. Entre las páginas nuevas de esta ronda están `ceseg.html`, `feriaVirtual.html` y `sedeLitoral.html` |
| `cursos/` | Tema de 2024: CSS, JavaScript, imágenes, íconos, PDF y el afiche `feriaEmpleo.jpg`. Unos 12,6 MB |
| `cfcg/` | Tema que usa `cfcgServicio.html`. Incluye una copia del tema de cursos más el logo y las imágenes propias de CFCG. Unos 12,8 MB |
| `cct/` | Tema que usa `pasantiaEmpresarial.html`. Misma situación: copia del tema más las imágenes de pasantías. Unos 12,6 MB |
| `censo/` | CSS, favicon e imágenes del formulario de 2020, fondo del pie incluido. Unos 0,2 MB |
| `uast/` | Logo Sky y la imagen pequeña del banco de 2018 |
| `_serve.js` | Servidor local. Con `node _serve.js` el sitio se abre en http://127.0.0.1:8765/ |
| `INFORME-CAMBIOS.md` | Este informe |
| `.gitignore` | Deja fuera `Thumbs.db`, `Desktop.ini`, `.DS_Store`, `*.log` y `.vscode/` |

Esas tres copias del tema visual se conservan a propósito. Servicio Comunitario y Pasantías no funcionan si se les quita su carpeta para dejar una sola.

El repositorio local se creó después, con el commit `904848a`, y se publicó en https://github.com/dkaguero/DExUSB, rama `main`.

## 10. CESEG y la coordinación del Litoral, 5 de noviembre de 2026

La Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG) es la de la Sede Sartenejas. La de la Sede del Litoral es otra coordinación, con su propio responsable y su propio correo.

En `Personal.html`:

- Sartenejas queda como «Coordinación de Emprendimiento y Seguimiento de Egresados (CESEG), Sede Sartenejas»: Ing. Desiree Agüero, `09-11250@usb.ve`, `ceseg@usb.ve` e Instagram `@ceseg_usb`. El enlace que decía Twitter ahora abre https://www.instagram.com/ceseg_usb/. Lo mismo quedó en `ceseg.html`.
- El Litoral deja de llamarse programa y queda como «Coordinación de Emprendimiento y Seguimiento de Egresados, Sede Litoral»: Laura Millán, `lauramillan@usb.ve` y `peseg-sl@usb.ve`.

La página nueva es `ceseg.html`. El menú que decía «La Simón Emprende» ahora dice CESEG y abre esa página. En la estructura organizacional, el enlace de CESEG también abre `ceseg.html`.

`ceseg.html` tiene cuatro partes, solo de Sartenejas:

- La coordinación y los datos de la Ing. Desiree Agüero.
- La II Feria de Emprendedores USB, del 30 de noviembre al 4 de diciembre de 2026.
- La Feria Virtual de Pasantías, Empleo y PYMES, con fecha «Próximamente». Después de esa palabra está el enlace «más información», que abre `feriaVirtual.html`. Esa página queda reservada para publicar luego la feria. También se conserva la nota de que la feria presencial de julio de 2026 no se realizó por el terremoto.
- La Simón Emprende, como sección, con los audios de 2019.

El afiche de la portada y las dos noticias correspondientes abren esas secciones. `emprendeUSB.html` redirige a La Simón Emprende dentro de `ceseg.html`. `feriaEmpleo.html` redirige a `feriaVirtual.html`.

Las unidades y coordinaciones de la Sede del Litoral también están en `sedeLitoral.html`. El menú «Sede del Litoral» y el enlace de Extensión Sede Litoral en la estructura abren esa página. La ficha de Personal se mantiene.

`sedeLitoral.html` reúne, con los mismos datos ya publicados en Personal:

- Coordinación de Extensión: Prof. María Magnolia Claudeville, `mclaudeville@usb.ve`, `coordext-sl@usb.ve` y `@extensionlit`. Asistente Diana Mata. Administradora Yriana Abadía.
- Programa de Educación Permanente: Illeny Aponte y la secretaria Francys Leal.
- Programa de Cooperación Técnica: Prof. Elsy Tamara Visbal Pérez, la asistente Zaiduby Parra y la secretaria Meivimar Rodríguez.
- Programa de Acción Social y Desarrollo Comunitario: Enif Cothua y la secretaria Meivimar Rodríguez.
- Coordinación de Emprendimiento y Seguimiento de Egresados de la Sede del Litoral: Laura Millan, `lauramillan@usb.ve` y `peseg-sl@usb.ve`.

Esa coordinación del Litoral no forma parte de la CESEG. `ceseg.html` conserva su contenido: la coordinación de Sartenejas, la II Feria de Emprendedores, la Feria Virtual con el afiche, la fecha «Próximamente», el enlace «más información» y la sección La Simón Emprende. `feriaVirtual.html` repite el afiche y el texto de esa feria para que el enlace no abra una página vacía.
