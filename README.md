# Presentación del chatbot de GenLab

Presentación de 10 diapositivas sobre el chatbot de GenLab (módulo adicional 8, M11): qué recibe el endpoint, qué devuelve, qué errores da y cuándo. Hecha con Vite y JavaScript vanilla, sin frameworks. Las fuentes están incluidas en el proyecto, así que funciona sin internet.

Dura unos 18,5 minutos (más unos 7 segundos de intro) con la demo en vivo. Es de uso interno del equipo para la clase, y no contiene claves ni tokens reales.

## Índice

- [Requisitos](#requisitos)
- [Empezar](#empezar)
- [Diapositivas](#diapositivas)
- [Teclas y navegación](#teclas-y-navegación)
- [Modo presentador](#modo-presentador)
- [Editar el contenido](#editar-el-contenido)
- [Capturas de pantalla](#capturas-de-pantalla)
- [Marca y colores](#marca-y-colores)
- [Animaciones](#animaciones)
- [Exportar a PDF](#exportar-a-pdf)
- [Checklist del día de la presentación](#checklist-del-día-de-la-presentación)
- [Problemas frecuentes](#problemas-frecuentes)
- [Estructura del proyecto](#estructura-del-proyecto)

## Requisitos

- Node.js 20 o superior.
- Google Chrome instalado, solo para exportar a PDF y sacar capturas de revisión.

## Empezar

```
npm install
npm run dev
```

Se abre en `http://localhost:5173`.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión estática en `dist/` |
| `npm run preview` | Sirve la versión de `dist/` (la que conviene usar el día de la clase) |
| `npm run export:pdf` | Genera `genlab-chatbot.pdf`, una diapositiva por página en 16:9 |

## Diapositivas

| N.º | Título | Min |
| --- | --- | --- |
| 1 | Qué es y para quién | 1 |
| 2 | POST /chat: lo que recibe | 2 |
| 3 | Dos credenciales, dos funciones | 1,5 |
| 4 | POST /chat: lo que devuelve y los cuatro tipos | 2 |
| 5 | Códigos de estado y cuándo ocurren | 2 |
| 6 | Capturas de los cinco casos | 1 |
| 7 | Pruebas de caja negra | 2,5 |
| 8 | Health: ¿está disponible? | 0,5 |
| 9 | Demostración en vivo | 5 |
| 10 | Tres datos y dos headers alcanzan | 1 |

Si falta tiempo, acortá las diapositivas 2 a 7 y no la demo.

## Teclas y navegación

| Tecla | Acción |
| --- | --- |
| `→`, `PageDown`, `Espacio` | Diapositiva siguiente |
| `←`, `PageUp` | Diapositiva anterior |
| `Inicio` / `Fin` | Primera / última diapositiva |
| `F` | Pantalla completa |
| `T` | Alterna entre tema oscuro y claro (se recuerda) |
| `P` | Abre la ventana del presentador |
| `I` | Vuelve a reproducir la animación de entrada (para ensayar) |

También se puede navegar con los botones de la barra inferior, con los puntos, deslizando en el celular o abriendo la URL con el número de diapositiva (`#3` abre la tercera).

## Modo presentador

Con `P` se abre una segunda ventana con las notas de la diapositiva actual, el cronómetro y la diapositiva siguiente. El cronómetro muestra el tiempo transcurrido contra el planificado (18:30, la suma de `minutes` de las diapositivas) y se pone en naranja si te pasás. Sigue a la presentación y también puede controlarla, con las flechas o con sus propios botones.

Las dos ventanas tienen que estar en el mismo navegador y en la misma dirección (por ejemplo, las dos en `localhost:5173`). Si las abrís en navegadores distintos o con `127.0.0.1` en una y `localhost` en otra, no se sincronizan.

Para proyectar: arrastrá la ventana de la presentación al proyector, apretá `F` y dejá la del presentador en tu pantalla.

## Editar el contenido

Todo lo que se ve está en `src/content/`:

| Archivo | Qué contiene |
| --- | --- |
| `slides.js` | Una entrada por diapositiva: `title` (el nombre del punto de navegación), `minutes` (el tiempo planificado), `notes` (notas del orador) y `html` (el marcado de la diapositiva, con los textos en español) |
| `response-types.js` | Las 4 pestañas de la diapositiva 4 |
| `demo-steps.js` | Los 10 pasos de la diapositiva 9. El paso del 429 tiene un valor `countdown` para la cuenta regresiva |

Reglas para los textos: voseo, frases cortas y sin rayas largas (—) como conector. Los nombres técnicos (`tipo`, `Retry-After`, `conversacion_id`) no se traducen.

## Capturas de pantalla

Las imágenes van en `public/screenshots/`:

| Archivo | Dónde se muestra |
| --- | --- |
| `200.png`, `401.png`, `422.png`, `429.png`, `503.png` | Diapositiva 6, un marco por caso |
| `health.png` | Diapositiva 8 |

Si falta un archivo, el marco muestra «Pegar captura» y no abre el visor.

Al hacer clic en una captura (o `Enter` si tiene el foco), se abre en grande. Las flechas cambian de imagen, y `Esc` o un clic afuera cierran el visor.

**Cómo se generaron:** son renders del pedido y la respuesta de cada caso, sacados contra el servidor local del chatbot con los casos de `chatbot.http`. Las claves y el token están enmascarados (`sb_publishable_xxx`, `<token del grupo>`). Si regenerás alguna, mantené ese enmascarado y no pongas ningún valor real.

## Marca y colores

El diseño es oscuro por defecto y no depende del modo del sistema, para que se vea igual en cualquier proyector. Con `T` se cambia al tema claro.

Los colores son variables CSS en `src/styles/tokens.css` y no hay colores sueltos en otros archivos. La paleta sale del logo de GenLab:

| Rol | Oscuro | Claro |
| --- | --- | --- |
| Fondo | `#0D1015` | `#F6F7FB` |
| Violeta (marca) | `#6D3DF0` | `#5B34D6` |
| Magenta | `#FF5FB7` | `#C2257F` |
| Cian | `#74D7EC` | `#0E7C8B` |
| Naranja (acento único) | `#FF8A4C` | `#B4531A` |
| Texto | `#EAF0F6` | `#14122B` |

Reglas de uso:

- El degradé violeta, magenta y cian se usa solo en las palabras destacadas de los títulos y en la barra de progreso.
- El naranja aparece una sola vez por diapositiva, en lo más importante de esa pantalla.
- Los códigos de estado tienen colores propios, separados de la marca: verde (200), rojo (401), ámbar (422 y 429) y cian (503).
- Todos los pares de texto y fondo cumplen contraste AA (4,5:1).

Los logos están en `public/brand/`, en versión oscura y clara. Se cambian solos según el tema. El favicon y el ícono de aplicación también salen de ahí.

## Animaciones

Las transiciones entre diapositivas, las entradas escalonadas, la secuencia pedido y respuesta (diapositivas 2, 4 y 9), los contadores de los códigos y el visor de capturas usan CSS y la Web Animations API. No hay librería de animación, y solo se mueven `transform` y `opacity`.

Con «reducir movimiento» activado en el sistema, todo aparece de golpe, no hay conteos ni escritura progresiva, y el paso del 429 muestra «Retry-After: 50» como texto fijo.

### Animación de entrada

Antes de la diapositiva 1 se reproduce una intro de unos 7 segundos: partículas que flotan y se condensan en el ícono del logo, «GEN LAB» que aparece letra por letra, una pausa para leerlo y el logo que se acomoda en su lugar mientras se construye la pantalla de bienvenida. Está en `src/intro.js`, y todos los tiempos son constantes en segundos al principio de ese archivo (objeto `SECONDS`) para ajustarlos.

- Se reproduce **cada vez** que se abre o se recarga la página sin número de diapositiva o con `#1` (el link que lleva el QR termina en `#1`, así que también se ve desde el celular).
- Se reproduce de nuevo **cada vez que volvés a la diapositiva 1** (flecha izquierda, `PageUp`, `Inicio` o el primer punto). La diapositiva anterior sale con su transición normal y recién ahí empieza la intro.
- No hay intro si la URL pide otra diapositiva (`#2` a `#10`) ni con «reducir movimiento» activado. Ojo: muchos celulares tienen «quitar animaciones» activado en accesibilidad, y entonces tampoco se ve.
- Para saltarla: clic, `Espacio`, `Enter`, `Esc` o cualquier flecha. Queda la diapositiva 1 completa. `F`, `P` y `T` siguen funcionando. Mientras corre, la navegación está desactivada y el presentador ya muestra la diapositiva 1 (el cronómetro no se reinicia).
- `I` la reproduce de nuevo (útil para ensayar).
- Si el logo no carga, la intro se salta sin mostrar errores. En celular arranca con el logo más chico y la mitad de las partículas.

## Exportar a PDF

```
npm run export:pdf
```

Genera `genlab-chatbot.pdf` con una diapositiva por página, en 16:9. Usa Playwright con tu Chrome instalado. Si falla, corré una vez `npx playwright install chromium`.

Para revisar cómo se ve a distintos tamaños: `npm run build` y después `node scripts/capture-preview.mjs`. Las capturas quedan en `docs/preview/`.

## Publicar en GitHub Pages

La presentación se publica sola con `.github/workflows/deploy.yml` en cada push a `main` (`npm ci`, `npm run build` y las acciones oficiales de GitHub Pages).

1. Creá el repositorio en GitHub (por ejemplo `GenLab_Presentacion`) y subí el código a la rama `main`. Si tu rama local se llama `master`, renombrala con `git branch -M main`.
2. En el repositorio: **Settings > Pages > Build and deployment > Source: GitHub Actions**.
3. Hacé push. En la pestaña **Actions** se ve el despliegue, y el sitio queda en `https://<usuario>.github.io/<repositorio>/`.

El workflow pasa `VITE_BASE=/<repositorio>/` a Vite, porque el sitio vive en una subruta. En local no hace falta: `npm run dev` y `npm run preview` usan `/`. Para probar la subruta en tu máquina (en PowerShell): `$env:VITE_BASE="/GenLab_Presentacion/"; npm run build; npm run preview`. En Git Bash, anteponé `MSYS_NO_PATHCONV=1`, o convierte la ruta en una de Windows.

### El código QR

Las diapositivas 1 y 10 muestran un QR que apunta a `PRESENTATION_URL`, definida en `src/config.js` (hoy `https://santiagoc1.github.io/GenLab_Presentacion/#1`). Para cambiarla, editá esa línea; si la dejás vacía, el QR no se muestra. También se puede sobreescribir con la variable `VITE_PRESENTATION_URL`.

- Se genera solo antes de `npm run dev` y `npm run build` (`scripts/make-qr.mjs`, paquete `qrcode`, sin internet) y queda en `public/brand/qr.svg`, que no se sube a Git. Para regenerarlo a mano: `npm run qr`.
- Es oscuro sobre fondo claro con margen de 4 módulos, para que se lea desde una pantalla oscura. Corrección de errores nivel M.
- No se muestra en celulares (hasta 560 px de ancho). También sale en el PDF.
- Para comprobar que decodifica exactamente la URL: `node scripts/verify-qr.mjs`.

### Antes de publicar: nada de claves reales

El repositorio y el sitio son públicos. No subas claves, tokens ni archivos `.env` (`.gitignore` ya excluye `.env`). Las diapositivas solo llevan los marcadores `sb_publishable_xxx` y `<token del grupo>`. Antes de publicar buscá en el proyecto `sb_publishable_` con valores distintos de `xxx`, `eyJ` (JWT), `token-local` y valores reales de `apikey`. La carpeta `design/` no está en `public/`, así que no se publica en el sitio (sí queda en el repositorio).

## Checklist del día de la presentación

- [ ] `npm run build` y `npm run preview` funcionando. Probalo sin internet.
- [ ] Sitio publicado abierto desde un celular: el QR de la pantalla principal lo lleva a la presentación.
- [ ] Las 6 capturas en `public/screenshots/` y visibles en las diapositivas 6 y 8.
- [ ] Servidor local del chatbot listo para la demo (`scripts/local-server.ts` del repo del chatbot, con Node 24: `node --experimental-strip-types --no-warnings scripts/local-server.ts`).
- [ ] `chatbot.http` con las variables completas en tu copia local, sin subirlas a Git.
- [ ] Para el 429 y el 503: la configuración cambiada de antemano o las capturas a mano. Después, devolver los valores normales.
- [ ] Pantalla completa (`F`) y ventana del presentador (`P`) probadas en el proyector real.
- [ ] Sin claves ni tokens reales a la vista. No abras el `.env` ni la lista de secretos.
- [ ] Plan B: el PDF exportado y las capturas, por si falla la red o el servidor.

## Problemas frecuentes

| Problema | Causa y solución |
| --- | --- |
| El presentador no sigue a la presentación | Están en navegadores o direcciones distintas. Abrí las dos en el mismo navegador y por `localhost` |
| El visor no abre una captura | Falta el archivo en `public/screenshots/` o tiene otro nombre. Tiene que llamarse exactamente `200.png`, `401.png`, etc. |
| `export:pdf` falla | Cerrá Chrome y reintentá. Si sigue, corré `npx playwright install chromium` una vez |
| Las animaciones no se ven | Tenés activado «reducir movimiento» en el sistema. Es el comportamiento esperado |
| La presentación aparece clara | Apretá `T`. El tema oscuro es el predeterminado, pero la elección se guarda en el navegador |
| Las fuentes no cargan sin internet | Corré `npm install` de nuevo: las fuentes vienen del paquete `@fontsource` |

## Estructura del proyecto

```
index.html / presenter.html   las dos páginas
.github/workflows/deploy.yml  publicación en GitHub Pages
public/
  screenshots/                capturas de los casos (200, 401, 422, 429, 503, health)
  brand/                      logos y favicon
src/
  main.js                     arranca la presentación
  config.js                   PRESENTATION_URL (dirección del QR)
  deck.js                     navegación, transiciones, hash, progreso, puntos y sincronización
  intro.js                    animación de entrada (partículas, logo, FLIP)
  motion.js                   detección de «reducir movimiento» y contadores
  typing.js                   efecto de escritura de la diapositiva 1
  split-words.js              palabras animadas en los títulos
  components/                 pestañas, recorrido de la demo, capturas y visor
  content/                    diapositivas, tipos de respuesta y pasos de la demo
  styles/                     tokens, base, animaciones, diapositivas, visor y presentador
scripts/
  export-pdf.mjs              exporta a PDF
  capture-preview.mjs         capturas de revisión en docs/preview/
  capture-intro.mjs           cuadros de la intro en docs/preview/intro/
  make-qr.mjs                 genera public/brand/qr.svg
  verify-qr.mjs               comprueba que el QR devuelve la URL
  check-contrast.mjs          tabla de contraste WCAG de los dos temas
```