const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Import the controller functions
const {
  getAll,
  getById,
  create,
  update,
  remove,
  search
} = require('./db/db-handler');

// Middleware to parse JSON bodies
app.use(express.json());


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

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
