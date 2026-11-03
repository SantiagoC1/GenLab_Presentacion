# Instrucciones para Claude Code: presentación del chatbot GenLab como proyecto local

## Contexto

Junto con este archivo está `chatbot.html`, una presentación de 11 diapositivas hecha en un solo HTML (CSS y JS inline). Sirve de referencia exacta de diseño, copy y comportamiento. Hay que convertirla en un proyecto que se corra en mi computadora, ordenado y fácil de editar, sin cambiar cómo se ve ni cómo se comporta.

## Regla del proyecto

Todo el código va en inglés: nombres de archivos, variables, funciones, clases CSS, ids y comentarios. Lo único que queda en español es el contenido que se muestra en pantalla (los textos de las diapositivas).

## Stack

- Vite con JavaScript vanilla (sin framework). Dependencias mínimas.
- Fuentes: Fraunces, Figtree y JetBrains Mono. Instalarlas con `@fontsource` (Fraunces, Figtree, JetBrains Mono) en vez de Google Fonts, para que la presentación funcione sin internet el día de la exposición.
- Sin librerías de animación. Todo el movimiento es CSS más un poco de JS, como en la referencia.

## Estructura esperada

```
genlab-chatbot-presentation/
├─ index.html
├─ package.json
├─ README.md
└─ src/
   ├─ main.js            # bootstraps the deck
   ├─ deck.js            # navigation: keyboard, buttons, swipe, hash, progress, dots
   ├─ typing.js          # typewriter effect for slide 1
   ├─ split-words.js     # splits headings into animated words
   ├─ content/
   │  ├─ slides.js       # slide markup or data (Spanish copy lives here)
   │  ├─ response-types.js  # the 4 types for slide 4 tabs
   │  └─ demo-steps.js   # the 10 demo steps for slide 9
   ├─ components/        # tabs.js (slide 4), demo-stepper.js (slide 9)
   └─ styles/
      ├─ tokens.css      # colors, fonts, light/dark themes
      ├─ base.css
      ├─ animations.css
      └─ slides.css
```

Si algún archivo no hace falta, no lo crees. Prefiero pocos archivos claros a una estructura exagerada.

## Qué hay que respetar de la referencia

1. Las 11 diapositivas con el mismo contenido y el mismo orden.
2. Tema oscuro por defecto con acento verde azulado, y tema claro vía `prefers-color-scheme` más `data-theme`. Todos los colores salen de variables CSS.
3. Navegación: flechas, PageUp/PageDown, espacio, Home/End, botones Anterior/Siguiente, puntos clicables, barra de progreso, swipe en celular, y el número de diapositiva en el hash de la URL (`#3`).
4. Animaciones de entrada que se reinician cada vez que se entra a una diapositiva, y respeto total de `prefers-reduced-motion` (sin movimiento y todo visible).
5. Interactivos: las pestañas de tipos de respuesta (diapositiva 4) y el recorrido de 10 pasos de la demo (diapositiva 9).
6. Responsive hasta 400 px de ancho, sin scroll horizontal en la página.

## Mejoras que sí quiero

1. Modo presentador: con la tecla `P` se abre una segunda ventana con las notas de la diapositiva actual, el cronómetro y la diapositiva siguiente, sincronizada con `BroadcastChannel`. Las notas salen de `slides.js` (campo `notes`), que por ahora puedo completar yo después. Dejá notas de ejemplo breves en las 11.
2. Tecla `F` para pantalla completa.
3. Diapositiva 6: que cada marco acepte una imagen. Si existe un archivo en `public/screenshots/` con el nombre `200.png`, `401.png`, `422.png`, `429.png` o `503.png`, se muestra automáticamente en su marco. Si no existe, se ve el marco con el texto de "Pegar captura". Documentar esto en el README.
4. Un comando para generar un PDF de las diapositivas (una por página, 16:9) usando Playwright: `npm run export:pdf`. Es opcional si complica el proyecto; en ese caso, solo dejalo documentado.

## Qué no hay que hacer

- No agregar contenido nuevo ni cambiar el texto de las diapositivas.
- No poner tokens, claves ni URLs reales en el código. Los placeholders (`sb_publishable_xxx`, `<token del grupo>`) quedan tal cual.
- No dividir en componentes de más ni meter un framework.

## Cómo correrlo

El README tiene que explicar, en pocas líneas:

```
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/
npm run preview    # serve the build
```

Y también: teclas disponibles, cómo agregar capturas y cómo editar el contenido de una diapositiva.

## Criterio de terminado

- `npm install` y `npm run dev` funcionan en limpio.
- Se ve igual que `chatbot.html` (abrí los dos lado a lado y compará las 11 diapositivas).
- `npm run build` no da errores y `dist/` funciona abriéndolo con `npm run preview`.
- Probado a 1280 px y a 400 px de ancho, en tema oscuro y claro.
- No queda ninguna dependencia de internet en tiempo de ejecución (fuentes incluidas).
