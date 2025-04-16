const Libro = require('./model');
const { Op } = require('sequelize');

function validate(data, allData = false) {
    const { titulo, autor, isbn, categoria, estado } = data;
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
        res.status(200).json(data);
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
    // Validate all required fields
    const errors = validate(req.body, true);
    if (errors) {
        return res.status(400).json({ error: errors });
    }

    // Check if an 'id' is provided and if it is unique
    if (req.body.id) {
        try {
            const existingLibro = await Libro.findByPk(req.body.id);
            if (existingLibro) {
                return res.status(400).json({ error: "El id ya existe. Por favor, usa un id único." });
            }
        } catch (checkError) {
            console.error("Error checking id uniqueness:", checkError);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    try {
        await Libro.create(req.body);
        res.status(200).json({ status: "ok" });
    } catch (e) {
        console.error("Error creating data:", e);
        res.status(500).json({ error: "Internal Server Error" });
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
    const errors = validate(req.body.query, false);
    if (errors) {
        return res.status(400).json({ error: errors });
    }
    try {
        const { titulo, autor, categoria, exclusivo } = req.body.query;
        const conditions = [];

        if (titulo) conditions.push({ titulo: { [Op.like]: `%${titulo}%` } });
        if (autor) conditions.push({ autor: { [Op.like]: `%${autor}%` } });
        if (categoria) conditions.push({ categoria: { [Op.like]: `%${categoria}%` } });

        let libros = [];
        if (exclusivo) {
            libros = await Libro.findAll({ where: { [Op.and]: conditions } });
        } else {
            libros = await Libro.findAll({ where: { [Op.or]: conditions } });
        }

        if (libros.length === 0) {
            res.status(404).json({ error: "No se encontraron libros" });
        } else {
            res.status(200).json(libros);
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