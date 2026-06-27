const API_PEDIDO = window.API_URL || 'http://localhost:8080/api';

let carrito = [];
let creadoPedidoId = null;

document.addEventListener('DOMContentLoaded', () => {
  cargarCarrito();
  actualizarResumen();
  configurarEventos();
  verificarEstadoLocal();
});

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
  actualizarResumen();
}

function actualizarResumen() {
  const resumenContainer = document.getElementById('resumenProductos');
  const totalSpan = document.getElementById('resumenTotal');
  
  if (!resumenContainer) return;
  
  let total = 0;
  resumenContainer.innerHTML = '';
  
  if (carrito.length === 0) {
    resumenContainer.innerHTML = '<p class="mensaje-vacio">No hay productos seleccionados</p>';
    if (totalSpan) totalSpan.textContent = '0';
    return;
  }
  
  carrito.forEach(producto => {
    const subtotal = producto.precio * producto.cantidad;
    total += subtotal;
    
    const item = document.createElement('div');
    item.className = 'resumen-item';
    item.innerHTML = `
      <span>${producto.nombre} x${producto.cantidad}</span>
      <span>$${subtotal.toLocaleString()}</span>
    `;
    resumenContainer.appendChild(item);
  });
  
  if (totalSpan) totalSpan.textContent = total.toLocaleString();
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