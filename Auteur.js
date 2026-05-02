const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auteur = sequelize.define('Auteur', {
  auteur_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_complet: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 150]
    }
  },
  biographie: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'auteurs',
  timestamps: false
});

module.exports = Auteur;
