const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Emprunt = sequelize.define('Emprunt', {
  emprunt_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  livre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'livres',
      key: 'livre_id'
    }
  },
  membre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'membres',
      key: 'membre_id'
    }
  },
  date_emprunt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  date_retour_prevue: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterDate(value) {
        if (value <= this.date_emprunt) {
          throw new Error('Return date must be after borrow date');
        }
      }
    }
  },
  date_retour_reelle: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'emprunts',
  timestamps: false,
  hooks: {
    beforeValidate: (emprunt) => {
      if (!emprunt.date_retour_prevue) {
        const returnDate = new Date(emprunt.date_emprunt);
        returnDate.setDate(returnDate.getDate() + 14);
        emprunt.date_retour_prevue = returnDate;
      }
    }
  }
});

module.exports = Emprunt;
