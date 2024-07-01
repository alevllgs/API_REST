const express = require('express');
const pool = require('./database');
const router = express.Router();

// Middleware para registrar las solicitudes
router.use((req, res, next) => {
  console.log(`Request to: ${req.originalUrl}`);
  next();
});

// Ruta para obtener joyas  HATEOAS
router.get('/', async (req, res) => {
  try {
    const { limits, page, order_by } = req.query;
    const limit = parseInt(limits, 10) || 10;
    const offset = (parseInt(page, 10) - 1) * limit || 0;
    const [orderColumn, orderDirection] = (order_by || 'id_ASC').split('_');

    // Consulta principal con límite y offset
    const result = await pool.query(
      `SELECT * FROM inventario ORDER BY ${orderColumn} ${orderDirection} LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Consulta para obtener el total de joyas 
    const totalResult = await pool.query('SELECT COUNT(*) FROM inventario');
    const totalJoyas = parseInt(totalResult.rows[0].count, 10);

    // Stock total de las joyas devueltas
    const stockTotal = result.rows.reduce((acc, joya) => acc + joya.stock, 0);

    // Respuesta según lo requerido
    const joyas = result.rows.map(joya => ({
      name: joya.nombre,
      href: `/joyas/joya/${joya.id}`
    }));

    res.json({
      totalJoyas: joyas.length,
      stockTotal,
      results: joyas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ruta para filtrar joyas
router.get('/filtros', async (req, res) => {
  try {
    const { precio_min, precio_max, categoria, metal } = req.query;
    const filters = [];
    const values = [];

    if (precio_min) {
      filters.push('precio >= $' + (values.length + 1));
      values.push(precio_min);
    }
    if (precio_max) {
      filters.push('precio <= $' + (values.length + 1));
      values.push(precio_max);
    }
    if (categoria) {
      filters.push('categoria = $' + (values.length + 1));
      values.push(categoria);
    }
    if (metal) {
      filters.push('metal = $' + (values.length + 1));
      values.push(metal);
    }

    const query = `SELECT * FROM inventario ${filters.length ? 'WHERE ' + filters.join(' AND ') : ''}`;
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

