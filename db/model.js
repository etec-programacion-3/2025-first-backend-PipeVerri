const { Sequelize } = require('sequelize');

const Database = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite' // or any path you want for the DB file
});


const Libro = Database.define('Libro', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    autor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isbn: {
      type: DataTypes.STRING(13),
      unique: true,
      allowNull: false
    },
    categoria: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true // Activar los timestamps automáticos
  });

module.exports = Libro;