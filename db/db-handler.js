const Libro = require('./model');
const { Op } = require('sequelize');

async function getAll(req, res) {
    try {
        const data = await Libro.findAll()
        res.status(200).json(data)
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getById(req) {
    try {
        const data = await Libro.findByPk(req.params.id)
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

async function create(req) {
    try {
        await Libro.create(req.body)
        res.status(200).json({ "status": "ok" })
    } catch (e) {
        console.error("Error creating data:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function update(req, res) {
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
    try {
        const {titulo, autor, categoria, exclusivo} = req.body.query;
        const conditions = []

        if (titulo) conditions.push({[Op.like]: {titulo: `%${titulo}%`}})
        if (autor) conditions.push({[Op.like]: {autor: `%${autor}%`}})
        if (categoria) conditions.push({[Op.like]: {categoria: `%${categoria}%`}})

        let libros = []
        if (exclusivo || false) {
            libros = await Libro.findAll({where: {[Op.and]: conditions}})
        } else {
            libros = await Libro.findAll({where: {[Op.or]: conditions}})
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