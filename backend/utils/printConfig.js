const PRINT_CONFIG = {
  paperWidth: '80mm',
  
  getStyles: function() {
    return `
      <style>
        @page {
          size: ${this.paperWidth} auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: ${this.paperWidth === 'A4' ? '210mm' : this.paperWidth};
          margin: 0;
          padding: 4px;
        }
        .comanda-header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .comanda-header h2 {
          font-size: 16px;
          margin: 0;
        }
        .comanda-info {
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        .comanda-info p {
          margin: 2px 0;
        }
        .comanda-items {
          margin-bottom: 8px;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .item-nombre {
          flex: 1;
        }
        .item-precio {
          text-align: right;
          min-width: 60px;
        }
        .comanda-total {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 14px;
          margin-top: 4px;
        }
        .comanda-footer {
          text-align: center;
          margin-top: 8px;
          font-size: 11px;
          border-top: 1px dashed #000;
          padding-top: 8px;
        }
        .no-print {
          display: none;
        }
      </style>
    `;
  },

  generateHTML: function(pedido) {
    const fecha = new Date().toLocaleString('es-AR');
    const itemsHTML = pedido.items.map(item => `
      <div class="item-row">
        <span class="item-nombre">${item.cantidad}x ${item.nombre}</span>
        <span class="item-precio">$${(item.precio * item.cantidad).toLocaleString()}</span>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getStyles()}
      </head>
      <body>
        <div class="comanda-header">
          <h2>🍔 EL GUSTITO</h2>
          <p>Hamburguesas Artesanales</p>
        </div>

        <div class="comanda-info">
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

        <div class="comanda-items">
          ${itemsHTML}
        </div>

        <div class="comanda-total">
          <span>TOTAL:</span>
          <span>$${pedido.total?.toLocaleString()}</span>
        </div>

        ${pedido.notas ? `<p><strong>Notas:</strong> ${pedido.notas}</p>` : ''}

        <div class="comanda-footer">
          <p>¡Gracias por elegirnos!</p>
          <p>Sánchez de Loria 633, CABA</p>
        </div>
      </body>
      </html>
    `;
  }
};

module.exports = PRINT_CONFIG;