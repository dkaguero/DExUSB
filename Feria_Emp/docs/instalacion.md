# Instalación de la base de datos de la feria

Se hace una sola vez, con la cuenta de Google de la USB de la CESEG.

## 1. Crear el archivo de edición (privado)

1. En https://drive.google.com: **+ Nuevo › Hojas de cálculo de Google › Hoja de cálculo en blanco**.
2. Nombre: `Feria CESEG – edición`.
3. **No lo compartas con enlace.** Más adelante se comparte como editor solo con el equipo de la CESEG.

## 2. Instalar el script

1. En ese archivo: **Extensiones › Apps Script**.
2. Borra lo que haya en `Código.gs` y pega todo el contenido de [`../back/apps-script/feria.gs`](../back/apps-script/feria.gs). Guarda (Ctrl+S).
3. Nombre del proyecto (arriba a la izquierda): `Feria CESEG – base de datos`.
4. En el menú de funciones elige **`instalar`** y pulsa **▷ Ejecutar**.
5. Acepta los permisos. Si sale «Google no ha verificado esta aplicación»: **Configuración avanzada › Ir a … (no seguro) › Permitir**. Pide acceso a hojas de cálculo y a Drive: crea el archivo público y la carpeta privada de archivos.
6. Al terminar muestra la dirección y el **ID del archivo público** («Feria CESEG – público»). Ese ID se pone en `Feria_Emp/front/src/comun/hoja.js` (`FE.HOJA_PUBLICA`) y se regeneran los widgets.

## Qué crea

**En el archivo de edición (privado):**

| Pestaña | Qué guarda |
|---|---|
| Configuracion | Nombre de la edición, fechas (por definir), horario y límites de charlas, correo de aviso, canal de YouTube e IDs |
| Planes | Platinum, Gold y Silver: precio, posiciones, límites y beneficios |
| Pabellones | Nombre, sector, color y número de posiciones (4 de muestra, editables) |
| Empresas | Solicitudes: estado, pago, especial, datos legales, pabellón, posición, plan, contactos, fundadores USB, aceptaciones |
| Stands | Contenido de cada stand: color, logo, banner, descripción, video, redes, WhatsApp, galería, folleto, sala de entrevistas |
| Vacantes | De la feria y de la Bolsa de Trabajo |
| Perfiles | Perfil de postulante (fase 2) |
| Postulaciones | Postulaciones y CV compartidos (fase 2) |
| Charlas | Solicitudes y agenda del auditorio |
| Universidades | Catálogo (5 del proyecto original) |
| Patrocinantes | Logos de la portada |
| Eventos | Analítica (fase 7) |

**Archivo público** «Feria CESEG – público» (lector con enlace, sin datos personales): Edicion, Planes, Pabellones, Stands, Vacantes, Charlas, Patrocinantes.

**Carpeta privada** «Feria CESEG – archivos (privado)»: para CV, logos y folletos (fases 2 y 7).

## Menú «Feria CESEG»

- **Publicar cambios:** copia al archivo público solo lo que cumple las reglas y avisa de lo que quedó fuera:
  - stand: empresa **Aprobada**, pago **Confirmado** (o empresa especial), stand **Aprobado**, pabellón y posición válidos y libres;
  - el plan del stand es el de su posición (Platinum 1-5, Gold 6-10, Silver 11-15);
  - vacantes **Aprobadas**, de la Bolsa o de una empresa publicada, hasta el máximo de su plan;
  - charlas **Aprobadas**, con fecha y hora, de empresas cuyo plan las incluye o de la CESEG.
- **Cargar datos de ejemplo:** 6 empresas ficticias del proyecto original, con stand, vacantes y una charla para mañana a las 10:00. Todas llevan `demo = Sí`.
- **Borrar datos de ejemplo:** quita todas las filas con `demo = Sí` y vuelve a publicar. Hay que hacerlo antes de abrir la convocatoria.
- **Ver el archivo público:** muestra su dirección y su ID.
