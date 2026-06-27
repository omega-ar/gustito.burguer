const { db } = require('../firebaseAdmin');

exports.abrirCaja = async (req, res) => {
  const { montoInicial } = req.body;
  const uid = req.user.uid;

  try {
    const cajaAbiertaQuery = await db.collection('caja')
      .where('cerrado', '==', false)
      .limit(1)
      .get();

    if (!cajaAbiertaQuery.empty) {
      return res.status(400).json({ mensaje: 'Ya hay una caja abierta. Cerrá la actual antes de abrir una nueva.' });
    }

    const turnoId = Date.now().toString();
    const turno = {
      id: turnoId,
      cajeroId: uid,
      cajeroNombre: req.user.email,
      montoInicial: montoInicial || 0,
      montoActual: montoInicial || 0,
      ventasTurno: 0,
      apertura: new Date(),
      cerrado: false,
      movimientos: []
    };

    await db.collection('caja').doc(turnoId).set(turno);

    res.json({
      mensaje: 'Caja abierta correctamente',
      turno
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cerrarCaja = async (req, res) => {
  const { turnoId } = req.body;
  const uid = req.user.uid;

  try {
    const turnoRef = db.collection('caja').doc(turnoId);
    const turnoDoc = await turnoRef.get();

    if (!turnoDoc.exists) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    const turno = turnoDoc.data();

    if (turno.cerrado) {
      return res.status(400).json({ mensaje: 'Esta caja ya estaba cerrada' });
    }

    await turnoRef.update({
      cerrado: true,
      cierre: new Date(),
      cerradoPor: uid
    });

    res.json({
      mensaje: 'Caja cerrada correctamente',
      resumen: {
        montoInicial: turno.montoInicial,
        ventasTurno: turno.ventasTurno,
        montoFinal: turno.montoActual
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEstadoCaja = async (req, res) => {
  try {
    const cajaAbiertaQuery = await db.collection('caja')
      .where('cerrado', '==', false)
      .limit(1)
      .get();

    if (cajaAbiertaQuery.empty) {
      return res.json({
        abierta: false,
        turno: null
      });
    }

    const turnoDoc = cajaAbiertaQuery.docs[0];
    const turno = turnoDoc.data();

    res.json({
      abierta: true,
      turno: {
        id: turnoDoc.id,
        montoInicial: turno.montoInicial,
        ventasTurno: turno.ventasTurno,
        apertura: turno.apertura
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registrarVenta = async (pedido) => {
  try {
    const cajaAbiertaQuery = await db.collection('caja')
      .where('cerrado', '==', false)
      .limit(1)
      .get();

    if (cajaAbiertaQuery.empty) {
      console.log('⚠️ No hay ninguna caja abierta para registrar la venta.');
      return;
    }

    const turnoDoc = cajaAbiertaQuery.docs[0];
    const turnoRef = db.collection('caja').doc(turnoDoc.id);

    await db.runTransaction(async (transaction) => {
      const sfDoc = await transaction.get(turnoRef);
      if (!sfDoc.exists) {
        throw new Error("El turno de caja activo no existe en la base de datos.");
      }

      const turno = sfDoc.data();
      const pedidoTotal = Number(pedido.total || 0);
      const nuevoVentasTurno = (turno.ventasTurno || 0) + pedidoTotal;
      let nuevoMontoActual = (turno.montoActual || 0);

      if (pedido.metodoPago === 'efectivo') {
        nuevoMontoActual += pedidoTotal;
      }

      const movimiento = {
        pedidoId: pedido.id,
        tipo: 'venta',
        monto: pedidoTotal,
        metodoPago: pedido.metodoPago,
        fecha: new Date()
      };

      const nuevosMovimientos = [...(turno.movimientos || []), movimiento];

      transaction.update(turnoRef, {
        ventasTurno: nuevoVentasTurno,
        montoActual: nuevoMontoActual,
        movimientos: nuevosMovimientos
      });
    });

    console.log(`✅ Venta registrada en caja mediante transacción para el pedido #${pedido.id}`);
  } catch (error) {
    console.error('❌ Error al registrar venta en caja:', error);
    throw error;
  }
};