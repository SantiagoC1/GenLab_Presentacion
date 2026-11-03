import { PRESENTATION_URL } from '../config.js';

// Slide content. Spanish copy lives here; `notes` feed the presenter window.
// `minutes` is the planned time (the presenter timer adds them up).
// `html` is the markup inside each <section class="slide">.

// QR code block (slides 1 and 10). Only exists when PRESENTATION_URL is set (src/config.js).
const shortUrl = PRESENTATION_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
const qr = (size) =>
  PRESENTATION_URL
    ? `<div class="qr qr-${size} fade" style="--i:12">
    <img src="brand/qr.svg" alt="Código QR para abrir la presentación en el celular" />
    <p>Abrila en tu celular</p>
    <code>${shortUrl}</code>
  </div>`
    : '';

export const slides = [
  {
    title: "Qué es",
    minutes: 1,
    notes: "La intro dura unos 7 segundos. Empezá a hablar cuando el logo llegue a su lugar. El chatbot es el módulo adicional 8. Atiende a pacientes con dudas sobre el estudio de exoma clínico y contesta en español. Lo importante es lo que no hace: no diagnostica ni interpreta resultados. Está publicado como módulo de Supabase, para que cualquier grupo lo use por HTTP.",
    html: `
<div class="inner hero">
  <div>
    <img class="logo logo-hero logo-dark" src="brand/01_horizontal_dark_transparente.svg" alt="GenLab, genética y biotecnología">
    <img class="logo logo-hero logo-light" src="brand/01_horizontal_light_transparente.svg" alt="GenLab, genética y biotecnología">
    <p class="kicker reveal">Módulo adicional 8 (M11)</p>
    <h1 data-split>Un chatbot para el <em>paciente</em></h1>
    <p class="lead reveal" style="--i:6">Contesta en español dudas sobre el estudio de exoma clínico. Responde solo desde una base curada de 10 textos. No diagnostica y no inventa.</p>
    <p class="reveal" style="--i:7;color:var(--muted);margin:0">Publicado como módulo de Supabase, para que cualquier grupo lo use por HTTP.</p>
  </div>
  <div class="chat reveal" style="--i:5" aria-label="Ejemplo de conversación">
    <div class="bubble user">¿Qué es un exoma clínico?</div>
    <div class="bubble assistant"><span id="typed-text">Es un estudio que lee las partes del ADN que fabrican proteínas. Sirve para buscar cambios que podrían explicar un cuadro clínico.</span></div>
    <span class="tag signal">tipo: respuesta</span>
  </div>
</div>
${qr('small')}
`,
  },
  {
    title: "La entrada",
    minutes: 2,
    notes: "Hay un solo endpoint de consulta, un POST. Lleva dos headers de credenciales y un cuerpo. El único campo obligatorio es el mensaje, de 1 a 1000 caracteres. El conversacion_id es opcional: sin él se abre una conversación nueva, y con él se sigue la anterior.",
    html: `
<div class="inner">
  <p class="kicker reveal">Un solo endpoint de consulta</p>
  <h2 data-split>POST /chat, lo que <em>recibe</em></h2>
  <div class="cols">
    <pre class="code"><span class="line" style="--i:1"><span class="tok-key">POST</span> https://&lt;ref&gt;.supabase.co/functions/v1/chat</span>
<span class="line" style="--i:2"><span class="tok-blue">apikey</span>: <span class="tok-string">sb_publishable_xxx</span></span>
<span class="line" style="--i:3"><span class="tok-blue">x-chatbot-token</span>: <span class="tok-string">&lt;token del grupo&gt;</span></span>
<span class="line" style="--i:4"><span class="tok-blue">Content-Type</span>: application/json</span>

<span class="line" style="--i:5">{
  <span class="tok-blue">"mensaje"</span>: <span class="tok-string">"¿Qué es un exoma clínico?"</span>,
  <span class="tok-blue">"conversacion_id"</span>: <span class="tok-key">null</span>
}</span></pre>
    <div class="panel reveal scroll" style="--i:4"><table>
      <tr><th>Campo</th><th>Obligatorio</th><th>Qué lleva</th></tr>
      <tr><td><code>apikey</code></td><td>Sí</td><td>Clave publishable del proyecto</td></tr>
      <tr><td><code>x-chatbot-token</code></td><td>Sí</td><td>Token de tu grupo</td></tr>
      <tr><td><code>mensaje</code></td><td>Sí</td><td>De 1 a 1000 caracteres, sin datos personales</td></tr>
      <tr><td><code>conversacion_id</code></td><td>No</td><td>Sin él se abre una conversación nueva. Con él se sigue la anterior</td></tr>
    </table></div>
  </div>
</div>
`,
  },
  {
    title: "Credenciales",
    minutes: 1.5,
    notes: "Usamos dos credenciales. La publishable es la del proyecto, la conocen todos y por sí sola no da privilegios. El token es de cada grupo: lo emitimos nosotros, tiene su propio límite y, si se filtra, lo revocamos sin afectar a los demás.",
    html: `
<div class="inner">
  <p class="kicker reveal">Dos headers, dos funciones</p>
  <h2 data-split>Una clave para <em>entrar</em>, un token para <em>identificarte</em></h2>
  <div class="cols">
    <div class="panel reveal" style="--i:3"><span class="tag">apikey</span>
      <h3 style="font-family:var(--serif);font-size:26px;margin:12px 0 8px">Clave publishable</h3>
      <p style="margin:0 0 6px">La conocen todos los grupos.</p>
      <p style="margin:0 0 6px">Te deja entrar al proyecto.</p>
      <p style="margin:0;color:var(--muted)">Por sí sola no da ningún privilegio.</p></div>
    <div class="panel accent reveal" style="--i:4"><span class="tag">x-chatbot-token</span>
      <h3 style="font-family:var(--serif);font-size:26px;margin:12px 0 8px">Token del grupo</h3>
      <p style="margin:0 0 6px">Es de un solo grupo y dice quién consulta.</p>
      <p style="margin:0 0 6px">Lo emitimos nosotros, por un canal privado.</p>
      <p style="margin:0;color:var(--muted)">Cada grupo tiene su propio límite y sus conversaciones separadas. Si se filtra, se revoca sin afectar a los demás.</p></div>
  </div>
</div>
`,
  },
  {
    title: "La salida",
    minutes: 2,
    notes: "Devuelve siempre tres campos: la respuesta, el conversacion_id y el tipo. Hay cuatro tipos. Respuesta, cuando hay información. Fuera de alcance, cuando no es sobre estudios genéticos. Derivar al médico, cuando pide un diagnóstico o habla de un síntoma o tratamiento. Y sin información, cuando es del tema pero la base no lo cubre.",
    html: `
<div class="inner">
  <p class="kicker reveal">Siempre tres campos</p>
  <h2 data-split>POST /chat, lo que <em>devuelve</em></h2>
  <div class="cols">
    <pre class="code" id="out-json"><span class="line" style="--i:1"><span class="tok-comment">// 200 OK</span></span>
<span class="line" style="--i:2">{</span>
<span class="line" style="--i:3">  <span class="tok-blue">"respuesta"</span>: <span class="tok-string">"Es un estudio que lee…"</span>,</span>
<span class="line" style="--i:4">  <span class="tok-blue">"conversacion_id"</span>: <span class="tok-string">"c_8f3a…"</span>,</span>
<span class="line" style="--i:5">  <span class="tok-blue">"tipo"</span>: <span class="tok-string" id="type-value">"respuesta"</span></span>
<span class="line" style="--i:6">}</span></pre>
    <div class="reveal" style="--i:4">
      <div class="tabs" id="type-tabs" role="tablist" aria-label="Tipos de respuesta"></div>
      <div class="panel" style="min-height:190px">
        <p class="sample-question" id="type-question">“¿Qué es la enfermedad de Fabry?”</p>
        <p id="type-description" style="margin:0;color:var(--muted)">Es del tema y hay información en la base.</p>
      </div>
      <p style="color:var(--muted);font-size:15px;margin:12px 0 0">En los cuatro casos el consumidor muestra el texto tal cual.</p>
      <p style="color:var(--muted);font-size:13.5px;margin:6px 0 0">En derivar_medico no se ofrece contacto con el laboratorio.</p>
    </div>
  </div>
</div>
`,
  },
  {
    title: "Códigos",
    minutes: 2,
    notes: "Los errores devuelven un JSON con la clave detail. 401 es por credenciales, 422 por un pedido inválido, 429 por pasarse de 20 consultas por minuto, 503 cuando está apagado, y 500 por una falla interna. Ojo con esto: si la IA no responde, no hay error. Contesta con su base y devuelve 200.",
    html: `
<div class="inner">
  <p class="kicker reveal">Cuando algo no sale bien</p>
  <h2 data-split>Códigos de estado y <em>cuándo</em> ocurren</h2>
  <div class="codes">
    <div class="status-card pop" style="--c:var(--status-ok);--i:1"><div class="status-number" data-count="200">200</div><h3>Todo bien</h3><p>Hay respuesta, de cualquiera de los cuatro tipos.</p></div>
    <div class="status-card pop" style="--c:var(--status-auth);--i:2"><div class="status-number" data-count="401">401</div><h3>Credenciales</h3><p>Falta la apikey o el token, o alguno es inválido.</p></div>
    <div class="status-card pop" style="--c:var(--status-warn);--i:3"><div class="status-number" data-count="422">422</div><h3>Pedido inválido</h3><p>Mensaje vacío, en blanco, de más de 1000 caracteres, ausente, de tipo incorrecto o un cuerpo que no es JSON.</p></div>
    <div class="status-card pop" style="--c:var(--status-warn);--i:4"><div class="status-number" data-count="429">429</div><h3>Demasiadas consultas</h3><p>Más de 20 por minuto del mismo grupo. Viene con Retry-After.</p></div>
    <div class="status-card pop" style="--c:var(--status-info);--i:5"><div class="status-number" data-count="503">503</div><h3>Apagado</h3><p>El chatbot está en mantenimiento. Mostrá el mensaje tal cual.</p></div>
    <div class="status-card pop" style="--c:var(--status-error);--i:6"><div class="status-number" data-count="500">500</div><h3>Falla interna</h3><p>Por ejemplo, si la base no responde.</p></div>
  </div>
  <div class="band reveal" style="--i:8"><b>Si la IA no responde, no hay error.</b> El chatbot contesta con la información de su base y devuelve 200.</div>
</div>
`,
  },
  {
    title: "Capturas",
    minutes: 1,
    notes: "Acá están los casos tal como los devuelve el servicio. Salen del servidor local, así que la ruta cambia en Supabase. Los hacemos grabados porque el 429 y el 503 piden cambiar la configuración. Si quieren ver alguno más de cerca, lo abrimos en grande.",
    html: `
<div class="inner">
  <p class="kicker reveal">Cada caso, tal como lo devuelve el servicio</p>
  <h2 data-split>Los <em>cinco</em> casos en pantalla</h2>
  <div class="shots">
    <figure class="shot-item pop" style="--i:1;--c:var(--status-ok)">
      <div class="shot-code">200</div>
      <button class="shot" type="button" disabled data-shot data-group="cases" data-code="200" data-alt="Captura del servidor local, caso 200. Consulta dentro de alcance. Devuelve respuesta, conversacion_id y tipo."><span class="shot-placeholder">Pegar captura</span></button>
      <figcaption>Consulta dentro de alcance. Devuelve respuesta, conversacion_id y tipo.</figcaption>
    </figure>
    <figure class="shot-item pop" style="--i:2;--c:var(--status-auth)">
      <div class="shot-code">401</div>
      <button class="shot" type="button" disabled data-shot data-group="cases" data-code="401" data-alt="Captura del servidor local, caso 401. Clave de API incorrecta."><span class="shot-placeholder">Pegar captura</span></button>
      <figcaption>Clave de API incorrecta.</figcaption>
    </figure>
    <figure class="shot-item pop" style="--i:3;--c:var(--status-warn)">
      <div class="shot-code">422</div>
      <button class="shot" type="button" disabled data-shot data-group="cases" data-code="422" data-alt="Captura del servidor local, caso 422. Mensaje vacío. El detail dice qué campo falló y por qué."><span class="shot-placeholder">Pegar captura</span></button>
      <figcaption>Mensaje vacío. El detail dice qué campo falló y por qué.</figcaption>
    </figure>
    <figure class="shot-item pop" style="--i:4;--c:var(--status-warn)">
      <div class="shot-code">429</div>
      <button class="shot" type="button" disabled data-shot data-group="cases" data-code="429" data-alt="Captura del servidor local, caso 429. Cuarta consulta con el límite en 3. Trae Retry-After."><span class="shot-placeholder">Pegar captura</span></button>
      <figcaption>Cuarta consulta con el límite en 3. Trae Retry-After.</figcaption>
    </figure>
    <figure class="shot-item pop" style="--i:5;--c:var(--status-info)">
      <div class="shot-code">503</div>
      <button class="shot" type="button" disabled data-shot data-group="cases" data-code="503" data-alt="Captura del servidor local, caso 503. Chatbot apagado por mantenimiento."><span class="shot-placeholder">Pegar captura</span></button>
      <figcaption>Chatbot apagado por mantenimiento.</figcaption>
    </figure>
  </div>
  <p class="reveal" style="--i:7;color:var(--muted);font-size:13.5px;margin:16px 0 0">Capturas del servidor local. En Supabase la ruta es <span class="mono">/functions/v1/chat</span>.</p>
</div>
`,
  },
  {
    title: "Caja negra",
    minutes: 2.5,
    notes: "Elegimos los casos por clases de equivalencia y valores límite: 1, 1000 y 1001 caracteres, vacío, solo espacios, tipos incorrectos, credenciales faltantes o inválidas y el límite de consultas. Están todos en chatbot.http, listos para ejecutar.",
    html: `
<div class="inner">
  <p class="kicker reveal">Clases de equivalencia y valores límite</p>
  <h2 data-split>Cómo elegimos qué <em>probar</em></h2>
  <div class="panel reveal scroll" style="--i:3"><table>
    <tr><th>Entrada</th><th>Resultado</th><th>Qué prueba</th></tr>
    <tr><td><span class="mono">"a"</span> (1 carácter)</td><td><span class="mono">200</span></td><td>Límite inferior válido</td></tr>
    <tr><td><span class="mono">"a" × 1000</span></td><td><span class="mono">200</span></td><td>Límite superior válido</td></tr>
    <tr><td><span class="mono">"a" × 1001</span></td><td><span class="mono">422</span> string_too_long</td><td>Un carácter de más</td></tr>
    <tr><td><span class="mono">""</span> y <span class="mono">"   "</span></td><td><span class="mono">422</span></td><td>Vacío y solo espacios</td></tr>
    <tr><td><span class="mono">42</span>, <span class="mono">{}</span>, no JSON</td><td><span class="mono">422</span></td><td>Tipo incorrecto, campo ausente, cuerpo inválido</td></tr>
    <tr><td>Sin apikey, sin token, token inventado o revocado</td><td><span class="mono">401</span></td><td>Cada forma de fallar la autenticación</td></tr>
    <tr><td>Cuatro consultas con el tope en 3</td><td><span class="mono">429</span> en la cuarta</td><td>Límite por grupo</td></tr>
  </table></div>
  <p class="reveal" style="--i:5;color:var(--muted);margin:14px 0 0">Todos los casos están en <span class="mono">chatbot.http</span>, listos para ejecutar uno por uno.</p>
</div>
`,
  },
  {
    title: "Health",
    minutes: 0.5,
    notes: "Además del chat hay un health, para saber si el servicio está disponible. Devuelve 200 con estado ok, o 503 si está apagado. No pide credenciales ni gasta cuota.",
    html: `
<div class="inner">
  <p class="kicker reveal">Otro endpoint, más simple</p>
  <h2 data-split>Health: ¿está <em>disponible</em>?</h2>
  <div class="health-layout">
    <button class="shot pop" style="--i:1" type="button" disabled data-shot data-group="health" data-code="health" data-alt="Captura del endpoint health: servicio disponible, responde 200 con estado ok."><span class="shot-placeholder">Pegar captura</span></button>
    <div class="health-panels">
      <div class="panel accent pop" style="--i:2"><div class="big-number" data-count="200" style="color:var(--status-ok)">200</div><pre class="code" style="margin-top:14px">{ <span class="tok-blue">"estado"</span>: <span class="tok-string">"ok"</span> }</pre></div>
      <div class="panel pop" style="--i:3"><div class="big-number" data-count="503" style="color:var(--status-info)">503</div><p style="color:var(--muted);margin:14px 0 0">El chatbot está apagado.</p></div>
    </div>
  </div>
  <p class="reveal" style="--i:5;color:var(--muted);margin:16px 0 0">No pide credenciales ni gasta cuota. Sirve para chequear antes de mostrar la ventana de chat.</p>
</div>
`,
  },
  {
    title: "Demo",
    minutes: 5,
    notes: "Ahora lo vemos en vivo. Les muestro lo que mandamos y lo que nos devuelve. Primero una consulta de Fabry, después un seguimiento, y después los errores.",
    html: `
<div class="inner">
  <p class="kicker reveal">Esto mandamos, esto nos devuelve</p>
  <h2 data-split>Demostración en <em>vivo</em></h2>
  <div class="demo reveal" style="--i:3">
    <div class="steps" id="demo-steps" role="list"></div>
    <div class="panel demo-panel">
      <span class="pulse" id="demo-pulse" aria-hidden="true"></span>
      <div class="result-row"><span class="badge" id="demo-badge">200</span><span class="mono" id="demo-type"></span></div>
      <pre class="code" id="demo-request" style="margin-bottom:10px"></pre>
      <pre class="code" id="demo-response"></pre>
      <p class="narration" id="demo-narration"></p>
    </div>
  </div>
  <p class="reveal" style="--i:5;color:var(--muted);font-size:14px;margin:12px 0 0">Los textos de respuesta que ven acá son abreviados. En la demo se ve el texto completo.</p>
</div>
`,
  },
  {
    title: "Cierre",
    minutes: 1,
    notes: "Para usarlo en su grupo alcanzan tres datos y dos headers: la URL, la clave publishable y su token. Van en el servidor, nunca en el navegador. Gracias, ¿preguntas?",
    html: `
<div class="inner">
  <p class="kicker reveal">Para usarlo en tu grupo</p>
  <p class="closing" data-split>Tres datos y dos headers <em>alcanzan</em></p>
  <div class="cols">
    <div class="reveal" style="--i:4">
      <pre class="code signal"><span class="tok-comment"># .env del servidor</span>
CHATBOT_URL=<span class="tok-string">https://&lt;ref&gt;.supabase.co/functions/v1/chat</span>
CHATBOT_APIKEY=<span class="tok-string">sb_publishable_xxx</span>
CHATBOT_TOKEN=<span class="tok-string">&lt;token del grupo&gt;</span></pre>
      <p style="color:var(--muted);font-size:15px;margin:10px 0 0">Van en el servidor del consumidor. Nunca en variables VITE_ ni NEXT_PUBLIC_.</p>
    </div>
    <div class="reveal" style="--i:5">
      <div class="pills"><span class="pill"><b>1</b> la URL</span><span class="pill"><b>2</b> la clave publishable</span><span class="pill"><b>3</b> el token del grupo</span></div>
      <div class="pills"><span class="pill"><b>apikey</b></span><span class="pill"><b>x-chatbot-token</b></span></div>
      <div class="closing-row">
        <div class="thanks${PRESENTATION_URL ? ' thanks-stack' : ''}">
          <img class="logo logo-thanks logo-dark" src="brand/04_vertical_dark_transparente.svg" alt="">
          <img class="logo logo-thanks logo-light" src="brand/04_vertical_light_transparente.svg" alt="">
          <p style="font-family:var(--serif);font-size:30px">Gracias. ¿Preguntas?</p>
        </div>
      </div>
    </div>
  </div>
</div>
${qr('large')}
`,
  },
];
