document.addEventListener('DOMContentLoaded', function() {
  let carrito = [];
  const carritoCount = document.querySelector('.cart-count');
  const cartItems = document.querySelector('.cart-items');
  const previewTotal = document.getElementById('preview-total');
  
  // Inicializar
  initApp();
  
  function initApp() {
    cargarCarrito();
    
    configurarEventos();
    
    filtrarProductos('clasicas');
  }
  
  function configurarEventos() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
      });
    }
    
    // Filtrado de categorías
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Remover clase active de todos los botones
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Agregar clase active al botón clickeado
        this.classList.add('active');
        // Filtrar productos
        const categoria = this.getAttribute('data-category');
        filtrarProductos(categoria);
      });
    });
    
    // Agregar productos al carrito
    const addToCartBtns = document.querySelectorAll('.btn-agregar');
    addToCartBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const producto = this.getAttribute('data-producto');
        const precio = parseInt(this.getAttribute('data-precio'));
        agregarAlCarrito(producto, precio);
        
        // Efecto visual de confirmación
        this.textContent = '¡Agregado!';
        this.style.backgroundColor = 'var(--success-color)';
        
        setTimeout(() => {
          this.textContent = 'Agregar al Pedido';
          this.style.backgroundColor = 'var(--primary-color)';
        }, 1500);
      });
    });
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
          
          // Cerrar menú móvil si está abierto
          if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
          }
        }
      });
    });
  }
  
  function filtrarProductos(categoria) {
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach(producto => {
      if (producto.getAttribute('data-category') === categoria || categoria === 'todos') {
        producto.style.display = 'block';
        // Animación de aparición
        setTimeout(() => {
          producto.style.opacity = '1';
          producto.style.transform = 'translateY(0)';
        }, 100);
      } else {
        producto.style.opacity = '0';
        producto.style.transform = 'translateY(20px)';
        setTimeout(() => {
          producto.style.display = 'none';
        }, 300);
      }
    });
  }
  
  function agregarAlCarrito(producto, precio) {
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.nombre === producto);
    
    if (productoExistente) {
      productoExistente.cantidad += 1;
    } else {
      carrito.push({
        nombre: producto,
        precio: precio,
        cantidad: 1
      });
    }
    
    actualizarCarrito();
    
    guardarCarrito();
  }
  
  function actualizarCarrito() {
    // Actualizar contador
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    carritoCount.textContent = totalItems;
    
    // Actualizar lista de productos en el preview
    cartItems.innerHTML = '';
    
    if (carrito.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
      previewTotal.textContent = '0';
    } else {
      let total = 0;
      
      carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
          <span>${item.nombre} x${item.cantidad}</span>
          <span>$${itemTotal.toLocaleString()}</span>
        `;
        
        cartItems.appendChild(cartItem);
      });
      
      previewTotal.textContent = total.toLocaleString();
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
  
  // Efectos de scroll para elementos
  window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY;
    
    // Efecto de aparición para productos
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach((producto, index) => {
      const productoPosition = producto.getBoundingClientRect().top + scrollPosition;
      
      if (scrollPosition + window.innerHeight > productoPosition + 100) {
        setTimeout(() => {
          producto.style.opacity = '1';
          producto.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
    
    // Efecto de header al hacer scroll
    const header = document.querySelector('header');
    
    if (scrollPosition > 100) {
      header.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
      header.style.backdropFilter = 'blur(10px)';
    } else {
      header.style.backgroundColor = 'var(--dark-color)';
      header.style.backdropFilter = 'none';
    }
  });
  
  // Inicializar animaciones de entrada
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observar elementos para animación
  document.querySelectorAll('.producto, .about-content, .feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(el);
  });
});