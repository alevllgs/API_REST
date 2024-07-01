const pool = require('./database');

const getJoyas = async (req, res) => {
  try {
    const { limits = 10, page = 1, order_by = 'id_ASC' } = req.query;
    const [column, direction] = order_by.split('_');
    const offset = (page - 1) * limits;
    const query = `
      SELECT * FROM inventario
      ORDER BY ${column} ${direction}
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limits, offset]);

    // Implementar HATEOAS
    const host = req.get('host');
    const url = `${req.protocol}://${host}/joyas`;
    const hateoas = result.rows.map((j) => ({
      ...j,
      links: {
        self: `${url}/${j.id}`,
      },
    }));

    res.json(hateoas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getJoyasByFilters = async (req, res) => {
  try {
    const { precio_max, precio_min, categoria, metal } = req.query;
    const filters = [];
    const values = [];

    if (precio_max) {
      values.push(precio_max);
      filters.push(`precio <= $${values.length}`);
    }

    if (precio_min) {
      values.push(precio_min);
      filters.push(`precio >= $${values.length}`);
    }

    if (categoria) {
      values.push(categoria);
      filters.push(`categoria = $${values.length}`);
    }

    if (metal) {
      values.push(metal);
      filters.push(`metal = $${values.length}`);
    }

    const query = `SELECT * FROM inventario WHERE ${filters.join(' AND ')}`;
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getJoyas, getJoyasByFilters };
