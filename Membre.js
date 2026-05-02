const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membre = sequelize.define('Membre', {
  membre_id: {
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
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      isEmail: true,
      len: [1, 150]
    }
  },
  statut_compte: {
    type: DataTypes.ENUM('Active', 'Suspended', 'Inactive'),
    defaultValue: 'Active',
    allowNull: false
  }
}, {
  tableName: 'membres',
  timestamps: false
});

module.exports = Membre;
