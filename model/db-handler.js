const { Libro } = require('./model');
const { Op, or } = require('sequelize');

function parsing(data, req) {
    let newData = data
    // Ordenamiento
    let factor
    if (req.query.orden) {
        factor = req.query.orden
        if (factor !== "titulo" && factor !== "autor" && factor !== "isbn" && factor !== "categoria" && factor !== "estado") {
            return data;
        }
    }

    console.log(factor)

    newData = data.sort((a, b) => {
        if (a[factor] < b[factor]) {
            return -1;
        }
        if (a[factor] > b[factor]) {
            return 1;
        }
        return 0;
    })

    // Paginacion
    const page = Number(req.query.pagina) || 0
    const num = Number(req.query.limite) || null
    if (!num) return newData

    return newData.slice(page * num, page * num + num); // Retorna un array vacio si hay algo mal en los parametros metidos
}

function validate(data, allData = false) {
    const { titulo, autor, isbn, categoria, estado, orden } = data;
    let errors = "";

    if (allData) {
        if (!titulo) errors += "Falta el titulo\n";
        if (!autor) errors += "Falta el autor\n";
        if (!isbn) errors += "Falta el isbn\n";
        if (!categoria) errors += "Falta la categoria\n";
        if (!estado) errors += "Falta el estado\n";
    }

    if (titulo && titulo.length > 255) errors += "El titulo es muy largo\n";
    if (autor && autor.length > 255) errors += "El autor es muy largo\n";
    if (isbn && isbn.length > 13) errors += "El isbn es muy largo\n";
    if (categoria && categoria.length > 100) errors += "La categoria es muy larga\n";
    if (estado && estado.length > 50) errors += "El estado es muy largo\n";

    return errors;
}

async function getAll(req, res) {
    try {
        const data = await Libro.findAll();
        res.status(200).json(parsing(data, req));
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getById(req, res) {
    try {
        const data = await Libro.findByPk(req.params.id);
        if (!data) {
            res.status(404).json({ error: "Libro no encontrado" });
        } else {
            res.status(200).json(data);
        }
    } catch (e) {
        console.error("Error fetching data:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function create(req, res) {
    try {
      // Validación básica de campos
      const fieldErrors = validate(req.body, true);
      if (fieldErrors.length) {
        return res.status(400).json({ errors: fieldErrors });
      }
  
      const { id, isbn } = req.body;
  
      // Verificar si el ID ya existe
      if (id) {
        const existsById = await Libro.findByPk(id);
        if (existsById) {
          return res.status(400).json({ errors: ['El ID ya existe. Usa un ID único.'] });
        }
      }
  
      // Verificar si el ISBN ya existe
      const existsByIsbn = await Libro.findOne({ where: { isbn } });
      if (existsByIsbn) {
        return res.status(400).json({ errors: ['El ISBN ya está registrado. Debe ser único.'] });
      }
  
      // Crear registro
      const nuevo = await Libro.create(req.body);
      return res.status(201).json(nuevo);
  
    } catch (err) {
      console.error('Error creando libro:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

async function update(req, res) {
    // Validate provided data (partial allowed)
    const errors = validate(req.body, false);
    if (errors) {
        return res.status(400).json({ error: errors });
    }
    try {
        const libro = await Libro.findByPk(req.params.id);
        if (!libro) {
            res.status(404).json({ error: "Libro no encontrado" });
        } else {
            await libro.update(req.body);
            res.status(200).json({ status: "ok" });
        }
    } catch (e) {
        console.error("Error updating data:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function remove(req, res) {
    try {
        const libro = await Libro.findByPk(req.params.id);
        if (!libro) {
            res.status(404).json({ error: "Libro no encontrado" });
        } else {
            await libro.destroy();
            res.status(200).json({ status: "ok" });
        }
    } catch (e) {
        console.error("Error deleting data:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function search(req, res) {
    // Validate the search query object; since it's used for filtering, allow partial fields
    const errors = validate(req.query, false);
    if (errors) {
        return res.status(400).json({ error: errors });
    }
    try {
        const { titulo, autor, categoria, exclusivo, isbn, estado } = req.query;
        const conditions = [];

        if (titulo) conditions.push({ titulo: { [Op.like]: `%${titulo}%` } });
        if (autor) conditions.push({ autor: { [Op.like]: `%${autor}%` } });
        if (categoria) conditions.push({ categoria: { [Op.like]: `%${categoria}%` } });
        if (isbn) conditions.push({ isbn: { [Op.like]: `%${isbn}%` } });
        if (estado) conditions.push({ estado: { [Op.like]: `%${estado}%` } });

        let libros = [];
        if (exclusivo === "true") {
            libros = await Libro.findAll({ where: { [Op.and]: conditions } });
        } else {
            libros = await Libro.findAll({ where: { [Op.or]: conditions } });
        }

        if (libros.length === 0) {
            res.status(404).json({ error: "No se encontraron libros" });
        } else {
            res.status(200).json(parsing(libros, req));
        }
    } catch (e) {
        console.error("Error searching data:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    search
};