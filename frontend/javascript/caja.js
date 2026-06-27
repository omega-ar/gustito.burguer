const API_URL = window.API_URL || 'http://localhost:8080/api';
let token = null;
let usuario = null;
let pedidosPendientes = [];
let pedidosListos = [];
let productosMenu = [];
let carritoCaja = [];

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

function verificarAuth() {
  token = localStorage.getItem('token');
  try {
    usuario = JSON.parse(localStorage.getItem('usuario') || '{}') || {};
  } catch (e) {
    usuario = {};
  }
  
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }
  
  const userNameSpan = document.getElementById('userName');
  if (userNameSpan) userNameSpan.textContent = usuario.nombre || usuario.email || 'Cajero';
  return true;
}

async function imprimirComanda(pedido) {
  try {
    const response = await fetch(`${API_URL}/print/comanda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ pedido })
    });
    
    if (response.ok) {
      const data = await response.json();
      const ventana = window.open('');
      ventana.document.write(data.html);
      ventana.document.close();
      ventana.print();
      ventana.close();
      mostrarToast('Comanda enviada a impresión', 'success');
    } else {
      imprimirComandaLocal(pedido);
    }
  } catch (error) {
    console.error('Error al imprimir:', error);
    imprimirComandaLocal(pedido);
  }
}

function imprimirComandaLocal(pedido) {
  if (!pedido) {
    console.error('No hay pedido para imprimir');
    return;
  }
  
  const fecha = new Date().toLocaleString('es-AR');
  const lineas = [];
  
  lineas.push('================================');
  lineas.push('     🍔 EL GUSTITO BURGER');
  lineas.push('================================');
  lineas.push(`Pedido: #${pedido.id}`);
  lineas.push(`Fecha: ${fecha}`);
  lineas.push(`Cliente: ${pedido.cliente?.nombre || 'Mostrador'}`);
  if (pedido.cliente?.telefono) lineas.push(`Tel: ${pedido.cliente.telefono}`);
  if (pedido.cliente?.direccion && pedido.cliente.direccion !== 'Mostrador') lineas.push(`Dirección: ${pedido.cliente.direccion}`);
  if (pedido.cliente?.referencia) lineas.push(`Ref: ${pedido.cliente.referencia}`);
  if (pedido.notas) lineas.push(`Notas: ${pedido.notas}`);
  lineas.push('--------------------------------');
  
  for (const item of pedido.items) {
    lineas.push(`${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString()}`);
  }
  
  lineas.push('--------------------------------');
  lineas.push(`TOTAL: $${(pedido.total || 0).toLocaleString()}`);
  lineas.push('================================');
  lineas.push('¡Gracias por elegirnos!');
  lineas.push('================================');
  
  const ventana = window.open('');
  ventana.document.write(`<pre style="font-family: monospace; font-size: 12px; white-space: pre;">${lineas.join('\n')}</pre>`);
  ventana.document.close();
  ventana.print();
  ventana.close();
}

let cajaAbierta = false;
let turnoActual = null;

async function cargarEstadoCaja() {
  try {
    const response = await fetch(`${API_URL}/cash/estado`, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      cajaAbierta = data.abierta;
      turnoActual = data.turno;
      actualizarUICaja();
    }
  } catch (error) {
    console.error('Error al cargar estado de caja:', error);
  }
}

function actualizarUICaja() {
  const statusBadge = document.getElementById('cajaStatus');
  const btnAbrir = document.getElementById('btnAbrirCaja');
  const btnCerrar = document.getElementById('btnCerrarCaja');
  const montoInicialSpan = document.getElementById('montoInicial');
  const ventasTurnoSpan = document.getElementById('ventasTurno');
  const horaAperturaSpan = document.getElementById('horaApertura');
  const cajeroNombreSpan = document.getElementById('cajeroNombre');
  const turnoActualSpan = document.getElementById('turnoActual');
  
  if (cajaAbierta && turnoActual) {
    statusBadge.textContent = 'Abierta';
    statusBadge.style.background = '#28a745';
    if (btnAbrir) btnAbrir.style.display = 'none';
    if (btnCerrar) btnCerrar.style.display = 'block';
    if (montoInicialSpan) montoInicialSpan.textContent = turnoActual.montoInicial || 0;
    if (ventasTurnoSpan) ventasTurnoSpan.textContent = turnoActual.ventasTurno || 0;
    if (horaAperturaSpan && turnoActual.apertura) {
      let fechaApertura;
      if (turnoActual.apertura._seconds) {
        fechaApertura = new Date(turnoActual.apertura._seconds * 1000);
      } else if (turnoActual.apertura.seconds) {
        fechaApertura = new Date(turnoActual.apertura.seconds * 1000);
      } else {
        fechaApertura = new Date(turnoActual.apertura);
      }
      horaAperturaSpan.textContent = isNaN(fechaApertura.getTime()) ? '-' : fechaApertura.toLocaleTimeString('es-AR');
    }
    if (cajeroNombreSpan) cajeroNombreSpan.textContent = usuario.nombre || usuario.email || 'Cajero';
    if (turnoActualSpan) turnoActualSpan.textContent = turnoActual.id || '-';
  } else {
    statusBadge.textContent = 'Cerrada';
    statusBadge.style.background = '#dc3545';
    if (btnAbrir) btnAbrir.style.display = 'block';
    if (btnCerrar) btnCerrar.style.display = 'none';
  }
}

async function abrirCaja() {
  const montoInicial = prompt('Ingrese el monto inicial de caja:');
  if (!montoInicial || isNaN(montoInicial)) {
    mostrarToast('Monto inválido', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/cash/abrir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        montoInicial: parseInt(montoInicial)
      })
    });
    
    if (response.ok) {
      mostrarToast('Caja abierta correctamente', 'success');
      cargarEstadoCaja();
    } else {
      mostrarToast('Error al abrir caja', 'error');
    }
  } catch (error) {
    mostrarToast('Error de conexión', 'error');
  }
}

async function cerrarCaja() {
  if (!confirm('¿Estás seguro de cerrar la caja? Se generará el cierre de turno.')) return;
  
  try {
    const response = await fetch(`${API_URL}/cash/cerrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        turnoId: turnoActual?.id
      })
    });
    
    if (response.ok) {
      mostrarToast('Caja cerrada correctamente', 'success');
      cajaAbierta = false;
      turnoActual = null;
      actualizarUICaja();
    } else {
      mostrarToast('Error al cerrar caja', 'error');
    }
  } catch (error) {
    mostrarToast('Error de conexión', 'error');
  }
}

async function cargarProductosMenu() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (response.ok) {
      productosMenu = await response.json();
      mostrarSelectorProductos();
    }
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

function mostrarSelectorProductos() {
  const container = document.getElementById('selectorProductos');
  if (!container) return;
  
  const categorias = {
    simple: '🍔 Simples',
    doble: '🔥 Dobles',
    triple: '💪 Triples',
    vegetariana: '🌿 Vegetarianas',
    promo: '🎉 Promos',
    otros: '🍟 Acompañamientos',
    bebidas: '🥤 Bebidas',
    extras: '✨ Extras'
  };
  
  let html = '<div class="productos-selector-grid">';
  
  for (const [catKey, catNombre] of Object.entries(categorias)) {
    const productosCat = productosMenu.filter(p => p.categoria === catKey && p.activo);
    if (productosCat.length === 0) continue;
    
    html += `<div class="categoria-grupo">
              <h4>${catNombre}</h4>
              <div class="productos-mini-grid">`;
    
    for (const prod of productosCat) {
      html += `
        <button class="btn-producto-caja" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${prod.precio}">
          ${prod.nombre}<br>
          <small>$${prod.precio.toLocaleString()}</small>
        </button>
      `;
    }
    
    html += `</div></div>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
  
  document.querySelectorAll('.btn-producto-caja').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const precio = parseInt(btn.dataset.precio);
      agregarAlCarritoCaja({ id, nombre, precio, cantidad: 1 });
    });
  });
}

function agregarAlCarritoCaja(producto) {
  const existente = carritoCaja.find(item => item.id === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carritoCaja.push({ ...producto, cantidad: 1 });
  }
  actualizarCarritoCajaUI();
}

function actualizarCarritoCajaUI() {
  const container = document.getElementById('carritoCajaItems');
  const totalSpan = document.getElementById('carritoCajaTotal');
  
  if (!container) return;
  
  if (carritoCaja.length === 0) {
    container.innerHTML = '<p class="empty-cart">No hay productos agregados</p>';
    if (totalSpan) totalSpan.textContent = '0';
    return;
  }
  
  let total = 0;
  container.innerHTML = '';
  
  carritoCaja.forEach((item, idx) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    
    const div = document.createElement('div');
    div.className = 'carrito-item-caja';
    div.innerHTML = `
      <span>${item.nombre} x${item.cantidad}</span>
      <span>$${subtotal.toLocaleString()}</span>
      <button class="btn-remover-caja" data-index="${idx}"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
  });
  
  if (totalSpan) totalSpan.textContent = total.toLocaleString();
  
  document.querySelectorAll('.btn-remover-caja').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      carritoCaja.splice(idx, 1);
      actualizarCarritoCajaUI();
    });
  });
}

async function enviarPedidoCaja() {
  if (carritoCaja.length === 0) {
    mostrarToast('❌ Agregá productos al pedido', 'error');
    return;
  }

  if (!cajaAbierta) {
    mostrarToast('❌ Primero abrí la caja', 'error');
    return;
  }

  const clienteNombre = document.getElementById('clienteNombre')?.value || 'Mostrador';
  const clienteTelefono = document.getElementById('clienteTelefono')?.value || '';
  const metodoPago = document.getElementById('metodoPagoCaja')?.value || 'efectivo';
  const notas = document.getElementById('notasCaja')?.value || '';
  
  const total = carritoCaja.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  
  const items = carritoCaja.map(item => ({
    producto_id: item.id,
    nombre: item.nombre,
    cantidad: item.cantidad,
    precio: item.precio
  }));
  
  const btn = document.getElementById('btnEnviarPedidoCaja');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  
  try {
    const response = await fetch(`${API_URL}/orders/caja`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({
        items,
        total,
        cliente: {
          nombre: clienteNombre,
          telefono: clienteTelefono,
          direccion: 'Mostrador'
        },
        metodoPago,
        notas
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      mostrarToast(data.mensaje || '❌ Error al crear pedido', 'error');
      btn.disabled = false;
      btn.innerHTML = textoOriginal;
      return;
    }
    
    console.log('✅ Pedido creado:', data);
    mostrarToast('✅ Pedido creado correctamente', 'success');
    
    carritoCaja = [];
    actualizarCarritoCajaUI();
    
    const clienteNombreInput = document.getElementById('clienteNombre');
    const clienteTelefonoInput = document.getElementById('clienteTelefono');
    const notasInput = document.getElementById('notasCaja');
    
    if (clienteNombreInput) clienteNombreInput.value = '';
    if (clienteTelefonoInput) clienteTelefonoInput.value = '';
    if (notasInput) notasInput.value = '';
    
    const metodoPagoSelect = document.getElementById('metodoPagoCaja');
    if (metodoPagoSelect) metodoPagoSelect.value = 'efectivo';
    
    await cargarPedidosPendientes();
    await cargarEstadoCaja();
    
  } catch (error) {
    console.error('Error en fetch:', error);
    mostrarToast('❌ Error de conexión con el servidor', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
  }
}

async function cargarPedidosPendientes() {
  try {
    const response = await fetch(`${API_URL}/orders/pending`, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    
    const data = await response.json();
    pedidosPendientes = Array.isArray(data) ? data : (data.pedidos || []);
    mostrarPedidosPendientes();
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al cargar pedidos', 'error');
  }
}

function mostrarPedidosPendientes() {
  const container = document.getElementById('pedidosPendientes');
  const countSpan = document.getElementById('pendientesCount');
  
  if (!container) return;
  if (countSpan) countSpan.textContent = pedidosPendientes.length;
  
  if (pedidosPendientes.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No hay pedidos pendientes</p></div>';
    return;
  }
  
  container.innerHTML = pedidosPendientes.map(pedido => `
    <div class="pedido-card ${pedido.estado === 'preparando' ? 'preparando' : ''}" data-id="${pedido.id}">
      <div class="pedido-header">
        <span class="pedido-id">#${pedido.id}</span>
        <span class="pedido-status ${pedido.estado}">${pedido.estado === 'pendiente' ? '⏳ Pendiente' : '🔧 En preparación'}</span>
      </div>
      <div class="pedido-cliente">
        <strong><i class="fas fa-user"></i> ${pedido.cliente?.nombre || 'Mostrador'}</strong>
        ${pedido.cliente?.telefono ? `<span><i class="fas fa-phone"></i> ${pedido.cliente.telefono}</span>` : ''}
      </div>
      <div class="pedido-items">
        ${(pedido.items || []).map(item => `<div class="pedido-item">${item.cantidad}x ${item.nombre}</div>`).join('')}
      </div>
      <div class="pedido-total">
        <strong>Total: $${(pedido.total || 0).toLocaleString()}</strong>
      </div>
      <div class="pedido-actions">
        <button class="btn-ver-comanda" data-id="${pedido.id}"><i class="fas fa-receipt"></i> Ver Comanda</button>
        ${pedido.estado === 'pendiente' ? `<button class="btn-preparar" data-id="${pedido.id}"><i class="fas fa-utensils"></i> Preparar</button>` : ''}
        ${pedido.estado === 'preparando' ? `<button class="btn-listo" data-id="${pedido.id}"><i class="fas fa-check"></i> Terminar</button>` : ''}
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.btn-ver-comanda').forEach(btn => {
    btn.addEventListener('click', () => verComanda(btn.dataset.id));
  });
  document.querySelectorAll('.btn-preparar').forEach(btn => {
    btn.addEventListener('click', () => marcarPreparando(btn.dataset.id));
  });
  document.querySelectorAll('.btn-listo').forEach(btn => {
    btn.addEventListener('click', () => marcarEnCamino(btn.dataset.id));
  });
}

async function cargarPedidosListos() {
  try {
    const response = await fetch(`${API_URL}/orders/listos`, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const data = await response.json();
      pedidosListos = Array.isArray(data) ? data : (data.pedidos || []);
      mostrarPedidosListos();
    }
  } catch (error) {
    console.error('Error al cargar pedidos listos:', error);
  }
}

function mostrarPedidosListos() {
  const container = document.getElementById('pedidosListos');
  if (!container) return;
  
  if (pedidosListos.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No hay pedidos listos</p></div>';
    return;
  }
  
  container.innerHTML = pedidosListos.map(pedido => `
    <div class="pedido-card listo">
      <div class="pedido-header">
        <span class="pedido-id">#${pedido.id}</span>
        <span class="pedido-status listo">✅ Listo</span>
      </div>
      <div class="pedido-cliente">
        <strong><i class="fas fa-user"></i> ${pedido.cliente?.nombre || 'Mostrador'}</strong>
      </div>
      <div class="pedido-items">
        ${(pedido.items || []).map(item => `<div class="pedido-item">${item.cantidad}x ${item.nombre}</div>`).join('')}
      </div>
      <div class="pedido-total">
        <strong>Total: $${(pedido.total || 0).toLocaleString()}</strong>
      </div>
      <div class="pedido-actions">
        <button class="btn-entregar" data-id="${pedido.id}"><i class="fas fa-hand-holding-heart"></i> Entregar</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.btn-entregar').forEach(btn => {
    btn.addEventListener('click', () => entregarPedido(btn.dataset.id));
  });
}

async function entregarPedido(pedidoId) {
  if (!confirm('¿Marcar este pedido como entregado y finalizado?')) return;
  
  try {
    const response = await fetch(`${API_URL}/orders/${pedidoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ estado: 'entregado' })
    });
    
    if (response.ok) {
      mostrarToast('Pedido entregado y finalizado 🎉', 'success');
      cargarPedidosListos();
      await cargarEstadoCaja();
    } else {
      mostrarToast('Error al entregar pedido', 'error');
    }
  } catch (error) {
    console.error('Error al entregar pedido:', error);
    mostrarToast('Error de conexión', 'error');
  }
}

async function buscarHistorial() {
  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const defaultFecha = `${year}-${month}-${day}`;

  const fecha = document.getElementById('fechaHistorial')?.value || defaultFecha;
  
  try {
    const response = await fetch(`${API_URL}/orders/historial?fecha=${fecha}`, {
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const pedidos = await response.json();
      mostrarHistorial(pedidos, fecha);
    }
  } catch (error) {
    mostrarToast('Error al buscar historial', 'error');
  }
}

function mostrarHistorial(pedidos, fecha) {
  const container = document.getElementById('pedidosHistorial');
  if (!container) return;
  
  if (pedidos.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fas fa-calendar"></i><p>No hay pedidos para el ${fecha}</p></div>`;
    return;
  }
  
  const totalVentas = pedidos.reduce((sum, p) => sum + (p.total || 0), 0);
  
  container.innerHTML = `
    <div class="historial-resumen">
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><strong>Total pedidos:</strong> ${pedidos.length}</p>
      <p><strong>Total ventas:</strong> $${totalVentas.toLocaleString()}</p>
    </div>
    <div class="pedidos-grid">
      ${pedidos.map(pedido => `
        <div class="pedido-card historial-item">
          <div class="pedido-header">
            <span class="pedido-id">#${pedido.id}</span>
            <span class="pedido-status ${pedido.estado}">${pedido.estado}</span>
          </div>
          <div class="pedido-cliente">
            <strong>${pedido.cliente?.nombre || 'Mostrador'}</strong>
          </div>
          <div class="pedido-items">
            ${(pedido.items || []).map(item => `<div class="pedido-item">${item.cantidad}x ${item.nombre}</div>`).join('')}
          </div>
          <div class="pedido-total">
            <strong>$${pedido.total?.toLocaleString()}</strong>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function verComanda(pedidoId) {
  const pedido = pedidosPendientes.find(p => p.id == pedidoId);
  if (!pedido) {
    mostrarToast('Pedido no encontrado', 'error');
    return;
  }
  
  const modal = document.getElementById('modalComanda');
  const comandaIdSpan = document.getElementById('comandaId');
  const comandaTextoPre = document.getElementById('comandaTexto');
  
  if (comandaIdSpan) comandaIdSpan.textContent = pedidoId;
  
  const fecha = new Date().toLocaleString();
  const lineas = [];
  lineas.push('================================');
  lineas.push('     EL GUSTITO BURGER');
  lineas.push('================================');
  lineas.push(`Pedido: #${pedido.id}`);
  lineas.push(`Fecha: ${fecha}`);
  lineas.push(`Cliente: ${pedido.cliente?.nombre || 'Mostrador'}`);
  if (pedido.cliente?.telefono) lineas.push(`Tel: ${pedido.cliente.telefono}`);
  if (pedido.cliente?.direccion && pedido.cliente.direccion !== 'Mostrador') lineas.push(`Dirección: ${pedido.cliente.direccion}`);
  if (pedido.cliente?.referencia) lineas.push(`Ref: ${pedido.cliente.referencia}`);
  if (pedido.notas) lineas.push(`Notas: ${pedido.notas}`);
  lineas.push('--------------------------------');
  for (const item of pedido.items) {
    lineas.push(`${item.cantidad}x ${item.nombre}`);
  }
  lineas.push('--------------------------------');
  lineas.push(`Total: $${pedido.total?.toLocaleString() || 0}`);
  lineas.push('================================');
  lineas.push('¡Gracias por elegirnos!');
  
  if (comandaTextoPre) comandaTextoPre.textContent = lineas.join('\n');
  if (modal) modal.style.display = 'flex';
  
  const btnImprimir = document.getElementById('btnImprimirComanda');
  if (btnImprimir) {
    btnImprimir.onclick = () => {
      imprimirComandaLocal(pedido);
      if (modal) modal.style.display = 'none';
    };
  }
}

async function marcarPreparando(pedidoId) {
  try {
    const response = await fetch(`${API_URL}/orders/${pedidoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ estado: 'preparando' })
    });
    
    if (response.ok) {
      mostrarToast('Pedido marcado como en preparación', 'success');
      cargarPedidosPendientes();
      await cargarEstadoCaja();
    } else {
      mostrarToast('Error al actualizar estado', 'error');
    }
  } catch (error) {
    mostrarToast('Error al actualizar estado', 'error');
  }
}

async function marcarEnCamino(pedidoId) {
  try {
    const response = await fetch(`${API_URL}/orders/${pedidoId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ estado: 'en_camino' })
    });
    
    if (response.ok) {
      mostrarToast('Pedido en camino 🛵', 'success');
      cargarPedidosPendientes();
      cargarPedidosListos();
      await cargarEstadoCaja();
    } else {
      mostrarToast('Error al actualizar estado', 'error');
    }
  } catch (error) {
    mostrarToast('Error al actualizar estado', 'error');
  }
}

async function aceptarPedido(pedidoId) {
  try {
    const response = await fetch(`${API_URL}/orders/${pedidoId}/listo`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
    
    if (response.ok) {
      const modal = document.getElementById('modalComanda');
      if (modal) modal.style.display = 'none';
      mostrarToast('Pedido marcado como listo', 'success');
      cargarPedidosPendientes();
      cargarPedidosListos();
    } else {
      mostrarToast('Error al aceptar pedido', 'error');
    }
  } catch (error) {
    mostrarToast('Error al aceptar pedido', 'error');
  }
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).classList.add('active');
      
      if (tabId === 'listos') cargarPedidosListos();
      if (tabId === 'historial') buscarHistorial();
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!verificarAuth()) return;
  
  initTabs();

  const inputFecha = document.getElementById('fechaHistorial');
  if (inputFecha) {
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    inputFecha.value = `${year}-${month}-${day}`;
  }
  
  await cargarPedidosPendientes();
  await cargarEstadoCaja();
  await cargarProductosMenu();
  
  document.getElementById('btnAbrirCaja')?.addEventListener('click', abrirCaja);
  document.getElementById('btnCerrarCaja')?.addEventListener('click', cerrarCaja);
  document.getElementById('btnEnviarPedidoCaja')?.addEventListener('click', enviarPedidoCaja);
  document.getElementById('btnBuscarHistorial')?.addEventListener('click', buscarHistorial);
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
  });
  
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById('modalComanda');
      if (modal) modal.style.display = 'none';
    });
  });
  
  setInterval(cargarPedidosPendientes, 10000);
});