const express = require('express');
const auth = require('../middleware/auth');
const printConfig = require('../utils/printConfig');

const router = express.Router();

router.post('/comanda', auth, (req, res) => {
  const { pedido } = req.body;

  if (!pedido) {
    return res.status(400).json({ mensaje: 'El pedido es requerido para imprimir comanda' });
  }

  try {
    const html = printConfig.generateHTML(pedido);
    res.json({ html });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
