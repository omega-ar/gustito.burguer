require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./firebaseAdmin');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cashRoutes = require('./routes/cashRoutes');  
const printRoutes = require('./routes/printRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({
    mensaje: '🍔 API El Gustito funcionando correctamente',
    fecha: new Date().toISOString(),
    estado: 'online'
  });
});

app.get('/test-firestore', async (req, res) => {
  try {
    const testRef = db.collection('test').doc('conexion');
    await testRef.set({
      mensaje: 'Conexión exitosa a Firestore',
      fecha: new Date()
    });
    
    const doc = await testRef.get();
    res.json({
      success: true,
      data: doc.data()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cash', cashRoutes);
app.use('/api/print', printRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ═══════════════════════════════════════════
  🍔 EL GUSTITO - BACKEND
  ═══════════════════════════════════════════
  ✅ Servidor corriendo en: http://localhost:${PORT}
  📍 Fecha: ${new Date().toLocaleString()}
  ═══════════════════════════════════════════
  `);
});