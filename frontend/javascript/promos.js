/**
 * Utilidades compartidas de precios y promociones (menú, pedido y caja).
 */
(function () {
  const GASEOSAS = ['Coca Cola', 'Fanta', 'Sprite'];

  /** Precio final = precio - descuento fijo ($1000 dobles, $2000 triples). */
  function descuentoProducto(producto) {
    if (!producto || producto.categoria === 'promo') return 0;
    if (Number(producto.descuento) > 0) return Number(producto.descuento);
    // Respaldo: si el producto no trae el campo, se deduce por tipo
    const id = String(producto.id || '');
    if (producto.categoria === 'triple' || id.startsWith('triple_')) return 2000;
    if (producto.categoria === 'doble' || id.startsWith('doble_')) return 1000;
    return 0;
  }

  function precioFinalProducto(producto) {
    return (producto.precio || 0) - descuentoProducto(producto);
  }

  function esPromo(producto) {
    return !!producto && producto.categoria === 'promo';
  }

  /** Clave única de ítem del carrito (misma promo con distintas gaseosas = ítems distintos). */
  function claveItem(item) {
    const gas = Array.isArray(item.gaseosas) ? item.gaseosas.join(',') : '';
    return gas ? `${item.id}|${gas}` : item.id;
  }

  function resumenGaseosas(gaseosas) {
    if (!Array.isArray(gaseosas) || gaseosas.length === 0) return '';
    const cuenta = {};
    gaseosas.forEach((g) => { cuenta[g] = (cuenta[g] || 0) + 1; });
    return Object.entries(cuenta).map(([g, n]) => (n > 1 ? `${n} ${g}` : g)).join(' + ');
  }

  /** Muestra un modal para elegir las gaseosas de una promo. Resuelve con el array o null si cancela. */
  function pedirGaseosas(promo) {
    const cantidad = promo.gaseosas || 1;
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'gaseosa-modal-overlay';
      const selects = Array.from({ length: cantidad }, (_, i) => `
        <label class="gaseosa-label">Gaseosa ${cantidad > 1 ? i + 1 : ''}
          <select class="gaseosa-select">
            ${GASEOSAS.map((g) => `<option value="${g}">${g} 600ml</option>`).join('')}
          </select>
        </label>`).join('');
      overlay.innerHTML = `
        <div class="gaseosa-modal" role="dialog" aria-modal="true">
          <h3>${promo.nombre}</h3>
          <p class="gaseosa-detalle">${promo.descripcion || ''}</p>
          ${selects}
          <div class="gaseosa-actions">
            <button type="button" class="gaseosa-cancel">Cancelar</button>
            <button type="button" class="gaseosa-ok">Agregar</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      const cerrar = (valor) => { overlay.remove(); resolve(valor); };
      overlay.querySelector('.gaseosa-cancel').addEventListener('click', () => cerrar(null));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) cerrar(null); });
      overlay.querySelector('.gaseosa-ok').addEventListener('click', () => {
        cerrar(Array.from(overlay.querySelectorAll('.gaseosa-select')).map((s) => s.value));
      });
    });
  }

  window.GustitoPromos = {
    GASEOSAS,
    descuentoProducto,
    precioFinalProducto,
    esPromo,
    claveItem,
    resumenGaseosas,
    pedirGaseosas
  };
})();
