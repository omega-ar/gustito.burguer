const API_URL = window.API_URL || 'http://localhost:8080/api';
let token = null;
let usuario = null;

function verificarAuth() {
  token = localStorage.getItem('token');
  usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  if (!token || usuario.rol !== 'admin') {
    window.location.href = 'login.html';
    return false;
  }
  
  document.getElementById('userName').textContent = usuario.nombre || usuario.email;
  return true;
}

async function cargarStock() {
  try {
    const response = await fetch(`${API_URL}/admin/stock`, {
      headers: { 'x-auth-token': token }
    });
    
    const stock = await response.json();
    mostrarStock(stock);
  } catch (error) {
    mostrarToast('Error al cargar stock', 'error');
  }
}

function mostrarStock(stock) {
  const tbody = document.getElementById('stockTableBody');
  
  tbody.innerHTML = stock.map(ing => `
    <tr class="${ing.alerta ? 'alerta-stock' : ''}">
      <td>${ing.nombre}</td>
      <td>${ing.stock_actual} ${ing.unidad}</td>
      <td>${ing.stock_minimo} ${ing.unidad}</td>
      <td>${ing.alerta ? '<span class="badge-danger">⚠️ Stock Bajo</span>' : '<span class="badge-success">✅ OK</span>'}</td>
      <td><button class="btn-editar" data-id="${ing.id}" data-nombre="${ing.nombre}" data-stock="${ing.stock_actual}"><i class="fas fa-edit"></i> Editar</button></td>
    </tr>
  `).join('');
  
  document.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('editIngredienteId').value = btn.dataset.id;
      document.getElementById('editStock').value = btn.dataset.stock;
      document.getElementById('modalActualizarStock').style.display = 'flex';
    });
  });
}

async function guardarActualizacionStock() {
  const id = document.getElementById('editIngredienteId').value;
  const nuevoStock = parseInt(document.getElementById('editStock').value);
  const motivo = document.getElementById('editMotivo').value || 'Ajuste manual';
  
  try {
    const response = await fetch(`${API_URL}/admin/stock/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ nuevo_stock: nuevoStock, motivo })
    });
    
    if (response.ok) {
      document.getElementById('modalActualizarStock').style.display = 'none';
      document.getElementById('editMotivo').value = '';
      mostrarToast('Stock actualizado', 'success');
      cargarStock();
    }
  } catch (error) {
    mostrarToast('Error al actualizar', 'error');
  }
}

async function cargarAlertas() {
  try {
    const response = await fetch(`${API_URL}/admin/stock/alertas`, {
      headers: { 'x-auth-token': token }
    });
    
    const alertas = await response.json();
    const container = document.getElementById('alertasContainer');
    
    if (alertas.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fas fa-check-circle"></i><p>No hay alertas de stock bajo</p></div>';
    } else {
      container.innerHTML = alertas.map(alerta => `
        <div class="alerta-card">
          <div class="alerta-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="alerta-info">
            <h4>${alerta.nombre}</h4>
            <p>Stock actual: ${alerta.stock_actual} ${alerta.unidad} | Mínimo: ${alerta.stock_minimo}</p>
            <p>Faltante: ${alerta.faltante} ${alerta.unidad}</p>
          </div>
          <button class="btn-comprar" data-id="${alerta.id}"><i class="fas fa-shopping-cart"></i> Comprar</button>
        </div>
      `).join('');
    }
  } catch (error) {
    mostrarToast('Error al cargar alertas', 'error');
  }
}

async function generarReporte() {
  const fecha = document.getElementById('reporteFecha').value || new Date().toISOString().split('T')[0];
  
  try {
    const response = await fetch(`${API_URL}/admin/reportes/diario?fecha=${fecha}`, {
      headers: { 'x-auth-token': token }
    });
    
    const reporte = await response.json();
    const container = document.getElementById('reporteResultado');
    
    container.innerHTML = `
      <div class="reporte-card">
        <h3>Reporte del ${reporte.fecha}</h3>
        <div class="reporte-stats">
          <div class="stat">
            <span class="stat-value">${reporte.totalPedidos}</span>
            <span class="stat-label">Pedidos</span>
          </div>
          <div class="stat">
            <span class="stat-value">$${reporte.totalVentas.toLocaleString()}</span>
            <span class="stat-label">Ventas</span>
          </div>
        </div>
        <h4>Productos más vendidos</h4>
        <div class="productos-vendidos">
          ${Object.entries(reporte.productosVendidos || {}).map(([nombre, cantidad]) => `
            <div class="producto-vendido">
              <span>${nombre}</span>
              <span>${cantidad} unidades</span>
            </div>
          `).join('') || '<p>Sin datos</p>'}
        </div>
      </div>
    `;
  } catch (error) {
    mostrarToast('Error al generar reporte', 'error');
  }
}

function mostrarToast(mensaje, tipo) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = `toast show ${tipo}`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.getElementById('btnActualizarStock')?.addEventListener('click', cargarStock);
document.getElementById('btnGenerarReporte')?.addEventListener('click', generarReporte);
document.getElementById('btnGuardarStock')?.addEventListener('click', guardarActualizacionStock);

document.querySelectorAll('.sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`section${btn.dataset.section.charAt(0).toUpperCase() + btn.dataset.section.slice(1)}`).classList.add('active');
    
    if (btn.dataset.section === 'stock') cargarStock();
    if (btn.dataset.section === 'alertas') cargarAlertas();
  });
});

document.querySelectorAll('.close-modal').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('modalActualizarStock').style.display = 'none';
  });
});

document.getElementById('btnLogout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
});

if (verificarAuth()) {
  cargarStock();
  cargarAlertas();
}