const API_URL = window.API_URL || 'http://localhost:8080/api';
let token = null;
let usuario = null;
let pedidosPendientes = [];
let pedidosListos = [];
let productosMenu = [];
let carritoCaja = [];

let idsConocidos = new Set();
let esPrimerCarga = true;
let sonidoHabilitado = true;

function reproducirSonidoNotificacion() {
  const audio = new Audio('audio/iphone.mp3');
  audio.play().catch(error => {
    console.log('Audio file play failed or not found, synthesizing tone instead...');
    sintetizarSonidoNotificacion();
  });
}

function sintetizarSonidoNotificacion() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (frequency, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    const now = audioCtx.currentTime;
    playNote(1046.50, now, 0.12);      // C6
    playNote(1318.51, now + 0.08, 0.12); // E6
    playNote(1567.98, now + 0.16, 0.35); // G6
  } catch (e) {
    console.error('Failed to play synthesized sound:', e);
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
  const itemsHTML = (pedido.items || []).map(item => `
    <div style="display: flex; justify-content: space-between; margin: 2px 0;">
      <span style="flex: 1;">${item.cantidad}x ${item.nombre}</span>
      <span style="text-align: right; min-width: 60px;">$${(item.precio * item.cantidad).toLocaleString()}</span>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 80mm;
          margin: 0 auto;
          padding: 12px 8px 8px 8px;
          box-sizing: border-box;
          line-height: 1.25;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
          margin-bottom: 4px;
        }
        .header h2 {
          font-size: 14px;
          margin: 0;
        }
        .info {
          margin-bottom: 4px;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
        }
        .info p {
          margin: 1px 0;
        }
        .items {
          margin-bottom: 4px;
          border-bottom: 1px dashed #000;
          padding-bottom: 4px;
        }
        .total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 13px;
          margin-top: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 6px;
          font-size: 11px;
          border-top: 1px dashed #000;
          padding-top: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>🍔 EL GUSTITO BURGER</h2>
        <p>Hamburguesas Artesanales</p>
      </div>

      <div class="info">
        <p><strong>Pedido #${pedido.id}</strong></p>
        <p>Fecha: ${fecha}</p>
        <p>Cliente: ${pedido.cliente?.nombre || 'Mostrador'}</p>
        ${pedido.cliente?.telefono ? `<p>Tel: ${pedido.cliente.telefono}</p>` : ''}
        ${pedido.cliente?.direccion && pedido.cliente.direccion !== 'Mostrador' 
          ? `<p>Dir: ${pedido.cliente.direccion}</p>` : ''}
        ${pedido.cliente?.referencia ? `<p>Ref: ${pedido.cliente.referencia}</p>` : ''}
        <p>Pago: ${pedido.metodoPago === 'efectivo' ? '💵 Efectivo' : '📲 Transferencia'}</p>
        <p>Fuente: ${pedido.fuente === 'caja' ? '🏪 Mostrador' : '🌐 Web'}</p>
      </div>

      <div class="items">
        ${itemsHTML}
      </div>

      <div class="total">
        <span>TOTAL:</span>
        <span>$${(pedido.total || 0).toLocaleString()}</span>
      </div>

      ${pedido.notas ? `<p style="margin: 4px 0 0 0;"><strong>Notas:</strong> ${pedido.notas}</p>` : ''}

      <div class="footer">
        <p>¡Gracias por elegirnos!</p>
        <p>Sánchez de Loria 633, CABA</p>
      </div>
    </body>
    </html>
  `;
  
  const ventana = window.open('');
  ventana.document.write(html);
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

function esElegibleDescuento(producto) {
  const ahora = new Date();
  const fechaFin = new Date('2026-09-28T00:00:00-03:00'); // 30 días a partir del 28 de agosto de 2026
  if (ahora > fechaFin) return false;
  
  const esHamburguesa = ['simple', 'doble', 'triple', 'vegetariana'].includes(producto.categoria);
  const esPapasCheddar = producto.id === 'papas_cheddar';
  
  return esHamburguesa || esPapasCheddar;
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
      const tieneDescuento = esElegibleDescuento(prod);
      const precioFinal = tieneDescuento ? Math.round(prod.precio * 0.9) : prod.precio;
      
      let priceLabel = '';
      if (tieneDescuento) {
        priceLabel = `<span style="text-decoration: line-through; opacity: 0.6; font-size: 0.8em; margin-right: 4px;">$${prod.precio.toLocaleString()}</span><b style="color: #2ed573;">$${precioFinal.toLocaleString()}</b> <span style="background-color: var(--primary-color, #ff6b00); color: white; padding: 1px 3px; border-radius: 3px; font-size: 0.65em; font-weight: bold; margin-left: 2px;">10% OFF</span>`;
      } else {
        priceLabel = `$${prod.precio.toLocaleString()}`;
      }

      html += `
        <button class="btn-producto-caja" data-id="${prod.id}" data-nombre="${prod.nombre}" data-precio="${precioFinal}">
          ${prod.nombre}<br>
          <small>${priceLabel}</small>
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
    
    const prodOriginal = productosMenu.find(p => p.id === item.id);
    const tieneDescuento = prodOriginal ? esElegibleDescuento(prodOriginal) : false;
    
    let subtotalHTML = '';
    if (tieneDescuento && prodOriginal) {
      subtotalHTML = `<span style="font-size: 0.8em; color: #a5a5a5; text-decoration: line-through; margin-right: 5px;">$${(prodOriginal.precio * item.cantidad).toLocaleString()}</span><strong style="color: var(--primary-color, #ff6b00);">$${subtotal.toLocaleString()}</strong>`;
    } else {
      subtotalHTML = `<span>$${subtotal.toLocaleString()}</span>`;
    }
    
    const div = document.createElement('div');
    div.className = 'carrito-item-caja';
    div.innerHTML = `
      <span>${item.nombre} x${item.cantidad}</span>
      <span>${subtotalHTML}</span>
      <button class="btn-remover-caja" data-index="${idx}"><i class="fas fa-trash-alt"></i></button>
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
    const nuevosPedidos = Array.isArray(data) ? data : (data.pedidos || []);
    
    let hayNuevoPedido = false;
    nuevosPedidos.forEach(pedido => {
      if (pedido.estado === 'pendiente' && !idsConocidos.has(pedido.id)) {
        if (!esPrimerCarga) {
          hayNuevoPedido = true;
        }
        idsConocidos.add(pedido.id);
      }
    });
    
    if (esPrimerCarga) {
      nuevosPedidos.forEach(pedido => {
        if (pedido.estado === 'pendiente') {
          idsConocidos.add(pedido.id);
        }
      });
      esPrimerCarga = false;
    }
    
    if (hayNuevoPedido && sonidoHabilitado) {
      reproducirSonidoNotificacion();
    }
    
    pedidosPendientes = nuevosPedidos;
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
  
  document.getElementById('btnSoundToggle')?.addEventListener('click', () => {
    sonidoHabilitado = !sonidoHabilitado;
    const icon = document.querySelector('#btnSoundToggle i');
    if (sonidoHabilitado) {
      if (icon) {
        icon.className = 'fas fa-volume-up';
      }
      mostrarToast('Sonido de notificaciones activado', 'success');
      reproducirSonidoNotificacion();
    } else {
      if (icon) {
        icon.className = 'fas fa-volume-mute';
      }
      mostrarToast('Sonido de notificaciones silenciado', 'info');
    }
  });

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