# Globo «Egresados por el mundo»

El globo de `cesegEgresados.html` pone una cebolla en cada ciudad donde vive al menos un egresado que respondió el **Censo de Egresados CESEG USB**. La ficha de cada cebolla dice solo la ciudad, el país y cuántos egresados hay allí.

## Cómo viajan los datos

```
Formulario «Censo de Egresados CESEG USB»
   ↓
Hoja de respuestas (PRIVADA, no se publica)
   └─ Apps Script ciudadesCenso.gs, al recibir cada respuesta:
        1. lee solo «Indique en que país reside actualmente»
           e «Indique en que ciudad reside actualmente»
        2. ubica la ciudad con el geocodificador de Google
        3. suma cuántas respuestas hay por ciudad
   ↓
Archivo PÚBLICO «Ciudades CESEG», pestaña «Ciudades»
   columnas: pais, ciudad, lat, lng, egresados
   ↓ compartido como «Cualquier persona con el enlace: lector»,
   ↓ leído como CSV por /gviz/tq?tqx=out:csv&headers=1&sheet=Ciudades
cesegEgresados.html → atributo data-csv del globo
```

Las respuestas nunca salen del archivo privado. El archivo público es otro archivo, no una pestaña del de respuestas. Así, el enlace de la página no deja ver nombres, correos ni empresas.

**Nunca** pongas en `data-csv` la dirección de la hoja de respuestas. Tampoco compartas ni publiques ese archivo ni su pestaña «Ciudades (cache)».

## Instalación (una sola vez)

1. **Crear el archivo público.** En Google Drive, crea una hoja de cálculo nueva llamada `Ciudades CESEG`. Copia su ID: es la parte de la dirección que va entre `/d/` y `/edit`.
2. **Abrir el editor de scripts.** Abre la hoja de respuestas del formulario del censo. Ve a **Extensiones › Apps Script**.
3. **Pegar el script.** Borra lo que haya en `Código.gs` y pega el contenido de [`apps-script/ciudadesCenso.gs`](apps-script/ciudadesCenso.gs). En la línea `ID_HOJA_PUBLICA`, reemplaza `PEGAR_AQUI_EL_ID_DE_LA_HOJA_PUBLICA` por el ID del paso 1. Guarda.
4. **Instalar.** En la barra de arriba, elige la función `instalar` y pulsa **Ejecutar**. Google pedirá permisos para leer la hoja, escribir en la hoja pública, usar Maps y crear el disparador. Acepta.
   - `instalar` crea el disparador que se ejecuta con cada respuesta nueva.
   - También carga una vez **todas las respuestas anteriores**.
5. **Compartir la hoja pública.** En `Ciudades CESEG`, pulsa **Compartir** y, en «Acceso general», elige **Cualquier persona con el enlace** como **Lector**. Comprueba que el archivo tenga la pestaña **Ciudades** con las columnas `pais, ciudad, lat, lng, egresados`.
6. **Conectar el globo.** En `cesegEgresados.html`, el atributo `data-csv` lleva el ID de `Ciudades CESEG` en esta forma (el `&` se escribe `&amp;` dentro del HTML):

   ```html
   <div id="globo-egresados" class="ceseg-globo" data-csv="https://docs.google.com/spreadsheets/d/ID_DE_CIUDADES_CESEG/gviz/tq?tqx=out:csv&amp;headers=1&amp;sheet=Ciudades" …>
   ```

   Hoy apunta a `12z13lgy7Z_Em34rRlHqD8ckCrf-NTZo6zGDwk7JwMZM`. Esta dirección permite que otra página lea el CSV, y los cambios se ven casi al instante. «Publicar en la Web» también sirve, pero tarda unos 5 minutos en refrescar y es fácil publicar la pestaña equivocada.

## Una cebolla por ciudad

- Si diez personas escriben `Caracas`, la ciudad aparece una vez con «10 egresados».
- `Caracas`, `caracas` y `Caracas, DC` se suman cuando el geocodificador las ubica en la misma ciudad. El nombre que se publica es el que devuelve Google, en español.
- La página vuelve a sumar las filas repetidas por si acaso, así que nunca aparecen dos cebollas para la misma ciudad.

## Ciudades que no se pudieron ubicar

El script crea en el archivo de respuestas una pestaña privada, **Ciudades (cache)**. Allí queda cada combinación escrita de país y ciudad, y dónde se ubicó. No guarda nombres.

Si una fila dice `REVISAR`, el geocodificador no la reconoció (por ejemplo, un error de tipeo). Esa ciudad no sale en el globo hasta que alguien la corrija:

1. En esa fila, escribe a mano `pais`, `ciudad`, `lat` y `lng`. La latitud y la longitud se copian de Google Maps: clic derecho sobre la ciudad y luego el primer renglón del menú.
2. Cambia `estado` a `OK`.
3. En Apps Script, ejecuta `actualizarCiudades`.

Para corregir una ciudad mal ubicada, edita su fila de la misma forma.

## Notas

- Una respuesta nueva aparece en el globo cuando el script termina de actualizar la hoja, normalmente en menos de un minuto.
- Si alguien de la CESEG cambia el acceso de `Ciudades CESEG` a «Restringido», el globo dirá «No se pudo leer la lista de ciudades».
- El geocodificador de Apps Script tiene un cupo diario. La cache evita repetir consultas: cada combinación escrita se ubica una sola vez.
- **Probar sin la hoja.** Con `node _serve.js`, abre http://127.0.0.1:8765/cesegEgresados.html?demo. El globo usa entonces `src/data/egresadosMundoDemo.csv`, con ciudades de prueba que no son datos reales.
- Si `data-csv` está vacío, la página dice «Aún no hay ciudades registradas.».
- El mismo CSV alimenta el contador del banner del censo (Inicio y Egresados), con el atributo `data-csv` del banner. Las páginas las genera la misma plantilla, así que los dos usan la misma dirección.
- El atributo `data-censo` del globo es la dirección del formulario del censo, para el botón «¿No ves tu ciudad? Agrégala».

## Egresados que llegan por la Feria de Empleo (fase 4 de la feria)

Desde el 22 de noviembre de 2026, el globo suma también a quienes llenaron el **Perfil de postulante** de la feria declarándose egresados de la USB **y no respondieron el censo**. El script de la feria escribe la pestaña **«Perfiles de la feria»** en este mismo archivo de respuestas; `ciudadesCenso.gs` la lee, descarta por carnet o correo a quien ya está en el censo y suma el resto. Corre al recibir cada respuesta y **cada hora** (disparador que crea `instalar`). Detalle: `Feria_Emp/docs/conexiones.md`.

