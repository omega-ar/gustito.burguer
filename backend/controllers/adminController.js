const { db } = require('../firebaseAdmin');

exports.getStockActual = async (req, res) => {
  try {
    const snapshot = await db.collection('ingredientes').orderBy('nombre').get();
    const ingredientes = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      ingredientes.push({
        id: doc.id,
        ...data,
        alerta: data.stock_actual <= data.stock_minimo
      });
    });
    res.json(ingredientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarStock = async (req, res) => {
  const { id } = req.params;
  const { nuevo_stock, motivo } = req.body;
  const uid = req.user.uid;

  try {
    const ingRef = db.collection('ingredientes').doc(id);
    const ingSnap = await ingRef.get();
    
    if (!ingSnap.exists) {
      return res.status(404).json({ mensaje: 'Ingrediente no encontrado' });
    }

    const stockAnterior = ingSnap.data().stock_actual;

    await db.runTransaction(async (t) => {
      t.update(ingRef, {
        stock_actual: nuevo_stock,
        ultima_actualizacion: new Date()
      });

      t.set(db.collection('movimientos_stock').doc(), {
        ingrediente_id: id,
        tipo: 'ajuste_manual',
        cantidad: nuevo_stock - stockAnterior,
        stock_anterior: stockAnterior,
        stock_nuevo: nuevo_stock,
        motivo: motivo || 'Ajuste manual',
        fecha: new Date(),
        usuario: uid
      });
    });

    res.json({ mensaje: 'Stock actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registrarCompra = async (req, res) => {
  const { items, proveedor, factura } = req.body;
  const uid = req.user.uid;

  try {
    await db.runTransaction(async (t) => {
      for (const item of items) {
        const ingRef = db.collection('ingredientes').doc(item.ingrediente_id);
        const ingSnap = await t.get(ingRef);
        const nuevoStock = ingSnap.data().stock_actual + item.cantidad;

        t.update(ingRef, {
          stock_actual: nuevoStock,
          ultima_actualizacion: new Date()
        });

        t.set(db.collection('movimientos_stock').doc(), {
          ingrediente_id: item.ingrediente_id,
          tipo: 'compra',
          cantidad: item.cantidad,
          costo_unitario: item.costo_unitario,
          proveedor,
          factura,
          fecha: new Date(),
          usuario: uid
        });
      }
    });

    res.json({ mensaje: 'Compra registrada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlertasStockBajo = async (req, res) => {
  try {
    const snapshot = await db.collection('ingredientes').get();
    const alertas = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.stock_actual <= data.stock_minimo) {
        alertas.push({
          id: doc.id,
          nombre: data.nombre,
          stock_actual: data.stock_actual,
          stock_minimo: data.stock_minimo,
          faltante: data.stock_minimo - data.stock_actual,
          unidad: data.unidad
        });
      }
    });
    
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistorialMovimientos = async (req, res) => {
  const { limite = 50, ingrediente_id } = req.query;

  try {
    let query = db.collection('movimientos_stock')
      .orderBy('fecha', 'desc')
      .limit(parseInt(limite));

    if (ingrediente_id) {
      query = query.where('ingrediente_id', '==', ingrediente_id);
    }

    const snapshot = await query.get();
    const movimientos = [];
    snapshot.forEach(doc => movimientos.push({ id: doc.id, ...doc.data() }));
    
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReporteDiario = async (req, res) => {
  const { fecha } = req.query;
  const fechaObj = fecha ? new Date(fecha) : new Date();
  const startDate = new Date(fechaObj.setHours(0, 0, 0, 0));
  const endDate = new Date(fechaObj.setHours(23, 59, 59, 999));

  try {
    const snapshot = await db.collection('pedidos')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    let totalVentas = 0;
    let totalPedidos = 0;
    const productosVendidos = {};

    snapshot.forEach(doc => {
      const pedido = doc.data();
      totalVentas += pedido.total;
      totalPedidos++;
      
      pedido.items.forEach(item => {
        const nombre = item.nombre;
        productosVendidos[nombre] = (productosVendidos[nombre] || 0) + item.cantidad;
      });
    });

    res.json({
      fecha: startDate.toISOString().split('T')[0],
      totalPedidos,
      totalVentas,
      productosVendidos,
      pedidos: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};