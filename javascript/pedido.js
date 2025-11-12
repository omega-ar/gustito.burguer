document.addEventListener('DOMContentLoaded', function() {
  console.log('pedido.js cargado correctamente');
  
  let carrito = [];
  const listaProductos = document.getElementById('listaProductos');
  const resumenProductos = document.getElementById('resumenProductos');
  const totalPedido = document.getElementById('totalPedido');
  const resumenTotal = document.getElementById('resumenTotal');
  const formPedido = document.getElementById('formPedido');
  const modal = document.getElementById('modalConfirmacion');
  const closeModal = document.querySelector('.close-modal');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  
  function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('gustitoCarrito');
    console.log('Carrito cargado:', carritoGuardado);
    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
    }
    actualizarInterfazPedido();
  }
  
  function actualizarInterfazPedido() {
    console.log('Actualizando interfaz, productos:', carrito.length);
    listaProductos.innerHTML = '';
    resumenProductos.innerHTML = '';
    
    let total = 0;
    
    if (carrito.length === 0) {
      listaProductos.innerHTML = '<p class="mensaje-vacio">No hay productos en tu carrito. <a href="index.html">Volver al menú</a></p>';
      resumenProductos.innerHTML = '<p class="mensaje-vacio">No hay productos seleccionados</p>';
    } else {
      carrito.forEach((producto, index) => {
        const productoTotal = producto.precio * producto.cantidad;
        total += productoTotal;
        
        const productoElement = document.createElement('div');
        productoElement.className = 'producto-pedido';
        productoElement.innerHTML = `
          <div class="producto-info">
            <h4>${producto.nombre}</h4>
            <span class="precio-unitario">$${producto.precio.toLocaleString()} c/u</span>
          </div>
          <div class="producto-cantidad">
            <button class="btn-cantidad" data-index="${index}" data-accion="restar">-</button>
            <span class="cantidad">${producto.cantidad}</span>
            <button class="btn-cantidad" data-index="${index}" data-accion="sumar">+</button>
            <button class="btn-eliminar" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="producto-total">
            $${productoTotal.toLocaleString()}
          </div>
        `;
        
        listaProductos.appendChild(productoElement);
        
        const resumenElement = document.createElement('div');
        resumenElement.className = 'resumen-item';
        resumenElement.innerHTML = `
          <span>${producto.nombre} x${producto.cantidad}</span>
          <span>$${productoTotal.toLocaleString()}</span>
        `;
        resumenProductos.appendChild(resumenElement);
      });
      
      document.querySelectorAll('.btn-cantidad').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          const accion = this.getAttribute('data-accion');
          
          if (accion === 'sumar') {
            carrito[index].cantidad += 1;
          } else if (accion === 'restar' && carrito[index].cantidad > 1) {
            carrito[index].cantidad -= 1;
          }
          
          guardarCarrito();
          actualizarInterfazPedido();
        });
      });
      
      document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
          const index = parseInt(this.getAttribute('data-index'));
          carrito.splice(index, 1);
          guardarCarrito();
          actualizarInterfazPedido();
        });
      });
    }
    
    totalPedido.textContent = total.toLocaleString();
    resumenTotal.textContent = total.toLocaleString();
  }
  
  function guardarCarrito() {
    localStorage.setItem('gustitoCarrito', JSON.stringify(carrito));
    console.log('Carrito guardado:', carrito);
  }
  
  function enviarWhatsApp() {
    console.log('Enviando WhatsApp...');
    if (carrito.length === 0) {
      alert('Por favor, agrega al menos un producto a tu pedido.');
      return false;
    }

    const nombre = document.getElementById('nombre').value || 'No especificado';
    const direccion = document.getElementById('direccion').value || 'No especificada';
    const telefono = document.getElementById('telefono').value || 'No especificado';
    const notas = document.getElementById('notas').value || 'Ninguna';
    const metodoPago = document.getElementById('metodoPago').value || 'No especificado';

    const total = carrito.reduce((sum, producto) => sum + (producto.precio * producto.cantidad), 0);

    let mensaje = `*🍔 NUEVO PEDIDO - EL GUSTITO*%0A%0A`;
    mensaje += `*👤 Cliente:* ${nombre}%0A`;
    mensaje += `*📞 Teléfono:* ${telefono}%0A`;
    mensaje += `*🏠 Dirección:* ${direccion}%0A%0A`;
    mensaje += `*📦 PEDIDO:*%0A`;

    carrito.forEach(producto => {
      mensaje += `• ${producto.nombre} x${producto.cantidad} - $${(producto.precio * producto.cantidad).toLocaleString()}%0A`;
    });

    mensaje += `%0A*💰 TOTAL: $${total.toLocaleString()}*%0A`;
    mensaje += `*💳 Método de Pago:* ${metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}%0A`;
    mensaje += `*📝 Notas:* ${notas}%0A%0A`;
    mensaje += `*🕒 Horario:* ${new Date().toLocaleString('es-ES')}`;

    const numeroWhatsApp = '5491122750551';
    const whatsappUrl = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
    
    console.log('Abriendo WhatsApp:', whatsappUrl);
    window.open(whatsappUrl, '_blank');

    carrito = [];
    guardarCarrito();
    actualizarInterfazPedido();

    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.style.display = 'none';
      }, 3000);
    }
    
    return false; // Prevenir refresh
  }

  function confirmarPedido(e) {
    console.log('Confirmando pedido...');
    e.preventDefault();
    enviarWhatsApp();
  }

  function cerrarModal() {
    console.log('Cerrando modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Inicializar
  if (formPedido) {
    formPedido.addEventListener('submit', confirmarPedido);
    console.log('Event listener agregado al formulario');
  }
  if (closeModal) closeModal.addEventListener('click', cerrarModal);
  if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);

  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  cargarCarrito();
  console.log('pedido.js inicializado completamente');
});