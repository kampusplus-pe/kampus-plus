/*
  Kampus+ - chatbot (asistente virtual)
  Lo hicimos a partir del ejemplo que vimos en clase (CRONICS ASESOR).
  Funciona así: enviarMensaje() muestra el mensaje del usuario con agregarMensaje()
  y después procesarRespuesta() busca qué contestar.
  Usa los productos de script.js, por eso en el HTML se carga después.
*/
(() => {
  'use strict';

  // ===== 1. Datos y funciones que vienen de script.js =====
  const {
    PRODUCTS, CATEGORIES, SELLERS,
    photo, money, normalize, discount, icon, toast, openProduct, reduceMotion
  } = window.Kampus;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ===== 2. Referencias a elementos del HTML =====
  const chatbot = $('#chatbot');
  const chatPanel = $('#chatbot-panel');
  const chatLauncher = $('#chatbot-launcher'); // botón redondo
  const chatHint = $('#chatbot-hint'); // globo de invitación
  const input = $('#inputMensaje');
  const boton = $('#botonEnviar');
  const cuerpo = $('#cuerpoChat');
  const FOTO_RESPALDO = 'img/producto.png'; // se usa si una foto no carga

  // ===== 3. Productos del chatbot =====
  // En el ejemplo de clase los productos se escribían a mano. Nosotros usamos
  // el mismo catálogo de la página (PRODUCTS) para no repetir datos, así si
  // agregamos un producto el chatbot también lo reconoce.
  // A cada producto le damos un ID de 3 dígitos (1 = "001").
  // PALABRAS_CLAVE: otras formas de nombrar cada producto (en minúsculas y sin tildes).
  const PALABRAS_CLAVE = {
    '001': ['calculadora', 'casio', 'fx-991', 'fx991', 'cientifica'],
    '002': ['poleron', 'hoodie', 'jean', 'casaca'],
    '003': ['stewart', 'serway', 'calculo', 'fisica'],
    '004': ['teclado', 'mecanico'],
    '005': ['estetoscopio', 'littmann', 'medicina'],
    '006': ['dibujo', 'escuadra', 'compas', 'escalimetro', 'arquitectura'],
    '007': ['audifono', 'auricular', 'headphones', 'cancelacion de ruido'],
    '008': ['mochila'],
    '009': ['ipad', 'tablet', 'tableta', 'apple pencil'],
    '010': ['emprendimiento', 'zero to one', 'negocios', 'startup'],
    '011': ['lampara', 'lampara led'],
    '012': ['tomatodo', 'termo', 'botella']
  };

  const productos = {};
  PRODUCTS.forEach((p) => {
    const id = String(p.id).padStart(3, '0');
    productos[id] = {
      id, // "001"
      idCatalogo: p.id, // para abrir la ficha del catálogo
      nombre: p.title,
      precio: p.price,
      precioTienda: p.oldPrice,
      categoria: CATEGORIES[p.category], // "Tecnología"
      claveCategoria: p.category, // "tecnologia"
      descripcion: p.description,
      stock: p.stock,
      oferta: `${discount(p)}% menos que en tienda`,
      vendedor: SELLERS[p.seller],
      entrega: p.meet,
      foto: photo(p.photos[0], 160),
      palabras: PALABRAS_CLAVE[id] || []
    };
  });
  const listaProductos = Object.values(productos);

  // Palabras que identifican cada categoría del catálogo
  const PALABRAS_CATEGORIA = {
    libros: ['libro', 'lectura'],
    tecnologia: ['tecnologia', 'electronica', 'gadget'],
    material: ['material', 'laboratorio', 'taller', 'utiles'],
    moda: ['moda', 'ropa', 'vestir'],
    accesorios: ['accesorio'],
    otros: ['otros', 'hogar']
  };

  // ===== 4. Utilidades del chatbot =====

  // Busca una palabra completa en el texto (también acepta plurales, mochila o mochilas)
  function contienePalabra(texto, palabra) {
    const segura = palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${segura}(e?s)?([^a-z0-9]|$)`).test(texto);
  }

  // Revisa si el texto tiene alguno de estos fragmentos (como el .includes() del ejemplo)
  const incluye = (texto, lista) => lista.some((fragmento) => texto.includes(fragmento));

  // Nombre corto para las sugerencias, por ejemplo "Calculadora científica Casio"
  function nombreCorto(nombre) {
    const palabras = nombre.replace(/[,:(].*$/, '').split(' ').slice(0, 3);
    while (palabras.length > 1 && ['y', 'de', 'del', 'con', 'para', '+', 'a', 'la', 'el'].includes(palabras[palabras.length - 1].toLowerCase())) {
      palabras.pop();
    }
    return palabras.join(' ');
  }

  // ===== 5. Plantillas de respuesta (HTML) =====

  // Ficha completa de un producto (equivale al "CASO 3" del ejemplo)
  function fichaProducto(p) {
    const v = p.vendedor;
    return `
      <div class="bot-product">
        <img src="${p.foto}" alt="" data-fallback="${FOTO_RESPALDO}" loading="lazy">
        <div>
          <strong>${p.nombre}</strong>
          <small>ID ${p.id} · ${p.categoria}</small>
          <div class="bot-price"><b>${money(p.precio, 2)}</b><s>${money(p.precioTienda)}</s></div>
        </div>
      </div>
      <ul class="bot-specs">
        <li><strong>Descripción:</strong> ${p.descripcion}</li>
        <li><strong>Stock:</strong> ${p.stock} ${p.stock === 1 ? 'unidad' : 'unidades'}</li>
        <li><strong>Oferta:</strong> ${p.oferta}</li>
        <li><strong>Vendedor:</strong> ${v.name} · ${v.uni} (★ ${v.rating.toFixed(1)})</li>
        <li><strong>Entrega:</strong> ${p.entrega}</li>
      </ul>
      <div class="bot-actions">
        <button type="button" class="bot-btn bot-btn--solid" data-product="${p.idCatalogo}">${icon('eye')} Ver producto</button>
        <button type="button" class="bot-btn" data-open="download"
                data-context="Descarga la app para comprar este producto con pago protegido.">Comprar en la app</button>
      </div>`;
  }

  // Lista de productos (equivale al comando "/listar" del ejemplo)
  function listaHTML(titulo, lista, pie = 'Toca un producto o escribe su ID para ver más detalles.') {
    const filas = lista.map((p) => `
      <button type="button" class="bot-item" data-ask="${p.id}">
        <img src="${p.foto}" alt="" data-fallback="${FOTO_RESPALDO}" loading="lazy">
        <span><strong>${p.nombre}</strong><small>ID ${p.id} · ${p.categoria}</small></span>
        <b>${money(p.precio)}</b>
      </button>`).join('');
    return `<p><strong>${titulo}</strong></p><div class="bot-list">${filas}</div><p><em>${pie}</em></p>`;
  }

  // Botón que lleva a una sección de la página
  const irA = (seccion, texto) =>
    `<div class="bot-actions"><button type="button" class="bot-btn" data-go="${seccion}">${texto} ${icon('arrow-right')}</button></div>`;

  const SALUDO_INICIAL = `
    <p>¡Hola! 👋 Soy el asistente virtual de <strong>Kampus+</strong>.</p>
    <p>Puedo ayudarte a encontrar productos, explicarte cómo vender con solo 5% de comisión
    y resolver tus dudas sobre pagos y entregas.</p>
    <p>Escribe <code>/listar</code> para ver el catálogo o elige una opción de abajo.</p>`;

  // ===== 6. Preguntas frecuentes =====
  // Cada tema tiene sus palabras clave y su respuesta.
  // Se usa el primer tema que coincida, por eso importa el orden.
  const TEMAS = [
    {
      claves: ['comision', 'cobran', 'cobra ', 'cuanto gano', 'ganancia', 'porcentaje', '5%', 'tarifa'],
      respuesta: (mensaje) => {
        // Si el usuario escribe un monto ("si vendo a 200"), calculamos su ganancia
        const monto = parseFloat((mensaje.match(/(\d+(?:[.,]\d+)?)/) || [])[1]?.replace(',', '.'));
        const ejemplo = monto && monto !== 5 ? monto : 100;
        return `
          <p>Publicar en Kampus+ es <strong>gratis</strong>. Solo se cobra <strong>5% de comisión</strong>
          cuando vendes, y el <strong>95%</strong> llega directo a tu Yape.</p>
          <p>Ejemplo: si vendes a <strong>${money(ejemplo, 2)}</strong>, recibes
          <strong>${money(ejemplo * 0.95, 2)}</strong> (comisión: ${money(ejemplo * 0.05, 2)}).</p>
          ${irA('#calculadora', 'Calcular mis ganancias')}`;
      }
    },
    {
      claves: [' app ', 'aplicacion', 'descarg', 'app store', 'play store', 'android', 'iphone'],
      respuesta: () => `
        <p>Puedes descargar la app de Kampus+ para iPhone y Android. Solo necesitas tu correo institucional.</p>
        <div class="bot-actions"><button type="button" class="bot-btn bot-btn--solid" data-open="download">${icon('download')} Descargar aplicación</button></div>`
    },
    {
      claves: ['contacto', 'soporte', 'asesor', 'humano', 'persona real', 'whatsapp', 'telefono', 'hablar con alguien'],
      respuesta: () => `
        <p>Puedes escribirle al equipo de Kampus+:</p>
        <ul>
          <li>Correo: <a href="mailto:kampusplus.pe@gmail.com"><strong>kampusplus.pe@gmail.com</strong></a></li>
          <li>WhatsApp: <a href="https://wa.me/51967207495" target="_blank" rel="noopener"><strong>+51 967 207 495</strong></a></li>
        </ul>`
    },
    {
      claves: ['seguro', 'segura', 'seguridad', 'confiable', 'confiar', 'estafa', 'fraude', 'robo', 'verificad'],
      respuesta: () => `
        <p>Kampus+ está pensado para que compres y vendas tranquilo:</p>
        <ul>
          <li>Solo estudiantes con correo <strong>@edu.pe</strong></li>
          <li>Perfiles con carrera, ciclo y calificaciones</li>
          <li>Pago protegido hasta que confirmas la entrega</li>
          <li>Entregas en lugares públicos cerca a tu U</li>
        </ul>`
    },
    {
      claves: ['devolucion', 'devolver', 'reembolso', 'defecto', 'fallad', 'no funciona', 'reclamo'],
      respuesta: () => `
        <p>Revisa el producto cuando lo recibas. Si no coincide con la publicación,
        <strong>no confirmes la entrega</strong>: el dinero no se libera al vendedor y te ayudamos a recuperarlo.</p>`
    },
    {
      claves: ['pago', 'pagar', 'yape', 'tarjeta', 'visa', 'mastercard', 'efectivo', 'plin', 'transferencia'],
      respuesta: () => `
        <p>Puedes pagar con <strong>Yape</strong> o con <strong>tarjeta</strong> de crédito o débito.</p>
        <p>Tu dinero queda protegido por Kampus+ y se libera al vendedor solo cuando confirmas que
        recibiste el producto. No se maneja efectivo.</p>`
    },
    {
      claves: ['vender', 'vendo', 'publicar', 'publico', 'subir un producto', 'subir mi'],
      respuesta: () => `
        <p>Vender en Kampus+ toma menos de 1 minuto:</p>
        <ol>
          <li>Toma fotos de lo que ya no usas.</li>
          <li>Pon título, precio y punto de entrega.</li>
          <li>Publica gratis: solo pagas 5% cuando se vende.</li>
        </ol>
        ${irA('#vende', 'Ver cómo publicar')}`
    },
    {
      claves: ['comprar', 'compro', 'adquirir', 'pedido'],
      respuesta: () => `
        <p>Comprar es muy fácil:</p>
        <ol>
          <li>Encuentra el producto (aquí o en el catálogo).</li>
          <li>Paga con Yape o tarjeta: tu dinero queda protegido.</li>
          <li>Recíbelo cerca de tu U y confirma la entrega.</li>
        </ol>
        ${irA('#compra', 'Ir al catálogo')}`
    },
    {
      claves: ['entrega', 'entregar', 'recoger', 'recojo', 'punto', 'donde', 'lugar', 'delivery', 'envio', 'encuentro'],
      respuesta: () => `
        <p>Por normativa de las universidades, las entregas se hacen <strong>fuera del campus</strong>,
        en puntos seguros: cafeterías externas, paraderos o plazoletas cercanas.</p>
        <p>La hora la coordinas con el vendedor por chat.</p>
        ${irA('#comunidad', 'Ver puntos seguros')}`
    },
    {
      claves: ['registr', 'cuenta', 'correo', 'edu.pe', 'inscrib', 'iniciar sesion', 'login'],
      respuesta: () => `
        <p>Para usar Kampus+ necesitas tu <strong>correo institucional</strong> (termina en <code>.edu.pe</code>).
        Así verificamos que solo participen estudiantes activos.</p>`
    },
    {
      claves: ['universidad', 'upc', 'pucp', 'utec', 'unmsm', 'ulima', 'u de lima', 'pacifico'],
      respuesta: () => `
        <p>Kampus+ está pensado para estudiantes de <strong>UPC, PUCP, UTEC, Universidad de Lima,
        UNMSM y Universidad del Pacífico</strong>.</p>
        <p>¿Tu universidad no está? Escríbenos a <strong>kampusplus.pe@gmail.com</strong>.</p>`
    },
    {
      claves: ['/ayuda', 'ayuda', 'que puedes hacer', 'que sabes', 'opciones', 'menu'],
      respuesta: () => `
        <p>Esto es lo que puedo hacer por ti:</p>
        <ul>
          <li><code>/listar</code> muestra todos los productos</li>
          <li>Escribe un producto (<em>mochila</em>, <em>casio</em>) o su ID (<code>001</code>)</li>
          <li>Pide opciones por precio: <em>menos de S/ 100</em></li>
          <li>Pregunta por comisión, pagos, entregas o seguridad</li>
        </ul>`
    },
    {
      claves: ['precio', 'cuesta', 'costo', 'cuanto vale'],
      respuesta: () => `
        <p>Dime el nombre o el ID del producto y te digo su precio (por ejemplo: <em>precio de la mochila</em> o <code>008</code>).</p>
        <p>También puedes pedir <em>productos de menos de S/ 100</em>.</p>`
    },
    {
      claves: ['gracias', 'genial', 'perfecto', 'buenisimo', 'excelente'],
      respuesta: () => '¡Con gusto! 😊 Si tienes otra duda, aquí estoy.'
    },
    {
      claves: ['adios', 'chau', 'chao', 'hasta luego', 'nos vemos'],
      respuesta: () => '¡Hasta pronto! Que te vaya súper en tus clases 📚'
    },
    {
      claves: ['hola', 'buenas', 'buenos dias', 'hey', 'que tal', 'saludos'],
      respuesta: () => `
        <p>¡Hola! 😊 ¿Buscas algún producto o quieres vender algo?</p>
        <p>Escribe <code>/listar</code> para ver el catálogo o pregúntame lo que necesites.</p>`
    }
  ];

  // ===== 7. Mostrar mensajes en el chat =====

  // Inserta un mensaje en el cuerpo del chat (igual que en el ejemplo)
  function agregarMensaje(tipo, contenido) {
    const mensaje = document.createElement('div'); // Crea la burbuja
    mensaje.className = 'mensaje ' + tipo; // Clase "usuario" o "bot"

    // A diferencia del ejemplo, el mensaje del usuario va con textContent
    // para que no se pueda meter código HTML en el chat.
    // Las respuestas del bot sí van con innerHTML porque las escribimos nosotros.
    if (tipo === 'usuario') mensaje.textContent = contenido;
    else mensaje.innerHTML = contenido;

    cuerpo.appendChild(mensaje); // Lo añade al chat
    cuerpo.scrollTop = cuerpo.scrollHeight; // Baja al último mensaje
    return mensaje;
  }

  // Burbuja de "escribiendo..." mientras el bot prepara su respuesta
  function mostrarEscribiendo() {
    const burbuja = agregarMensaje('bot escribiendo', '<span></span><span></span><span></span>');
    burbuja.setAttribute('aria-label', 'El asistente está escribiendo');
    return burbuja;
  }

  // ===== 8. Enviar un mensaje =====

  // Activa o desactiva el botón Enviar según haya texto (igual que en el ejemplo)
  input.addEventListener('input', () => {
    boton.disabled = input.value.trim() === '';
  });

  // Enviar con clic o con Enter
  boton.addEventListener('click', () => enviarMensaje());
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      enviarMensaje();
    }
  });

  // Función principal, recibe el texto del campo o de una sugerencia
  function enviarMensaje(textoSugerido) {
    const texto = (textoSugerido ?? input.value).trim();
    if (texto === '') return; // No enviar si está vacío

    agregarMensaje('usuario', texto); // 1) Mostrar mensaje del usuario
    input.value = ''; // 2) Limpiar el campo
    input.dispatchEvent(new Event('input')); //    y desactivar el botón

    const escribiendo = mostrarEscribiendo(); // 3) "Escribiendo..."
    const espera = 500 + Math.min(texto.length * 15, 500);
    setTimeout(() => {
      escribiendo.remove();
      procesarRespuesta(texto); // 4) Respuesta del bot
    }, reduceMotion ? 150 : espera);
  }

  // ===== 9. Cerebro del chatbot =====
  function procesarRespuesta(texto) {
    // Pasamos a minúsculas y sin tildes para comparar más fácil ("Tecnología" queda "tecnologia")
    const mensaje = normalize(texto);
    // Versión sin signos (¿ ? ¡ ! , ;) y con espacios a los lados, para buscar palabras sueltas como " app "
    const conEspacios = ` ${mensaje.replace(/[¿?¡!,;:]/g, ' ').replace(/\.(\s|$)/g, ' ')} `;

    // a) Comandos: /listar o frases como "ver productos" o "catálogo"
    if (mensaje.startsWith('/listar') || incluye(mensaje, ['catalogo', 'ver productos', 'todos los productos', 'lista de productos'])) {
      agregarMensaje('bot', listaHTML(`Productos disponibles (${listaProductos.length}):`, listaProductos));
      return;
    }

    // b) ID del producto: "001", "producto 5", "id 12", "#3"
    const matchId = mensaje.match(/(?:^|[^0-9])(0\d{2})(?:[^0-9]|$)/) ||
                    mensaje.match(/(?:id|producto|codigo|#)\s*#?\s*(\d{1,3})(?:[^0-9]|$)/);
    if (matchId) {
      const id = matchId[1].padStart(3, '0');
      if (productos[id]) {
        mostrarProducto(productos[id]);
      } else {
        agregarMensaje('bot', `No encontré el producto con ID <code>${id}</code>. Los IDs van del <code>001</code> al <code>${String(listaProductos.length).padStart(3, '0')}</code>. Escribe <code>/listar</code> para verlos.`);
      }
      return;
    }

    // c) Precio máximo: "menos de 100", "hasta S/ 50", "algo barato"
    const matchPrecio = mensaje.match(/(?:menos de|hasta|maximo|max|por debajo de|menor a|no mas de)\s*(?:s\/\.?\s*)?(\d+)/);
    if (matchPrecio) {
      const limite = Number(matchPrecio[1]);
      const baratos = listaProductos.filter((p) => p.precio <= limite).sort((a, b) => a.precio - b.precio);
      if (baratos.length) {
        agregarMensaje('bot', listaHTML(`Productos de hasta ${money(limite)} (${baratos.length}):`, baratos));
      } else {
        const masBarato = [...listaProductos].sort((a, b) => a.precio - b.precio)[0];
        agregarMensaje('bot', `No hay productos de hasta ${money(limite)} por ahora. El más económico es <strong>${masBarato.nombre}</strong> a ${money(masBarato.precio)}.`);
      }
      return;
    }
    if (incluye(mensaje, ['barato', 'economico', 'mas bajo'])) {
      const baratos = [...listaProductos].sort((a, b) => a.precio - b.precio).slice(0, 4);
      agregarMensaje('bot', listaHTML('Estos son los productos más económicos:', baratos));
      return;
    }

    // d) Producto por nombre o palabra clave
    // Cada producto suma un punto por cada palabra clave que aparece en el mensaje.
    const puntajes = listaProductos
      .map((p) => ({ p, puntos: p.palabras.filter((w) => contienePalabra(mensaje, w)).length +
                                 (mensaje.includes(normalize(p.nombre)) ? 3 : 0) }))
      .filter((r) => r.puntos > 0)
      .sort((a, b) => b.puntos - a.puntos);

    if (puntajes.length === 1 || (puntajes.length > 1 && puntajes[0].puntos > puntajes[1].puntos)) {
      mostrarProducto(puntajes[0].p);
      return;
    }
    if (puntajes.length > 1) {
      agregarMensaje('bot', listaHTML('Encontré estos productos:', puntajes.map((r) => r.p)));
      return;
    }

    // e) Categoría: "libros", "tecnología", "ropa", etc.
    for (const clave in PALABRAS_CATEGORIA) {
      if (PALABRAS_CATEGORIA[clave].some((w) => contienePalabra(mensaje, w))) {
        const deCategoria = listaProductos.filter((p) => p.claveCategoria === clave);
        agregarMensaje('bot', deCategoria.length
          ? listaHTML(`${CATEGORIES[clave]} (${deCategoria.length}):`, deCategoria)
          : `Aún no hay productos en <strong>${CATEGORIES[clave]}</strong>. ¡Puedes ser el primero en publicar uno!`);
        return;
      }
    }

    // Frases generales como "¿qué venden?" o "¿qué tienen?" muestran todo el catálogo
    if (incluye(mensaje, ['que venden', 'que tienen', 'que hay'])) {
      agregarMensaje('bot', listaHTML(`Productos disponibles (${listaProductos.length}):`, listaProductos));
      return;
    }

    // f) Preguntas frecuentes
    const tema = TEMAS.find((t) => incluye(conEspacios, t.claves));
    if (tema) {
      agregarMensaje('bot', tema.respuesta(mensaje));
      return;
    }

    // g) Si no entendió nada, respuesta por defecto
    agregarMensaje('bot', `
      <p>Lo siento, aún estoy aprendiendo 🤖 y no entendí tu mensaje.</p>
      <p>Puedes probar con <code>/listar</code>, el nombre de un producto (por ejemplo <em>mochila</em>),
      su ID (<code>001</code>) o preguntas como <em>¿cuánto cobran?</em></p>`);
  }

  // Muestra la ficha de un producto y, luego, sugiere otros (como en el ejemplo)
  function mostrarProducto(p) {
    agregarMensaje('bot', fichaProducto(p));

    const otros = listaProductos
      .filter((prod) => prod.id !== p.id)
      .slice(0, 3)
      .map((prod) => `<button type="button" class="bot-btn" data-ask="${prod.id}">${prod.id} · ${nombreCorto(prod.nombre)}</button>`)
      .join('');

    setTimeout(() => {
      agregarMensaje('bot', `<p>¿Deseas ver otro producto? Puedes consultar alguno de estos:</p><div class="bot-actions">${otros}</div>`);
    }, reduceMotion ? 0 : 600);
  }

  // ===== 10. Clics dentro del chat =====
  cuerpo.addEventListener('click', (e) => {
    // Botones que envían una pregunta (lista de productos, sugerencias)
    const pregunta = e.target.closest('[data-ask]');
    if (pregunta) {
      enviarMensaje(pregunta.dataset.ask);
      return;
    }
    // "Ver producto": abre la ficha del catálogo
    const verProducto = e.target.closest('[data-product]');
    if (verProducto) {
      openProduct(verProducto.dataset.product);
      return;
    }
    // Botones que llevan a una sección de la página
    const ir = e.target.closest('[data-go]');
    if (ir) {
      const destino = $(ir.dataset.go);
      if (window.innerWidth <= 560) cerrarChat();
      if (destino) destino.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });

  // Sugerencias rápidas debajo de los mensajes
  $$('#chatbot-chips [data-ask]').forEach((chip) => {
    chip.addEventListener('click', () => enviarMensaje(chip.dataset.ask));
  });

  // ===== 11. Abrir y cerrar el chat =====
  function abrirChat() {
    chatbot.classList.add('is-open');
    chatbot.classList.remove('has-unread');
    chatPanel.inert = false;
    chatHint.hidden = true;
    chatLauncher.setAttribute('aria-expanded', 'true');
    chatLauncher.setAttribute('aria-label', 'Cerrar asistente de Kampus+');
    document.body.classList.add('chat-open');
    cuerpo.scrollTop = cuerpo.scrollHeight;
    if (window.innerWidth > 560) setTimeout(() => input.focus(), 250);
  }

  function cerrarChat() {
    chatbot.classList.remove('is-open');
    chatPanel.inert = true;
    chatLauncher.setAttribute('aria-expanded', 'false');
    chatLauncher.setAttribute('aria-label', 'Abrir asistente de Kampus+');
    document.body.classList.remove('chat-open');
  }

  // Enlaces que abren el chat, como "Preguntas frecuentes" del footer
  $$('[data-open-chat]').forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      abrirChat();
    });
  });

  chatLauncher.addEventListener('click', () => {
    chatbot.classList.contains('is-open') ? cerrarChat() : abrirChat();
  });
  $('#chatbot-close').addEventListener('click', () => {
    cerrarChat();
    chatLauncher.focus();
  });

  // Reiniciar la conversación
  function iniciarConversacion() {
    cuerpo.innerHTML = '';
    agregarMensaje('bot', SALUDO_INICIAL);
  }
  $('#chatbot-reset').addEventListener('click', () => {
    iniciarConversacion();
    toast('Conversación reiniciada');
  });

  // Cerrar con la tecla Escape (si no hay otra ventana abierta encima)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbot.classList.contains('is-open') && !$$('dialog').some((d) => d.open)) {
      cerrarChat();
      chatLauncher.focus();
    }
  });

  // Globo de invitación: aparece a los 4 segundos (una vez por visita)
  const hintVisto = () => { try { return sessionStorage.getItem('kampus-chat-hint') === '1'; } catch { return false; } };
  const marcarHint = () => { try { sessionStorage.setItem('kampus-chat-hint', '1'); } catch { /* sin almacenamiento */ } };

  setTimeout(() => {
    if (!chatbot.classList.contains('is-open') && !hintVisto()) chatHint.hidden = false;
  }, 4000);
  chatHint.addEventListener('click', (e) => {
    marcarHint();
    chatHint.hidden = true;
    if (!e.target.closest('#chatbot-hint-close')) abrirChat();
  });

  // Al cargar la página: saludo inicial y un "1" rojo de mensaje sin leer
  iniciarConversacion();
  chatbot.classList.add('has-unread');
})();