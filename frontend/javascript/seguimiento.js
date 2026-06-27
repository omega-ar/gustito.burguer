const API_URL = window.API_URL || 'http://localhost:8080/api';
let orderId = null;
let pollingInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  orderId = params.get('id');

  if (!orderId) {
    alert('Código de pedido no especificado en la URL.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('txtOrderId').textContent = orderId;
  
  document.getElementById('btnCopyId').addEventListener('click', () => {
    navigator.clipboard.writeText(orderId).then(() => {
      const btn = document.getElementById('btnCopyId');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
      setTimeout(() => btn.innerHTML = originalText, 2000);
    });
  });

  cargarDatosPedido();
  pollingInterval = setInterval(cargarDatosPedido, 10000); // Polling cada 10 segundos
});

async function cargarDatosPedido() {
  try {
    const response = await fetch(`${API_URL}/orders/public/${orderId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        clearInterval(pollingInterval);
        mostrarError('Pedido no encontrado', 'Verificá el código en la URL o realizá un nuevo pedido.');
      } else {
        throw new Error('Error al conectar con el servidor');
      }
      return;
    }

    const pedido = await response.json();
    console.log('Pedido en vivo cargado:', pedido);
    
    actualizarInterfaz(pedido);
    configurarBotonWhatsApp(pedido);

  } catch (error) {
    console.error('Error en polling:', error);
    document.getElementById('txtStatusLabel').textContent = 'Problemas de conexión...';
    document.getElementById('txtStatusDesc').textContent = 'Intentando restablecer la comunicación con el servidor de la sucursal.';
  }
}

function actualizarInterfaz(pedido) {
  document.getElementById('txtClienteNombre').textContent = pedido.cliente?.nombre || 'Mostrador';
  document.getElementById('txtClienteTelefono').textContent = pedido.cliente?.telefono || '-';
  document.getElementById('txtClienteDireccion').textContent = pedido.cliente?.direccion || 'Retira en local';
  document.getElementById('txtClienteReferencia').textContent = pedido.cliente?.referencia || 'Sin referencias';
  document.getElementById('txtMetodoPago').textContent = pedido.metodoPago === 'efectivo' ? '💵 Efectivo al recibir' : '📲 Transferencia (Mercado Pago)';
  
  if (pedido.createdAt) {
    let fecha;
    if (pedido.createdAt._seconds) {
      fecha = new Date(pedido.createdAt._seconds * 1000);
    } else if (pedido.createdAt.seconds) {
      fecha = new Date(pedido.createdAt.seconds * 1000);
    } else {
      fecha = new Date(pedido.createdAt);
    }
    
    if (fecha && !isNaN(fecha.getTime())) {
      document.getElementById('txtOrderTime').textContent = fecha.toLocaleString('es-AR');
    } else {
      document.getElementById('txtOrderTime').textContent = '-';
    }
  }

  const itemsContainer = document.getElementById('orderItemsContainer');
  if (itemsContainer && pedido.items) {
    itemsContainer.innerHTML = pedido.items.map(item => `
      <div class="resumen-item" style="display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.95rem;">
        <span>${item.nombre} x${item.cantidad}</span>
        <span style="font-weight: 600;">$${(item.precio * item.cantidad).toLocaleString()}</span>
      </div>
    `).join('');
  }
  
  document.getElementById('txtOrderTotal').textContent = pedido.total?.toLocaleString() || '0';

  const steps = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4')
  };

  const lineFill = document.getElementById('progressBarFill');
  const statusLabel = document.getElementById('txtStatusLabel');
  const statusDesc = document.getElementById('txtStatusDesc');
  const titleHighlight = document.querySelector('.section-title .highlight');

  Object.values(steps).forEach(step => {
    if (step) {
      step.classList.remove('active', 'completed');
    }
  });

  const estado = pedido.estado || 'pendiente';

  if (estado === 'pendiente') {
    steps.step1.classList.add('active');
    lineFill.style.width = '0%';
    statusLabel.textContent = 'Pedido Recibido 📥';
    statusDesc.textContent = 'Tu pedido ha entrado al sistema. En breve el cajero lo confirmará para iniciar la preparación.';
    if (titleHighlight) titleHighlight.textContent = 'recibido';
  } 
  else if (estado === 'preparando') {
    steps.step1.classList.add('completed');
    steps.step2.classList.add('active');
    lineFill.style.width = '33.33%';
    statusLabel.textContent = '¡En Cocina! 🍳';
    statusDesc.textContent = 'Nuestros cocineros están preparando tus hamburguesas con la receta artesanal de la casa.';
    if (titleHighlight) titleHighlight.textContent = 'preparación';
  } 
  else if (estado === 'listo' || estado === 'en_camino') {
    steps.step1.classList.add('completed');
    steps.step2.classList.add('completed');
    steps.step3.classList.add('active');
    lineFill.style.width = '66.66%';
    statusLabel.textContent = '¡En Camino! 🛵';
    statusDesc.textContent = 'El repartidor ya lleva tu hamburguesa caliente directa hacia tu domicilio. ¡Prepárate!';
    if (titleHighlight) titleHighlight.textContent = 'camino';
  } 
  else if (estado === 'entregado') {
    steps.step1.classList.add('completed');
    steps.step2.classList.add('completed');
    steps.step3.classList.add('completed');
    steps.step4.classList.add('completed');
    lineFill.style.width = '100%';
    statusLabel.textContent = '¡Pedido Entregado! 🎉';
    statusDesc.textContent = '¡Tu pedido fue entregado correctamente! Esperamos que disfrutes de tu hamburguesa. ¡Muchas gracias!';
    if (titleHighlight) titleHighlight.textContent = 'entregado';
    
    clearInterval(pollingInterval);
  }
}

function configurarBotonWhatsApp(pedido) {
  const btnWhatsapp = document.getElementById('btnWhatsappLink');
  if (!btnWhatsapp) return;

  const WHATSAPP_NUM = '5491122750551';
  
  const itemsTexto = (pedido.items || []).map(item => `• ${item.cantidad}x ${item.nombre}`).join('\n');
  
  const mensaje = `¡Hola El Gustito! 🍔 Acabo de hacer el pedido *#${pedido.id}* desde su web.

*Detalle:*
${itemsTexto}

*Total:* $${pedido.total?.toLocaleString()}
*Método de Pago:* ${pedido.metodoPago === 'efectivo' ? '💵 Efectivo al recibir' : '📲 Transferencia (Mercado Pago)'}

*Datos de Entrega:*
- Nombre: ${pedido.cliente?.nombre || 'Cliente'}
- Dirección: ${pedido.cliente?.direccion || 'Mostrador'}
- Referencia: ${pedido.cliente?.referencia || 'Ninguna'}

Aguardo su confirmación de demora y salida del pedido. ¡Muchas gracias!`;

  const encodedText = encodeURIComponent(mensaje);
  btnWhatsapp.href = `https://wa.me/${WHATSAPP_NUM}?text=${encodedText}`;
  btnWhatsapp.style.display = 'inline-flex';
}

function mostrarError(titulo, descripcion) {
  const statusLabel = document.getElementById('txtStatusLabel');
  const statusDesc = document.getElementById('txtStatusDesc');
  const itemsContainer = document.getElementById('orderItemsContainer');

  if (statusLabel) statusLabel.textContent = titulo;
  if (statusDesc) statusDesc.textContent = descripcion;
  if (itemsContainer) itemsContainer.innerHTML = '<p class="mensaje-vacio">No se pudieron cargar los datos.</p>';
}
