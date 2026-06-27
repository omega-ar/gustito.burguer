const { db } = require('../firebaseAdmin');

exports.getProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('productos').where('activo', '==', true).get();
    const productos = [];
    snapshot.forEach(doc => productos.push({ id: doc.id, ...doc.data() }));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const doc = await db.collection('productos').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addProduct = async (req, res) => {
  const { nombre, precio, categoria, descripcion, activo } = req.body;
  try {
    const id = nombre.toLowerCase().replace(/ /g, '_');
    const newProduct = { id, nombre, precio, categoria, descripcion, activo: true, createdAt: new Date() };
    await db.collection('productos').doc(id).set(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await db.collection('productos').doc(id).update(updates);
    res.json({ mensaje: 'Producto actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await db.collection('productos').doc(req.params.id).update({ activo: false });
    res.json({ mensaje: 'Producto desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};