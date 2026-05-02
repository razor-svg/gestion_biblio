const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Livre = sequelize.define('Livre', {
  livre_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  auteur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'auteurs',
      key: 'auteur_id'
    }
  },
  genre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  annee_publication: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1000,
      max: new Date().getFullYear()
    }
  },
  statut: {
    type: DataTypes.ENUM('Available', 'Borrowed', 'Lost'),
    defaultValue: 'Available',
    allowNull: false
  }
}, {
  tableName: 'livres',
  timestamps: false,
  indexes: [
    {
      name: 'idx_titre',
      fields: ['titre'],
      type: 'BTREE'
    },
    {
      name: 'idx_genre',
      fields: ['genre'],
      type: 'BTREE'
    }
  ]
});

module.exports = Livre;
