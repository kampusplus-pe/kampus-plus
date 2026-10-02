/*
  Kampus+ - JavaScript de la landing page
  Versión 1.0 (octubre 2026)
  El código del chatbot está aparte en chatbot.js
*/
(() => {
  'use strict';

  // ===== 1. Fotos =====
  // Las fotos aparecen poco a poco cuando cargan.
  // Si alguna no carga (por ejemplo sin internet) se muestra un fondo con un ícono.
  document.documentElement.classList.add('js');

  const markLoaded = (img) => img.classList.add('is-loaded');
  const markBroken = (img) => {
    const box = img.closest('.media');
    if (box) box.classList.add('is-broken');
  };

  document.querySelectorAll('.media > img').forEach((img) => {
    if (img.complete) {
      img.naturalWidth ? markLoaded(img) : markBroken(img);
    }
  });
  document.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG') markLoaded(e.target);
  }, true);
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    // Si la imagen tiene una foto de respaldo (data-fallback), se usa esa
    if (img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) {
      img.src = img.dataset.fallback;
      return;
    }
    markBroken(img);
  }, true);

  // ===== 2. Datos del catálogo =====
  // Las fotos son de Unsplash, en "photos" va solo el código de cada foto.
  // También se puede poner una ruta propia, por ejemplo 'img/calculadora.jpg'.
  const photo = (id, w = 600, h = w) =>
    /^(https?:|img\/|\.\/|\/)/.test(id)
      ? id
      : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

  const CATEGORIES = {
    tecnologia: 'Tecnología',
    libros:     'Libros',
    material:   'Material universitario',
    moda:       'Moda',
    accesorios: 'Accesorios',
    otros:      'Otros'
  };

  const SELLERS = {
    camila:    { name: 'Camila Rodríguez',  initials: 'CR', color: '#1f5eff', career: 'Ing. Industrial · 6to ciclo',   uni: 'UPC Monterrico',          rating: 4.9, sales: 23 },
    diego:     { name: 'Diego Flores',      initials: 'DF', color: '#0f766e', career: 'Ing. de Sistemas · 7mo ciclo', uni: 'Universidad de Lima',     rating: 5.0, sales: 11 },
    andrea:    { name: 'Andrea Castillo',   initials: 'AC', color: '#db2777', career: 'Arquitectura · 8vo ciclo',     uni: 'PUCP',                    rating: 5.0, sales: 12 },
    valeria:   { name: 'Valeria Mendoza',   initials: 'VM', color: '#d97706', career: 'Ing. Civil · 4to ciclo',       uni: 'UTEC Barranco',           rating: 4.8, sales: 15 },
    sofia:     { name: 'Sofía Rojas',       initials: 'SR', color: '#9333ea', career: 'Administración · 9no ciclo',   uni: 'Universidad del Pacífico', rating: 4.9, sales: 19 },
    lucia:     { name: 'Lucía Benavides',   initials: 'LB', color: '#7c3aed', career: 'Medicina Humana · 3er ciclo',  uni: 'UNMSM',                   rating: 4.9, sales: 9 },
    sebastian: { name: 'Sebastián Alarcón', initials: 'SA', color: '#4f46e5', career: 'Arquitectura · 6to ciclo',     uni: 'UPC San Isidro',          rating: 4.9, sales: 17 },
    mateo:     { name: 'Mateo Quispe',      initials: 'MQ', color: '#e8590c', career: 'Comunicaciones · 5to ciclo',   uni: 'UPC San Miguel',          rating: 5.0, sales: 8 },
    joaquin:   { name: 'Joaquín Silva',     initials: 'JS', color: '#0284c7', career: 'Economía · 5to ciclo',         uni: 'Universidad del Pacífico', rating: 4.8, sales: 6 },
    fernanda:  { name: 'Fernanda Ríos',     initials: 'FR', color: '#be123c', career: 'Diseño Gráfico · 4to ciclo',   uni: 'PUCP',                    rating: 5.0, sales: 14 },
    nicolas:   { name: 'Nicolás Vargas',    initials: 'NV', color: '#15803d', career: 'Ing. Ambiental · 2do ciclo',   uni: 'UTEC Barranco',           rating: 4.9, sales: 4 }
  };

  const PRODUCTS = [
    {
      id: 1, title: 'Calculadora científica Casio fx-991LA CW',
      price: 65, oldPrice: 120, category: 'tecnologia', condition: 'Como nuevo', seller: 'camila', stock: 1,
      photos: ['1574607383077-47ddc2dc51c4', '1683884361203-69b7f969e9ff'],
      meet: 'Cafetería frente a Puerta 1',
      keywords: 'calculadora cientifica casio calculo estadistica fisica ingenieria',
      description: 'Ideal para Cálculo, Estadística y Física: resuelve integrales, matrices y ecuaciones. Incluye tapa protectora. La usé dos ciclos y funciona perfecto.'
    },
    {
      id: 2, title: 'Polerón oversize blanco + jean (talla M)',
      price: 70, oldPrice: 160, category: 'moda', condition: 'Nuevo', seller: 'fernanda', stock: 1,
      photos: ['1620799140188-3b2a02fd9a77'],
      meet: 'Paradero frente a la puerta principal',
      keywords: 'poleron ropa casaca jean pantalon talla m',
      description: 'Nuevos, con etiqueta. Me quedaron grandes. El polerón es de tela gruesa, ideal para las clases de la mañana.'
    },
    {
      id: 3, title: 'Pack Cálculo y Física: Stewart 8.ª ed. + Serway',
      price: 120, oldPrice: 380, category: 'libros', condition: 'Buen estado', seller: 'valeria', stock: 1,
      photos: ['1497633762265-9d179a990aa6'],
      meet: 'Cafetería frente al Pabellón B',
      keywords: 'libro calculo stewart fisica serway matematica ingenieria formulario',
      description: 'Libros físicos con algunos apuntes a lápiz. Me sirvieron para Cálculo I, Cálculo II y Física I. Incluyo formularios impresos.'
    },
    {
      id: 4, title: 'Teclado mecánico 65% inalámbrico (Red Switch)',
      price: 160, oldPrice: 280, category: 'tecnologia', condition: 'Como nuevo', seller: 'diego', stock: 1,
      photos: ['1618384887929-16ec33fab9ef'],
      meet: 'Paradero universitario frente a la U',
      keywords: 'teclado mecanico inalambrico computadora sistemas gamer',
      description: 'Súper compacto para llevar en la mochila a la biblioteca. Switches lineales silenciosos, no hace ruido para no molestar a los compañeros.'
    },
    {
      id: 5, title: 'Estetoscopio Littmann Classic III',
      price: 290, oldPrice: 520, category: 'material', condition: 'Como nuevo', seller: 'lucia', stock: 1,
      photos: ['1763070282903-cbe9922ab7ab'],
      meet: 'Plazoleta exterior frente al campus',
      keywords: 'estetoscopio littmann medicina enfermeria salud semiologia',
      description: 'Original, color burdeos. Lo usé solo en las prácticas de Semiología. Incluye olivas de repuesto y estuche.'
    },
    {
      id: 6, title: 'Kit de dibujo técnico: escuadras, compás y escalímetro',
      price: 75, oldPrice: 150, category: 'material', condition: 'Como nuevo', seller: 'sebastian', stock: 2,
      photos: ['1760030428004-60a033044f81', '1503789101408-444b37749472'],
      meet: 'Cafetería frente a la Puerta Principal',
      keywords: 'dibujo tecnico arquitectura escalimetro compas escuadras taller',
      description: 'Escuadras, escalímetro triangular, compás de precisión y portaminas 0.5. Todo lo que piden en Taller 1 y Taller 2.'
    },
    {
      id: 7, title: 'Audífonos inalámbricos con cancelación de ruido',
      price: 180, oldPrice: 320, category: 'accesorios', condition: 'Como nuevo', seller: 'mateo', stock: 1,
      photos: ['1505740420928-5e560c06d30e'],
      meet: 'Cafetería frente a Puerta 3 (exterior)',
      keywords: 'audifonos inalambricos musica bluetooth cancelacion ruido',
      description: 'Batería de hasta 30 horas y cancelación de ruido para estudiar en la biblioteca o en el bus. Incluyen estuche y cable.'
    },
    {
      id: 8, title: 'Mochila antirrobo para laptop de 15.6"',
      price: 85, oldPrice: 160, category: 'accesorios', condition: 'Buen estado', seller: 'joaquin', stock: 2,
      photos: ['1553062407-98eeb64c6a62'],
      meet: 'Estación / paradero a pasos de la facultad',
      keywords: 'mochila laptop antirrobo impermeable',
      description: 'Entra una laptop de 15.6". Cierre oculto, tela impermeable y bolsillos para cargador y tomatodo.'
    },
    {
      id: 9, title: 'iPad 9.ª generación 64 GB + Apple Pencil',
      price: 1150, oldPrice: 1899, category: 'tecnologia', condition: 'Buen estado', seller: 'andrea', stock: 1,
      photos: ['1544244015-0df4b3ffc6b0', '1544244015-9c72fd9c866d'],
      meet: 'Paradero frente a la puerta principal',
      keywords: 'ipad tablet apple pencil apuntes dibujo procreate',
      description: 'Perfecto para tomar apuntes y dibujar. Batería al 89%, siempre con case y mica. Incluye cargador original y Apple Pencil.'
    },
    {
      id: 10, title: 'Pack de 5 libros de emprendimiento (Zero to One y más)',
      price: 70, oldPrice: 180, category: 'libros', condition: 'Buen estado', seller: 'sofia', stock: 1,
      photos: ['1512820790803-83ca734da794'],
      meet: 'Cafetería frente a la puerta principal',
      keywords: 'libros emprendimiento negocios administracion startup innovacion zero to one',
      description: 'Lecturas que piden en Emprendimiento y Gestión de la Innovación. En buen estado, sin páginas rayadas.'
    },
    {
      id: 11, title: 'Lámpara LED de escritorio regulable',
      price: 40, oldPrice: 89, category: 'otros', condition: 'Buen estado', seller: 'diego', stock: 2,
      photos: ['1582356630861-61bb9b41f541'],
      meet: 'Paradero universitario frente a la U',
      keywords: 'lampara escritorio led luz estudio cuarto',
      description: 'Brazo articulado y tres niveles de luz. Ideal para estudiar de noche sin cansar la vista.'
    },
    {
      id: 12, title: 'Tomatodo térmico de acero 750 ml',
      price: 35, oldPrice: 69, category: 'accesorios', condition: 'Nuevo', seller: 'nicolas', stock: 3,
      photos: ['1602143407151-7111542de6e8'],
      meet: 'Plazoleta exterior frente al campus',
      keywords: 'tomatodo botella termo agua acero',
      description: 'Mantiene el agua fría por 24 horas y el café caliente por 12. Nuevo, sin uso.'
    }
  ];

  // ===== 3. Utilidades =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const icon = (name, cls = 'ic') =>
    `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  // Formato de soles: money(1234.5, 2) -> "S/ 1,234.50"
  const money = (n, decimals = 0) =>
    'S/ ' + Number(n).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Quita tildes y pasa a minúsculas para que la búsqueda sea flexible
  const normalize = (text) =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const discount = (p) => Math.round((1 - p.price / p.oldPrice) * 100);

  const escapeHTML = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Aviso flotante
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message) {
    toastEl.innerHTML = `${icon('check')}<span>${message}</span>`;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  // Año actual en el pie de página
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== 4. Menú y encabezado =====
  const header = $('#header');
  const navToggle = $('#nav-toggle');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    header.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  navToggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  $$('#nav a, #nav button').forEach((el) => el.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && header.classList.contains('is-open')) setMenu(false);
  });

  // Resalta en el menú la sección que se está viendo
  const navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const hash = `#${entry.target.id}`;
        navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === hash));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach((section) => spy.observe(section));
  }

  // ===== 5. Animaciones al hacer scroll =====
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ===== 6. Catálogo =====
  const grid = $('#product-grid');
  const countEl = $('#catalog-count');
  const emptyEl = $('#catalog-empty');
  const emptyTitle = $('#empty-title');
  const emptyText = $('#empty-text');
  const searchInput = $('#catalog-search');
  const sortSelect = $('#catalog-sort');
  const filterBtns = $$('#filters .chip');
  const favorites = new Set();
  let activeFilter = 'todos';

  function productCard(p, index) {
    const s = SELLERS[p.seller];
    const isFav = favorites.has(p.id);
    return `
      <article class="product" style="--i:${index}">
        <div class="product__media media" data-product="${p.id}">
          <img src="${photo(p.photos[0], 600)}" alt="${escapeHTML(p.title)}" loading="lazy" decoding="async">
          <span class="badge">${p.condition}</span>
          <button type="button" class="product__fav${isFav ? ' is-on' : ''}" data-fav="${p.id}"
                  aria-pressed="${isFav}" aria-label="Guardar ${escapeHTML(p.title)} en favoritos">${icon('heart')}</button>
          <span class="product__loc">${icon('pin')}<span>${p.meet}</span></span>
        </div>
        <div class="product__body">
          <div class="product__price">
            <strong>${money(p.price)}</strong>
            <s>${money(p.oldPrice)}</s>
            <span class="product__off">-${discount(p)}%</span>
          </div>
          <h3 class="product__title">${p.title}</h3>
          <div class="product__seller">
            <span class="avatar avatar--sm" style="--c:${s.color}" aria-hidden="true">${s.initials}</span>
            <div>
              <strong>${s.name} ${icon('verified', 'ic verified')}</strong>
              <small>${s.uni}</small>
            </div>
            <span class="product__rating">${icon('star', 'ic star')}${s.rating.toFixed(1)}</span>
          </div>
          <button type="button" class="product__btn" data-product="${p.id}">${icon('eye')} Ver producto</button>
        </div>
      </article>`;
  }

  const SORTERS = {
    relevancia: () => 0,
    'precio-asc': (a, b) => a.price - b.price,
    'precio-desc': (a, b) => b.price - a.price,
    descuento: (a, b) => discount(b) - discount(a)
  };

  function renderCatalog() {
    const query = normalize(searchInput.value.trim());
    const words = query.split(/\s+/).filter(Boolean);

    const results = PRODUCTS.filter((p) => {
      if (activeFilter !== 'todos' && p.category !== activeFilter) return false;
      if (!words.length) return true;
      const s = SELLERS[p.seller];
      const haystack = normalize(
        [p.title, p.keywords, p.description, s.uni, s.career, CATEGORIES[p.category]].join(' ')
      );
      return words.every((w) => haystack.includes(w));
    }).sort(SORTERS[sortSelect.value] || SORTERS.relevancia);

    grid.innerHTML = results.map(productCard).join('');
    grid.hidden = results.length === 0;
    emptyEl.hidden = results.length > 0;

    countEl.textContent = results.length === 1
      ? '1 producto disponible'
      : `${results.length} productos disponibles`;

    if (!results.length) {
      if (words.length) {
        emptyTitle.textContent = `No encontramos “${searchInput.value.trim()}”`;
        emptyText.textContent = 'Prueba con otra palabra o categoría. Y si tú lo tienes, ¡publícalo y véndelo!';
      } else {
        emptyTitle.textContent = 'Aún no hay publicaciones aquí';
        emptyText.textContent = '¿Tienes algo de esta categoría? Publícalo y sé el primero en vender.';
      }
    }
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      renderCatalog();
    });
  });

  sortSelect.addEventListener('change', renderCatalog);

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderCatalog, 150);
  });

  // Botón "Ver todos los productos" (aparece cuando la búsqueda no encuentra nada)
  $('#catalog-reset').addEventListener('click', () => {
    searchInput.value = '';
    filterBtns.find((b) => b.dataset.filter === 'todos').click();
  });

  grid.addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      const id = Number(favBtn.dataset.fav);
      const on = !favorites.has(id);
      on ? favorites.add(id) : favorites.delete(id);
      favBtn.classList.toggle('is-on', on);
      favBtn.setAttribute('aria-pressed', String(on));
      toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
      return;
    }
    const viewBtn = e.target.closest('[data-product]');
    if (viewBtn) openProduct(viewBtn.dataset.product);
  });

  renderCatalog();

  // ===== 7. Ventanas (modales) =====
  const productModal = $('#product-modal');
  const productContent = $('#product-modal-content');
  const downloadModal = $('#download-modal');
  const downloadContext = $('#download-context');
  const storeStatus = $('#store-status');

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('no-scroll');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (!$$('dialog').some((d) => d.open)) document.body.classList.remove('no-scroll');
  }

  $$('dialog').forEach((dialog) => {
    // Cerrar al hacer clic fuera de la ventana
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (!$$('dialog').some((d) => d.open)) document.body.classList.remove('no-scroll');
    });
  });

  function openProduct(id) {
    const p = PRODUCTS.find((item) => item.id === Number(id));
    if (!p) return;
    const s = SELLERS[p.seller];
    const saving = p.oldPrice - p.price;
    const thumbs = p.photos.length > 1
      ? `<div class="pm__thumbs">${p.photos.map((ph, i) => `
          <button type="button" class="pm__thumb media${i === 0 ? ' is-active' : ''}" data-photo="${i}" aria-label="Ver foto ${i + 1}">
            <img src="${photo(ph, 160)}" alt="" loading="lazy">
          </button>`).join('')}</div>`
      : '';

    productContent.innerHTML = `
      <div class="pm">
        <button type="button" class="modal__close" data-close aria-label="Cerrar">${icon('x')}</button>
        <div class="pm__gallery">
          <div class="pm__main media">
            <img id="pm-photo" src="${photo(p.photos[0], 900)}" alt="${escapeHTML(p.title)}">
            <span class="badge badge--dark">${p.condition}</span>
            <span class="pm__pay">${icon('lock')} Pago seguro · Yape o tarjeta</span>
          </div>
          ${thumbs}
        </div>
        <div class="pm__body">
          <p class="pm__cat">${CATEGORIES[p.category]}</p>
          <h3 id="pm-title">${p.title}</h3>
          <div class="pm__price">
            <strong>${money(p.price, 2)}</strong>
            <s>${money(p.oldPrice)}</s>
            <span class="product__off">-${discount(p)}%</span>
          </div>
          <p class="pm__stock">${icon('box')} ${p.stock === 1 ? 'Última unidad disponible' : `${p.stock} unidades disponibles`}</p>
          <p class="pm__desc">${p.description}</p>
          <div class="pm__seller">
            <span class="avatar avatar--md" style="--c:${s.color}" aria-hidden="true">${s.initials}</span>
            <div>
              <strong>${s.name} ${icon('verified', 'ic verified')}</strong>
              <span>${s.career}</span>
              <small>${s.uni}</small>
            </div>
            <div class="pm__rating">
              <b>${icon('star', 'ic star')} ${s.rating.toFixed(1)}</b>
              <small>${s.sales} ventas exitosas</small>
            </div>
          </div>
          <div class="pm__meet">
            <span class="pm__meet-ic">${icon('pin')}</span>
            <div>
              <strong>Punto de encuentro (cerca a la universidad):</strong>
              <span>${p.meet}</span>
            </div>
          </div>
          <button type="button" class="btn btn--primary btn--block" data-open="download"
                  data-context="Descarga la app para comprar este producto con pago protegido.">
            Comprar en la app ${icon('arrow-right')}
          </button>
          <p class="pm__note">Ahorras ${money(saving)} (${discount(p)}%) frente al precio de tienda</p>
        </div>
      </div>`;

    productContent.dataset.product = p.id;
    openDialog(productModal);
    productModal.scrollTop = 0;
  }

  // Cambiar la foto principal desde las miniaturas
  productContent.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-photo]');
    if (!thumb) return;
    const img = $('#pm-photo');
    const idx = Number(thumb.dataset.photo);
    const p = PRODUCTS.find((item) => item.id === Number(productContent.dataset.product));
    if (!img || !p) return;
    img.classList.remove('is-loaded');
    img.closest('.media').classList.remove('is-broken');
    img.src = photo(p.photos[idx], 900);
    $$('.pm__thumb', productContent).forEach((t) => t.classList.toggle('is-active', t === thumb));
  });

  function openDownload(message) {
    if (productModal.open) closeDialog(productModal);
    if (message) {
      downloadContext.textContent = message;
      downloadContext.hidden = false;
    } else {
      downloadContext.hidden = true;
    }
    storeStatus.hidden = true;
    openDialog(downloadModal);
  }

  // Botones para abrir y cerrar ventanas (también sirve para lo que se crea con JS)
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      closeDialog(closeBtn.closest('dialog'));
      return;
    }
    const openBtn = e.target.closest('[data-open="download"]');
    if (openBtn) {
      e.preventDefault();
      openDownload(openBtn.dataset.context);
    }
  });

  // Botones de tiendas: como la app aún no está publicada, avisamos "muy pronto"
  $$('[data-store]').forEach((boton) => {
    boton.addEventListener('click', () => { storeStatus.hidden = false; });
  });

  // Redes sociales que todavía no tenemos (enlaces con data-soon)
  $$('[data-soon]').forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
      e.preventDefault();
      toast('Nuestras redes estarán disponibles muy pronto');
    });
  });

  // Ventana de Términos y Privacidad (tiene dos pestañas)
  const legalModal = $('#legal-modal');
  const legalTabs = $$('[data-legal-tab]');

  function mostrarLegal(nombre) {
    legalTabs.forEach((tab) => {
      const activa = tab.dataset.legalTab === nombre;
      tab.setAttribute('aria-selected', String(activa));
      tab.tabIndex = activa ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !activa;
    });
  }
  legalTabs.forEach((tab) => tab.addEventListener('click', () => mostrarLegal(tab.dataset.legalTab)));
  $$('[data-legal]').forEach((boton) => {
    boton.addEventListener('click', () => {
      mostrarLegal(boton.dataset.legal);
      openDialog(legalModal);
      legalModal.scrollTop = 0;
    });
  });

  // ===== 8. Formulario "Publicar" y calculadora =====
  const pubForm = $('#publish-form');
  const pubPrice = $('#pub-price');
  const pubNet = $('#pub-net');
  const pubFee = $('#pub-fee');

  function updatePublishEarnings() {
    const price = Math.max(0, parseFloat(pubPrice.value) || 0);
    pubNet.textContent = money(price * 0.95, 2);
    pubFee.textContent = `Comisión 5%: ${money(price * 0.05, 2)}`;
  }
  pubPrice.addEventListener('input', updatePublishEarnings);
  updatePublishEarnings();

  pubForm.addEventListener('submit', (e) => {
    e.preventDefault();
    openDownload('¡Así de fácil! Descarga la app para publicar tu producto de verdad.');
  });

  $('#add-photo').addEventListener('click', () =>
    toast('En la app puedes subir hasta 3 fotos de tu producto')
  );

  // Calculadora de ingresos
  const calcOptions = $$('.calc-opt');
  const calcTotal = $('#calc-total');
  const calcBreakdown = $('#calc-breakdown');
  let shownNet = 0;
  let calcFrame;

  function animateTotal(target) {
    cancelAnimationFrame(calcFrame);
    if (reduceMotion) {
      shownNet = target;
      calcTotal.textContent = money(target, 2);
      return;
    }
    const from = shownNet;
    const start = performance.now();
    const duration = 650;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      shownNet = from + (target - from) * eased;
      calcTotal.textContent = money(shownNet, 2);
      if (t < 1) calcFrame = requestAnimationFrame(step);
    };
    calcFrame = requestAnimationFrame(step);
  }

  function updateCalculator(animate = true) {
    const gross = calcOptions
      .filter((opt) => opt.classList.contains('is-on'))
      .reduce((sum, opt) => sum + Number(opt.dataset.value), 0);
    const fee = gross * 0.05;
    const net = gross - fee;

    calcBreakdown.textContent = `Venta bruta: ${money(gross, 2)} • Comisión 5%: ${money(fee, 2)}`;
    if (animate) {
      animateTotal(net);
    } else {
      shownNet = net;
      calcTotal.textContent = money(net, 2);
    }
  }

  calcOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      const on = !opt.classList.contains('is-on');
      opt.classList.toggle('is-on', on);
      opt.setAttribute('aria-pressed', String(on));
      updateCalculator();
    });
  });
  updateCalculator(false);

  // Formulario de novedades del banner final
  // Es de muestra: revisa que el correo sea institucional, pero no lo envía ni lo guarda.
  const notifyForm = $('#notify-form');
  const notifyEmail = $('#notify-email');
  const notifyMsg = $('#notify-msg');

  function avisoNovedades(tipo, texto) {
    notifyMsg.className = `notify__msg is-${tipo}`;
    notifyMsg.innerHTML = `${icon(tipo === 'ok' ? 'check' : 'x')}<span></span>`;
    notifyMsg.querySelector('span').textContent = texto; // el correo va como texto
    notifyMsg.hidden = false;
    notifyForm.classList.toggle('is-error', tipo === 'error');
  }

  notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const correo = notifyEmail.value.trim().toLowerCase();
    if (!correo) {
      avisoNovedades('error', 'Escribe tu correo universitario.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      avisoNovedades('error', 'Revisa tu correo, parece que está incompleto (por ejemplo, le falta la @).');
    } else if (!correo.endsWith('.edu.pe')) {
      avisoNovedades('error', 'Usa tu correo institucional, el que termina en .edu.pe.');
    } else {
      avisoNovedades('ok', `¡Listo! Te avisaremos a ${correo} cuando Kampus+ esté disponible.`);
      notifyForm.reset();
    }
  });
  notifyEmail.addEventListener('input', () => notifyForm.classList.remove('is-error'));

  // El botón "Avísame del lanzamiento" del encabezado baja al formulario y deja el cursor en el campo
  $$('a[href="#novedades"]').forEach((enlace) => {
    enlace.addEventListener('click', () => {
      setTimeout(() => notifyEmail.focus({ preventScroll: true }), reduceMotion ? 0 : 700);
    });
  });

  // ===== 9. Pestañas "¿Cómo funciona?" =====
  const switchEl = $('.switch');
  const tabs = $$('.switch__btn');

  function selectTab(name, moveFocus = false) {
    tabs.forEach((tab) => {
      const on = tab.dataset.tab === name;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
      if (on) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth; // reinicia la animación
        panel.classList.add('is-entering');
        if (moveFocus) tab.focus();
      }
    });
    switchEl.dataset.active = name;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectTab(tab.dataset.tab === 'buyer' ? 'seller' : 'buyer', true);
      }
    });
  });

  // ===== 10. Reseñas (carrusel en celular) =====
  const reviewsTrack = $('#reviews');
  $$('.reviews-nav__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = $('.review', reviewsTrack);
      const step = card ? card.getBoundingClientRect().width + 16 : 300;
      reviewsTrack.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  // ===== 11. Resaltado al llegar desde "¿Qué es Kampus+?" =====
  $$('[data-highlight]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = $(link.dataset.highlight);
      if (!target) return;
      setTimeout(() => {
        target.classList.remove('is-highlight');
        void target.offsetWidth;
        target.classList.add('is-highlight');
      }, reduceMotion ? 0 : 700);
    });
  });
  document.addEventListener('animationend', (e) => {
    if (e.animationName === 'highlight') e.target.classList.remove('is-highlight');
  });

  // ===== 12. Datos que usa el chatbot =====
  // chatbot.js necesita los productos y algunas funciones de este archivo,
  // por eso los dejamos en window.Kampus.
  window.Kampus = {
    PRODUCTS, CATEGORIES, SELLERS,
    photo, money, normalize, discount, icon, toast, openProduct, reduceMotion
  };
})();