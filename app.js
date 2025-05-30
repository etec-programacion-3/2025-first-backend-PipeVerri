const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

// Import the controller functions
const {
  getAll,
  getById,
  create,
  update,
  remove,
  search
} = require('./db/db-handler');
const { Database } = require('./db/model');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Buscar libros (parámetros: titulo, autor, categoria)
app.get('/libros/buscar', search);

// Listar todos los libros
app.get('/libros', getAll);

// Obtener un libro específico (parámetro: id)
app.get('/libros/:id', getById);

// Crear un nuevo libro (body: titulo, autor, categoria)
app.post('/libros', create);

// Actualizar un libro (parámetro: id, body: titulo, autor, categoria)
app.put('/libros/:id', update);

// Eliminar un libro (parámetro: id)
app.delete('/libros/:id', remove);

// Inicializar si no existe y sincronizar la base de datos
Database.sync({ alter: true })   // con `alter: true` Sequelize ajusta tablas sin borrarlas
  .then(() => {
    console.log('✅ Base de datos sincronizada');
    app.listen(3000, () => console.log('Server is listening on port 3000'));
  })
  .catch(err => {
    console.error('❌ Error al sincronizar la base de datos:', err);
  });


// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
