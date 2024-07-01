const express = require('express');
const morgan = require('morgan');
const routes = require('./src/routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(express.json());
app.use('/joyas', routes);

app.listen(port, () => {
  console.log(`Servidor encendido http://localhost:${port}`);
});



//link de postman http://localhost:3000/joyas?limits=3&page=2&order_by=stock_ASC
