const API_PEDIDO = window.API_URL || 'http://localhost:8080/api';

let carrito = [];
let creadoPedidoId = null;

let productosMenu = [];

document.addEventListener('DOMContentLoaded', async () => {
  await cargarProductosOriginales();
  cargarCarrito();
  
  // Si al cargar inicialmente el carrito está vacío, redirigir al menú
  if (carrito.length === 0) {
    alert('Tu carrito está vacío. Debes elegir al menos un producto primero.');
    window.location.href = 'index.html';
    return;
  }
  
  actualizarResumen();
  configurarEventos();
  verificarEstadoLocal();
});

async function cargarProductosOriginales() {
  try {
    const response = await fetch(`${API_PEDIDO}/products`);
    if (response.ok) {
      productosMenu = await response.json();
    }
  } catch (err) {
    console.error('Error al cargar productos originales:', err);
  }
}

function esElegibleDescuento(producto) {
  const ahora = new Date();
  const fechaFin = new Date('2026-09-28T00:00:00-03:00'); // 30 días a partir del 28 de agosto de 2026
  if (ahora > fechaFin) return false;
  
  const esHamburguesa = ['simple', 'doble', 'triple', 'vegetariana'].includes(producto.categoria);
  const esPapasCheddar = producto.id === 'papas_cheddar';
  
  return esHamburguesa || esPapasCheddar;
}

async function verificarEstadoLocal() {
  const btn = document.getElementById('btnEnviarPedido');
  const form = document.getElementById('formPedido');
  if (!form) return;
  
  try {
    const response = await fetch(`${API_PEDIDO}/orders/store-status`);
    if (response.ok) {
      const data = await response.json();
      if (!data.open) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'alerta-local-cerrado';
        warningDiv.innerHTML = `
          <div style="background-color: #dc3545; color: white; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: center; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 10px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem;"></i>
            <span>El local se encuentra cerrado. Horarios de atención: Martes a Viernes 17:30 - 23:50, Sábados y Domingos 18:00 - 23:50 hs.</span>
          </div>
        `;
        form.parentNode.insertBefore(warningDiv, form);
        
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-times-circle"></i> Local Cerrado';
          btn.style.backgroundColor = '#6c757d';
          btn.style.cursor = 'not-allowed';
        }
      }
    }
  } catch (err) {
    console.error('Error al verificar estado del local:', err);
  }
}

function cargarCarrito() {
  const carritoGuardado = localStorage.getItem('gustitoCarrito');
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }
}

function cambiarCantidad(id, delta) {
  const index = carrito.findIndex(item => item.id === id);
  if (index !== -1) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    guardarCarrito();
    actualizarResumen();
  }
}

function eliminarItem(id) {
  const index = carrito.findIndex(item => item.id === id);
  if (index !== -1) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarResumen();
  }
}

function guardarCarrito() {
  localStorage.setItem('gustitoCarrito', JSON.stringify(carrito));
}

function actualizarResumen() {
  const resumenContainer = document.getElementById('resumenProductos');
  const totalSpan = document.getElementById('resumenTotal');
  const btnEnviar = document.getElementById('btnEnviarPedido');
  const form = document.getElementById('formPedido');
  
  if (!resumenContainer) return;
  
  let total = 0;
  resumenContainer.innerHTML = '';
  
  if (carrito.length === 0) {
    resumenContainer.innerHTML = `
      <div class="mensaje-vacio">
        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem; display: block;"></i>
        <p style="margin-bottom: 10px;">Tu carrito está vacío</p>
        <a href="index.html" class="btn-explorar-menu"><i class="fas fa-arrow-left"></i> Explorar Menú</a>
      </div>
    `;
    if (totalSpan) totalSpan.textContent = '0';
    
    if (btnEnviar) {
      btnEnviar.disabled = true;
      btnEnviar.style.backgroundColor = '#6c757d';
      btnEnviar.style.cursor = 'not-allowed';
      btnEnviar.innerHTML = '<i class="fas fa-times-circle"></i> Confirmar Pedido';
    }
    
    if (form) {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => input.disabled = true);
    }
    return;
  }
  
  // Habilitar campos si no está vacío
  if (form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.disabled = false);
  }
  if (btnEnviar) {
    const localCerradoAlerta = document.querySelector('.alerta-local-cerrado');
    if (!localCerradoAlerta) {
      btnEnviar.disabled = false;
      btnEnviar.style.backgroundColor = '';
      btnEnviar.style.cursor = '';
      btnEnviar.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Pedido';
    }
  }
  
  carrito.forEach(producto => {
    const subtotal = producto.precio * producto.cantidad;
    total += subtotal;
    
    // Buscar precio original para ver si tenía descuento
    const prodOriginal = productosMenu.find(p => p.id === producto.id);
    const tieneDescuento = prodOriginal ? esElegibleDescuento(prodOriginal) : false;
    
    let priceDescHTML = '';
    if (tieneDescuento && prodOriginal) {
      priceDescHTML = `
        <span class="precio-original-resumen" style="text-decoration: line-through; color: #a5a5a5; font-size: 0.85em; margin-right: 6px; font-weight: normal;">$${prodOriginal.precio.toLocaleString()}</span>
        <span class="precio-descuento-resumen" style="color: var(--primary-color, #ff6b00); font-weight: 800; font-size: 1.05rem;">$${producto.precio.toLocaleString()} <span style="font-size: 0.8em; font-weight: normal; color: #666;">c/u</span></span>
        <span class="badge-descuento-ticket" style="background-color: rgba(255, 107, 0, 0.12); color: var(--primary-color, #ff6b00); padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; margin-left: 8px; border: 1px solid rgba(255, 107, 0, 0.25); display: inline-block;">10% OFF</span>
      `;
    } else {
      priceDescHTML = `<span class="precio-normal-resumen" style="font-weight: 700; color: #444; font-size: 0.95rem;">$${producto.precio.toLocaleString()} <span style="font-size: 0.8em; font-weight: normal; color: #666;">c/u</span></span>`;
    }
    
    const item = document.createElement('div');
    item.className = 'ticket-item';
    item.innerHTML = `
      <div class="ticket-item-row1">
        <span class="ticket-item-name">${producto.nombre}</span>
        <span class="ticket-item-subtotal">$${subtotal.toLocaleString()}</span>
      </div>
      <div class="ticket-item-row2">
        <div class="ticket-item-price-desc">
          ${priceDescHTML}
        </div>
        <div class="ticket-item-actions">
          <div class="qty-controls">
            <button type="button" class="qty-btn btn-minus" data-id="${producto.id}">-</button>
            <span class="qty-val">${producto.cantidad}</span>
            <button type="button" class="qty-btn btn-plus" data-id="${producto.id}">+</button>
          </div>
          <button type="button" class="btn-delete-item" data-id="${producto.id}" title="Eliminar del pedido">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;
    resumenContainer.appendChild(item);
  });
  
  if (totalSpan) totalSpan.textContent = total.toLocaleString();
  
  // Agregar eventos a botones de cantidad y borrado
  resumenContainer.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', () => cambiarCantidad(btn.dataset.id, -1));
  });
  resumenContainer.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', () => cambiarCantidad(btn.dataset.id, 1));
  });
  resumenContainer.querySelectorAll('.btn-delete-item').forEach(btn => {
    btn.addEventListener('click', () => eliminarItem(btn.dataset.id));
  });
}

async function enviarPedido(e) {
  e.preventDefault();
  
  const btn = document.getElementById('btnEnviarPedido');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  
  if (carrito.length === 0) {
    mostrarToast('Agregá productos a tu pedido', 'error');
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
    return;
  }
  
  const nombre = document.getElementById('nombre')?.value;
  const direccion = document.getElementById('direccion')?.value;
  const telefono = document.getElementById('telefono')?.value;
  const referencia = document.getElementById('referencia')?.value;
  const notas = document.getElementById('notas')?.value;
  const metodoPago = document.getElementById('metodoPago')?.value;
  
  if (!nombre || !direccion || !telefono || !metodoPago) {
    mostrarToast('Completá todos los campos obligatorios', 'error');
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
    return;
  }
  
  const items = carrito.map(item => ({
    producto_id: item.id || item.nombre.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio: item.precio
  }));
  
  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  const pedidoData = {
    items,
    total,
    cliente: {
      nombre,
      telefono,
      direccion,
      referencia: referencia || ''
    },
    notas: notas || '',
    metodoPago
  };
  
  try {
    const response = await fetch(`${API_PEDIDO}/orders/public`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.removeItem('gustitoCarrito');
      carrito = [];
      
      const modal = document.getElementById('modalConfirmacion');
      if (modal) modal.style.display = 'flex';
      
      mostrarToast('Pedido enviado correctamente', 'success');
      
      creadoPedidoId = data.pedidoId;
      setTimeout(() => {
        window.location.href = `seguimiento.html?id=${data.pedidoId}`;
      }, 3000);
    } else {
      mostrarToast(data.mensaje || 'Error al enviar el pedido', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error de conexión con el servidor', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

function mostrarToast(mensaje, tipo = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) {
    alert(mensaje);
    return;
  }
  toast.textContent = mensaje;
  toast.className = `toast show ${tipo}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function configurarEventos() {
  const form = document.getElementById('formPedido');
  if (form) {
    form.addEventListener('submit', enviarPedido);
  }
  
  const closeModal = document.querySelector('.close-modal');
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      document.getElementById('modalConfirmacion').style.display = 'none';
    });
  }
  
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
      document.getElementById('modalConfirmacion').style.display = 'none';
      if (creadoPedidoId) {
        window.location.href = `seguimiento.html?id=${creadoPedidoId}`;
      } else {
        window.location.href = 'index.html';
      }
    });
  }
}