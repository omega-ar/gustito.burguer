const API_URL = window.API_URL || 'http://localhost:8080/api';
let carrito = [];
let productos = [];

document.addEventListener('DOMContentLoaded', function() {
  cargarCarrito();
  configurarEventos();
  cargarProductosDesdeBackend();
  verificarEstadoLocalHome();
});

async function verificarEstadoLocalHome() {
  try {
    const response = await fetch(`${API_URL}/orders/store-status`);
    if (response.ok) {
      const data = await response.json();
      if (!data.open) {
        const header = document.querySelector('header');
        if (header) {
          const banner = document.createElement('div');
          banner.className = 'banner-local-cerrado';
          banner.innerHTML = `
            <div style="background-color: var(--danger-color, #dc3545); color: white; padding: 0.8rem; text-align: center; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%;">
              ⚠️ EL LOCAL SE ENCUENTRA CERRADO. Habilitado para realizar pedidos: Martes a Viernes 17:30-23:50 hs, Sábados y Domingos 18:00-23:50 hs.
            </div>
          `;
          header.parentNode.insertBefore(banner, header.nextSibling);
        }
        
        setTimeout(() => {
          const cartBtn = document.querySelector('.cart-preview .btn-pedido');
          if (cartBtn) {
            cartBtn.textContent = 'Local Cerrado ⏳';
            cartBtn.style.backgroundColor = '#6c757d';
            cartBtn.style.cursor = 'not-allowed';
            cartBtn.onclick = (e) => {
              e.preventDefault();
              alert('El local está cerrado en este momento. Horarios: Martes a Viernes 17:30 - 23:50, Sábados y Domingos 18:00 - 23:50.');
            };
          }
        }, 1000);
      }
    }
  } catch (err) {
    console.error('Error al verificar estado del local en el home:', err);
  }
}

async function cargarProductosDesdeBackend() {
  const menuGrid = document.getElementById('menuGrid');

  if (!menuGrid) return;
  
  menuGrid.innerHTML = '<div class="loader-container"><div class="loader"></div><p>Cargando nuestro menú...</p></div>';
  
  try {
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error('Error al cargar productos');
    }
    
    productos = await response.json();
    console.log('Productos cargados:', productos);
    
    mostrarProductosEnGrid(productos);
    mostrarPromosEnGrid(productos);
    
  } catch (error) {
    console.error('Error:', error);
    menuGrid.innerHTML = '<div class="loader-container"><p>⚠️ Error al cargar el menú. Por favor, verificá que el backend esté corriendo.</p></div>';
  }
}

function mostrarPromosEnGrid(productos) {
  const promosGrid = document.getElementById('promosGrid');
  if (!promosGrid) return;
  
  const promos = productos.filter(p => p.categoria === 'promo' && p.activo === true);
  
  if (promos.length === 0) {
    promosGrid.innerHTML = '<div class="loader-container"><p>No hay promociones disponibles en este momento</p></div>';
    return;
  }
  
  promos.sort((a, b) => a.precio - b.precio);
  
  promosGrid.innerHTML = promos.map(promo => `
    <div class="promo-card">
      <div class="promo-badge">🔥 COMBO</div>
      <div class="promo-img">
        <img src="img/${promo.imagen || 'default.png'}" alt="${promo.nombre}" onerror="this.src='img/default.png'">
      </div>
      <div class="promo-info">
        <h3>${promo.nombre}</h3>
        <p>${promo.descripcion || 'Combo especial de hamburguesas'}</p>
        <div class="promo-footer">
          <span class="promo-price">$${promo.precio.toLocaleString()}</span>
          <button class="btn-agregar btn-promo-agregar" data-id="${promo.id}" data-nombre="${promo.nombre}" data-precio="${promo.precio}">
            Agregar al Pedido
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  promosGrid.querySelectorAll('.btn-promo-agregar').forEach(btn => {
    btn.removeEventListener('click', handleAgregarClick);
    btn.addEventListener('click', handleAgregarClick);
  });
}

function mostrarProductosEnGrid(productos) {
  const menuGrid = document.getElementById('menuGrid');
  
  const categoriaMap = {
    'simple': 'clasicas',
    'doble': 'especiales',
    'triple': 'triples',
    'vegetariana': 'vegetarianas',
    'otros': 'acompanamientos',
    'bebidas': 'acompanamientos',
    'extras': 'acompanamientos'
  };
  
  const productosMostrar = productos.filter(p => {
    if (p.activo !== true) return false;
    
    const mappedCat = categoriaMap[p.categoria];
    if (!mappedCat) return false;
    
    if (mappedCat === 'acompanamientos') {
      const allowedIds = ['coca_cola_600', 'fanta_600', 'sprite_600', 'papas_cheddar'];
      return allowedIds.includes(p.id);
    }
    
    return true;
  });
  
  if (productosMostrar.length === 0) {
    menuGrid.innerHTML = '<div class="loader-container"><p>No hay productos disponibles</p></div>';
    return;
  }
  
  productosMostrar.sort((a, b) => a.precio - b.precio);
  
  menuGrid.innerHTML = productosMostrar.map(producto => `
    <div class="producto" data-category="${categoriaMap[producto.categoria]}">
      <div class="producto-img">
        <img src="img/${producto.imagen || 'default.png'}" alt="${producto.nombre}" onerror="this.src='img/default.png'">
        <div class="producto-overlay">
          <span class="precio precio-con-descuento">
            <span class="precio-nuevo">$${producto.precio.toLocaleString()}</span>
          </span>
        </div>
      </div>
      <div class="producto-info">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion || 'Deliciosa hamburguesa artesanal'}</p>
        <button class="btn-agregar" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">
          Agregar al Pedido
        </button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.menu-grid .btn-agregar').forEach(btn => {
    btn.removeEventListener('click', handleAgregarClick);
    btn.addEventListener('click', handleAgregarClick);
  });
  
  const activeCategory = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'clasicas';
  filtrarProductos(activeCategory);
}

function handleAgregarClick(e) {
  const btn = e.currentTarget;
  const nombre = btn.getAttribute('data-nombre');
  const precio = parseInt(btn.getAttribute('data-precio'));
  const id = btn.getAttribute('data-id');
  
  agregarAlCarrito({ id, nombre, precio, cantidad: 1 });
  
  const textoOriginal = btn.textContent;
  btn.textContent = '¡Agregado!';
  btn.style.backgroundColor = 'var(--success-color)';
  setTimeout(() => {
    btn.textContent = textoOriginal;
    btn.style.backgroundColor = 'var(--primary-color)';
  }, 1500);
}

function configurarEventos() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('nav ul');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
  }
  
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      categoryBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const categoria = this.getAttribute('data-category');
      filtrarProductos(categoria);
    });
  });
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({ top: targetElement.offsetTop - 80, behavior: 'smooth' });
        if (navMenu?.classList.contains('active')) navMenu.classList.remove('active');
      }
    });
  });
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = themeToggle.querySelector('i');
      if (document.body.classList.contains('dark-mode')) {
        icon?.classList.remove('fa-moon');
        icon?.classList.add('fa-sun');
      } else {
        icon?.classList.remove('fa-sun');
        icon?.classList.add('fa-moon');
      }
    });
  }
}

function filtrarProductos(categoria) {
  const productosDOM = document.querySelectorAll('.producto');
  productosDOM.forEach(producto => {
    const productCategory = producto.getAttribute('data-category');
    if (productCategory === categoria) {
      producto.style.display = 'block';
      setTimeout(() => {
        producto.style.opacity = '1';
        producto.style.transform = 'translateY(0)';
      }, 50);
    } else {
      producto.style.opacity = '0';
      producto.style.transform = 'translateY(20px)';
      setTimeout(() => {
        producto.style.display = 'none';
      }, 300);
    }
  });
}

function agregarAlCarrito(producto) {
  const existente = carrito.find(item => item.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  actualizarCarrito();
  guardarCarrito();
}

function actualizarCarrito() {
  const carritoCount = document.querySelector('.cart-count');
  const cartItems = document.querySelector('.cart-items');
  const previewTotal = document.getElementById('preview-total');
  
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  if (carritoCount) carritoCount.textContent = totalItems;
  
  if (cartItems) {
    cartItems.innerHTML = '';
    if (carrito.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
      if (previewTotal) previewTotal.textContent = '0';
    } else {
      let total = 0;
      carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<span>${item.nombre} x${item.cantidad}</span><span>$${subtotal.toLocaleString()}</span>`;
        cartItems.appendChild(div);
      });
      if (previewTotal) previewTotal.textContent = total.toLocaleString();
    }
  }
}

function guardarCarrito() {
  localStorage.setItem('gustitoCarrito', JSON.stringify(carrito));
}

function cargarCarrito() {
  const carritoGuardado = localStorage.getItem('gustitoCarrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    actualizarCarrito();
  }
}