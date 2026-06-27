const { db } = require('../firebaseAdmin');

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const LOCAL_LAT = -34.6326;
const LOCAL_LNG = -58.4203;

function isStoreOpen() {
  const now = new Date();
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric'
    });
    
    const parts = formatter.formatToParts(now);
    const getVal = (type) => parts.find(p => p.type === type).value;
    
    const weekday = getVal('weekday');
    const hour = parseInt(getVal('hour'), 10);
    const minute = parseInt(getVal('minute'), 10);
    
    const timeInMinutes = hour * 60 + minute;
    const weekdayLower = weekday.toLowerCase();
    
    // Martes a Viernes: 17:30 - 23:50
    if (['tuesday', 'wednesday', 'thursday', 'friday'].includes(weekdayLower)) {
      const openTime = 17 * 60 + 30;
      const closeTime = 23 * 60 + 50;
      return timeInMinutes >= openTime && timeInMinutes <= closeTime;
    }
    
    // Sábados y Domingos: 18:00 - 23:50
    if (['saturday', 'sunday'].includes(weekdayLower)) {
      const openTime = 18 * 60;
      const closeTime = 23 * 60 + 50;
      return timeInMinutes >= openTime && timeInMinutes <= closeTime;
    }
  } catch (error) {
    console.error('Error formatting time in America/Argentina/Buenos_Aires:', error);
    // Fallback: If timezone format fails, allow order (better to serve customer than to block due to node discrepancy)
    return true;
  }
  
  return false;
}

function generarComanda(pedido) {
  const fecha = new Date().toLocaleString();
  const lineas = [];
  
  lineas.push('================================');
  lineas.push('     EL GUSTITO BURGER');
  lineas.push('================================');
  lineas.push(`Pedido: #${pedido.id}`);
  lineas.push(`Fecha: ${fecha}`);
  lineas.push(`Cliente: ${pedido.cliente.nombre || 'Mostrador'}`);
  if (pedido.cliente.telefono) lineas.push(`Tel: ${pedido.cliente.telefono}`);
  lineas.push('--------------------------------');
  
  for (const item of pedido.items) {
    const nombre = item.nombre.padEnd(25, ' ');
    const precio = `$${item.precio * item.cantidad}`.padStart(10, ' ');
    lineas.push(`${item.cantidad}x ${nombre} ${precio}`);
  }
  
  lineas.push('--------------------------------');
  lineas.push(`Total: ${'$' + pedido.total.toString().padStart(30, ' ')}`);
  lineas.push('================================');
  lineas.push('¡Gracias por elegirnos!');
  lineas.push('================================');
  lineas.push('\n\n\n');
  
  return lineas.join('\n');
}

async function descontarStockDeItems(items, orderId, uid, batch) {
  for (const item of items) {
    const recetaSnap = await db.collection('recetas').doc(item.producto_id).get();
    if (recetaSnap.exists) {
      const receta = recetaSnap.data();
      for (const ing of receta.ingredientes) {
        const ingRef = db.collection('ingredientes').doc(ing.ingrediente_id);
        const ingSnap = await ingRef.get();
        if (ingSnap.exists) {
          const nuevoStock = ingSnap.data().stock_actual - (ing.cantidad * item.cantidad);
          batch.update(ingRef, { stock_actual: nuevoStock, ultima_actualizacion: new Date() });
          
          const movimientoRef = db.collection('movimientos_stock').doc();
          batch.set(movimientoRef, {
            ingrediente_id: ing.ingrediente_id,
            tipo: 'salida',
            cantidad: ing.cantidad * item.cantidad,
            motivo: `Pedido #${orderId}`,
            fecha: new Date(),
            usuario: uid || 'sistema'
          });
        }
      }
    }
  }
}

exports.createOrder = async (req, res) => {
  const { items, total, direccion, lat, lng, metodoPago, cliente } = req.body;
  const uid = req.user.uid;

  try {
    if (lat && lng) {
      const distancia = calcularDistanciaKm(LOCAL_LAT, LOCAL_LNG, lat, lng);
      if (distancia > 3) {
        return res.status(400).json({ 
          mensaje: `No hacemos delivery a más de 3km. Distancia: ${distancia.toFixed(1)}km`,
          distancia
        });
      }
    }

    for (const item of items) {
      const recetaSnap = await db.collection('recetas').doc(item.producto_id).get();
      if (recetaSnap.exists) {
        const receta = recetaSnap.data();
        for (const ing of receta.ingredientes) {
          const ingSnap = await db.collection('ingredientes').doc(ing.ingrediente_id).get();
          const stockActual = ingSnap.data().stock_actual;
          const necesario = ing.cantidad * item.cantidad;
          if (stockActual < necesario) {
            return res.status(400).json({ 
              mensaje: `Stock insuficiente de ${ingSnap.data().nombre}`,
              ingrediente: ing.ingrediente_id,
            });
          }
        }
      }
    }

    const orderId = Date.now().toString();
    
    const pedido = {
      id: orderId,
      uid,
      cliente: cliente || { nombre: 'Mostrador', telefono: '' },
      items,
      total,
      direccion: direccion || 'Local - Mostrador',
      ubicacion: lat && lng ? { lat, lng } : null,
      distancia: lat && lng ? calcularDistanciaKm(LOCAL_LAT, LOCAL_LNG, lat, lng) : 0,
      metodoPago: metodoPago || 'efectivo',
      estado: 'pendiente',
      stockDescontado: true,
      createdAt: new Date()
    };

    const batch = db.batch();

    await descontarStockDeItems(items, orderId, uid, batch);
    
    const pedidoRef = db.collection('pedidos').doc(orderId);
    batch.set(pedidoRef, pedido);

    await batch.commit();

    const comanda = generarComanda(pedido);

    res.status(201).json({ 
      mensaje: 'Pedido creado exitosamente', 
      pedido,
      comanda
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  console.log('🔍 getPendingOrders llamado');
  try {
    console.log('📡 Consultando Firestore...');
    const snapshot = await db.collection('pedidos')
      .where('estado', 'in', ['pendiente', 'preparando'])
      .orderBy('createdAt', 'asc')
      .get();
    
    console.log(`✅ Encontrados ${snapshot.size} pedidos`);
    const pedidos = [];
    snapshot.forEach(doc => pedidos.push({ id: doc.id, ...doc.data() }));
    res.json(pedidos);
  } catch (error) {
    console.error('❌ ERROR en getPendingOrders:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.marcarListo = async (req, res) => {
  const { id } = req.params;
  const uid = req.user.uid;
  
  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();
    const rol = userDoc.data().rol;
    
    if (rol !== 'cajero' && rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tenés permiso para marcar pedidos como listos' });
    }
    
    const docRef = db.collection('pedidos').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    const pedido = doc.data();
    const updates = { 
      estado: 'listo',
      listoAt: new Date(),
      marcadoPor: uid
    };
    
    const batch = db.batch();
    
    // Si el pedido no está registrado en caja y pasa a listo
    if (!pedido.registradoEnCaja) {
      const { registrarVenta } = require('./cashController');
      try {
        await registrarVenta(pedido);
        updates.registradoEnCaja = true;
      } catch (err) {
        console.error('Error al registrar venta desde marcarListo:', err);
      }
    }
    
    // Si el stock no ha sido descontado
    if (!pedido.stockDescontado) {
      await descontarStockDeItems(pedido.items, id, uid, batch);
      updates.stockDescontado = true;
    }
    
    batch.update(docRef, updates);
    await batch.commit();
    
    res.json({ mensaje: `Pedido #${id} marcado como listo` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const uid = req.user ? req.user.uid : 'sistema';
  
  try {
    const docRef = db.collection('pedidos').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    const pedido = doc.data();
    const updates = { estado, updatedAt: new Date() };
    const batch = db.batch();
    
    // Si el pedido no está registrado en caja y está pasando a un estado aceptado/activo
    if (!pedido.registradoEnCaja && ['preparando', 'listo', 'en_camino', 'entregado'].includes(estado)) {
      const { registrarVenta } = require('./cashController');
      try {
        await registrarVenta(pedido);
        updates.registradoEnCaja = true;
      } catch (err) {
        console.error('Error al registrar venta desde cambio de estado:', err);
      }
    }
    
    // Si el stock no ha sido descontado y pasa a un estado aceptado/activo
    if (!pedido.stockDescontado && ['preparando', 'listo', 'en_camino', 'entregado'].includes(estado)) {
      await descontarStockDeItems(pedido.items, id, uid, batch);
      updates.stockDescontado = true;
    }
    
    batch.update(docRef, updates);
    await batch.commit();
    
    if (estado === 'en_camino' || estado === 'listo') {
      setTimeout(async () => {
        try {
          const checkDoc = await docRef.get();
          if (checkDoc.exists && (checkDoc.data().estado === 'en_camino' || checkDoc.data().estado === 'listo')) {
            await docRef.update({ 
              estado: 'entregado', 
              updatedAt: new Date(),
              completadoAutomaticamente: true 
            });
            console.log(`[Timer] Pedido #${id} marcado automáticamente como 'entregado' tras 5 minutos.`);
          }
        } catch (err) {
          console.error(`[Timer Error] No se pudo entregar automáticamente el pedido #${id}:`, err);
        }
      }, 5 * 60 * 1000); // 5 minutos (5 * 60 * 1000 ms)
    }

    res.json({ mensaje: `Pedido ${id} actualizado a ${estado}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrdersByDate = async (req, res) => {
  const { fecha } = req.params;
  try {
    const startDate = new Date(`${fecha}T00:00:00.000-03:00`);
    const endDate = new Date(`${fecha}T23:59:59.999-03:00`);
    
    const snapshot = await db.collection('pedidos')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();
    
    const pedidos = [];
    snapshot.forEach(doc => pedidos.push({ id: doc.id, ...doc.data() }));
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPublicOrder = async (req, res) => {
  const { items, total, cliente, notas, metodoPago } = req.body;

  try {
    if (!isStoreOpen()) {
      return res.status(400).json({ 
        mensaje: 'El local se encuentra cerrado. Horarios de atención: Martes a Viernes 17:30 a 23:50 hs, Sábados y Domingos 18:00 a 23:50 hs.' 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ mensaje: 'El pedido debe tener al menos un producto' });
    }

    if (!cliente?.nombre || !cliente?.telefono) {
      return res.status(400).json({ mensaje: 'Nombre y teléfono son obligatorios' });
    }

    const orderId = Date.now().toString();

    const pedido = {
      id: orderId,
      cliente: {
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion || '',
        referencia: cliente.referencia || ''
      },
      items: items.map(item => ({
        producto_id: item.producto_id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      total,
      notas: notas || '',
      metodoPago: metodoPago || 'efectivo',
      estado: 'pendiente',
      fuente: 'web_cliente',
      createdAt: new Date()
    };

    await db.collection('pedidos').doc(orderId).set(pedido);

    res.status(201).json({
      mensaje: 'Pedido recibido. En breve un cajero lo confirmará.',
      pedidoId: orderId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getPublicOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('pedidos').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    res.json(doc.data());
  } catch (error) {
    console.error('Error al obtener pedido público:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStoreStatus = (req, res) => {
  res.json({ open: isStoreOpen() });
};

exports.createCajaOrder = async (req, res) => {
  const { items, total, cliente, metodoPago, notas } = req.body;
  const uid = req.user.uid;

  try {
    if (!items || items.length === 0) {
      return res.status(400).json({ mensaje: 'El pedido debe tener al menos un producto' });
    }

    const userDoc = await db.collection('usuarios').doc(uid).get();
    const rol = userDoc.data().rol;
    if (rol !== 'cajero' && rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tenés permiso para crear pedidos desde caja' });
    }

    const orderId = Date.now().toString();

    const pedido = {
      id: orderId,
      cajero: uid,
      cliente: {
        nombre: cliente?.nombre || 'Mostrador',
        telefono: cliente?.telefono || '',
        direccion: cliente?.direccion || 'Mostrador'
      },
      items: items.map(item => ({
        producto_id: item.producto_id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      total,
      notas: notas || '',
      metodoPago: metodoPago || 'efectivo',
      estado: 'pendiente',
      fuente: 'caja',
      registradoEnCaja: true,
      stockDescontado: true,
      createdAt: new Date()
    };

    const batch = db.batch();

    // Descontar stock inmediatamente para compras de mostrador
    await descontarStockDeItems(pedido.items, orderId, uid, batch);

    const pedidoRef = db.collection('pedidos').doc(orderId);
    batch.set(pedidoRef, pedido);

    await batch.commit();

    const comanda = generarComanda(pedido);

    const { registrarVenta } = require('./cashController');
    
    await registrarVenta(pedido);

    res.status(201).json({
      mensaje: 'Pedido creado desde caja',
      pedidoId: orderId,
      pedido,
      comanda
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPedidosListos = async (req, res) => {
  try {
    const snapshotListo = await db.collection('pedidos')
      .where('estado', '==', 'listo')
      .get();
      
    const snapshotEnCamino = await db.collection('pedidos')
      .where('estado', '==', 'en_camino')
      .get();

    const pedidos = [];
    snapshotListo.forEach(doc => pedidos.push({ id: doc.id, ...doc.data() }));
    snapshotEnCamino.forEach(doc => pedidos.push({ id: doc.id, ...doc.data() }));

    pedidos.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json(pedidos);
  } catch (error) {
    console.error('Error en getPedidosListos:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getHistorialCaja = async (req, res) => {
  const { fecha } = req.query;

  try {
    let dateStr = fecha;
    if (!dateStr) {
      const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' };
      const formatter = new Intl.DateTimeFormat('fr-CA', options);
      dateStr = formatter.format(new Date());
    }

    const startDate = new Date(`${dateStr}T00:00:00.000-03:00`);
    const endDate = new Date(`${dateStr}T23:59:59.999-03:00`);

    const snapshot = await db.collection('pedidos')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .orderBy('createdAt', 'desc')
      .get();

    const pedidos = [];
    snapshot.forEach(doc => pedidos.push({ id: doc.id, ...doc.data() }));
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};