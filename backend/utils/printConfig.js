const PRINT_CONFIG = {
  paperWidth: '80mm',
  printableWidth: '67mm',
  
  getStyles: function() {
    return `
      <style>
        @page {
          size: ${this.paperWidth} auto;
          margin: 0;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
          color: #000;
          width: ${this.printableWidth};
          max-width: ${this.printableWidth};
          margin: 0;
          padding: 2px 4px;
          line-height: 1.3;
          background: #fff;
        }
        .comanda-header {
          text-align: center;
          border-bottom: 2px dashed #000;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        .comanda-header h2 {
          font-size: 15px;
          font-weight: 900;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .comanda-header p {
          font-size: 11px;
          margin: 2px 0 0 0;
        }
        .comanda-info {
          margin-bottom: 5px;
          border-bottom: 1px dashed #000;
          padding-bottom: 5px;
          font-size: 11px;
        }
        .comanda-info p {
          margin: 2px 0;
        }
        .comanda-items {
          margin-bottom: 6px;
          border-bottom: 2px dashed #000;
          padding-bottom: 5px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin: 3px 0;
          padding-bottom: 2px;
          border-bottom: 1px dotted #ccc;
          font-size: 13px;
          font-weight: bold;
        }
        .item-row:last-child {
          border-bottom: none;
        }
        .item-nombre {
          flex: 1;
          padding-right: 6px;
        }
        .item-subtotal {
          text-align: right;
          white-space: nowrap;
          font-weight: 900;
        }
        .comanda-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 900;
          font-size: 15px;
          margin: 8px 0;
          padding: 6px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        .comanda-notas {
          font-size: 11px;
          margin: 4px 0;
          padding: 3px;
          background: #eee;
          border-left: 2px solid #000;
        }
        .comanda-footer {
          text-align: center;
          margin-top: 6px;
          font-size: 11px;
          padding-top: 4px;
        }
        .paper-feed-spacer {
          height: 25mm;
          line-height: 25mm;
          font-size: 1px;
          color: transparent;
        }
        .no-print {
          display: none;
        }
      </style>
    `;
  },

  generateHTML: function(pedido) {
    const fecha = new Date().toLocaleString('es-AR');
    const itemsHTML = (pedido.items || []).map(item => {
      const subtotal = (item.precio || 0) * (item.cantidad || 1);
      return `
        <div class="item-row">
          <span class="item-nombre">${item.cantidad}x ${item.nombre}</span>
          <span class="item-subtotal">$${subtotal.toLocaleString('es-AR')}</span>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Comanda #${pedido.id}</title>
        ${this.getStyles()}
      </head>
      <body>
        <div class="comanda-header">
          <h2>🍔 EL GUSTITO</h2>
          <p>Hamburguesas Artesanales</p>
        </div>

        <div class="comanda-info">
          <p><strong>Pedido: #${pedido.id}</strong></p>
          <p>Fecha: ${fecha}</p>
          <p>Cliente: ${pedido.cliente?.nombre || 'Mostrador'}</p>
          ${pedido.cliente?.telefono ? `<p>Tel: ${pedido.cliente.telefono}</p>` : ''}
          ${pedido.cliente?.direccion && pedido.cliente.direccion !== 'Mostrador' 
            ? `<p>Dir: ${pedido.cliente.direccion}</p>` : ''}
          ${pedido.cliente?.referencia ? `<p>Ref: ${pedido.cliente.referencia}</p>` : ''}
          <p>Pago: ${pedido.metodoPago === 'efectivo' ? '💵 Efectivo' : '📲 Transferencia'}</p>
          <p>Fuente: ${pedido.fuente === 'caja' ? '🏪 Mostrador' : '🌐 Web'}</p>
        </div>

        <div class="comanda-items">
          ${itemsHTML}
        </div>

        <div class="comanda-total">
          <span>TOTAL A PAGAR:</span>
          <span>$${(pedido.total || 0).toLocaleString('es-AR')}</span>
        </div>

        ${pedido.notas ? `<div class="comanda-notas"><strong>Notas:</strong> ${pedido.notas}</div>` : ''}

        <div class="comanda-footer">
          <p>¡Gracias por elegirnos!</p>
          <p>Sánchez de Loria 633, CABA</p>
        </div>

        <div class="paper-feed-spacer">.</div>
      </body>
      </html>
    `;
  }
};

module.exports = PRINT_CONFIG;