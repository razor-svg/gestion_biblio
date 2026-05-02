const { Livre, Auteur, Emprunt, sequelize } = require('../models');
const { Op } = require('sequelize');

class LivreController {
  // Search Engine - Parameterized SQL query with LIKE operators
  async searchBooks(req, res) {
    try {
      const { keyword, genre, year_min, year_max, page = 1, limit = 20 } = req.query;
      
      const whereConditions = {};
      
      if (keyword) {
        // Using parameterized query with LIKE operator combining Title, Author, and Genre
        whereConditions[Op.or] = [
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('titre')),
            Op.like,
            `%${keyword.toLowerCase()}%`
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('auteur.nom_complet')),
            Op.like,
            `%${keyword.toLowerCase()}%`
          ),
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('genre')),
            Op.like,
            `%${keyword.toLowerCase()}%`
          )
        ];
      }
      
      if (genre) {
        whereConditions.genre = genre;
      }
      
      if (year_min || year_max) {
        whereConditions.annee_publication = {};
        if (year_min) whereConditions.annee_publication[Op.gte] = parseInt(year_min);
        if (year_max) whereConditions.annee_publication[Op.lte] = parseInt(year_max);
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: livres } = await Livre.findAndCountAll({
        where: whereConditions,
        include: [
          { 
            model: Auteur, 
            as: 'auteur',
            attributes: ['auteur_id', 'nom_complet']
          }
        ],
        limit: parseInt(limit),
        offset,
        order: [['titre', 'ASC']]
      });

      res.status(200).json({
        livres,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Search failed:', error);
      res.status(500).json({ 
        error: 'Failed to search books',
        details: error.message 
      });
    }
  }

  // Get all books with availability status
  async getAllBooks(req, res) {
    try {
      const livres = await Livre.findAll({
        include: [
          { 
            model: Auteur, 
            as: 'auteur',
            attributes: ['auteur_id', 'nom_complet']
          }
        ],
        order: [['titre', 'ASC']]
      });

      res.status(200).json(livres);
    } catch (error) {
      console.error('Failed to fetch books:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  }

  // Get book by ID
  async getBookById(req, res) {
    try {
      const { livre_id } = req.params;

      const livre = await Livre.findOne({
        where: { livre_id },
        include: [
          { 
            model: Auteur, 
            as: 'auteur',
            attributes: ['auteur_id', 'nom_complet', 'biographie']
          },
          {
            model: Emprunt,
            as: 'emprunts',
            where: { date_retour_reelle: null },
            required: false
          }
        ]
      });

      if (!livre) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.status(200).json(livre);
    } catch (error) {
      console.error('Failed to fetch book:', error);
      res.status(500).json({ error: 'Failed to fetch book' });
    }
  }

  // Create new book
  async createBook(req, res) {
    try {
      const { titre, auteur_id, genre, annee_publication } = req.body;

      const livre = await Livre.create({
        titre,
        auteur_id,
        genre,
        annee_publication
      });

      const livreWithAuthor = await Livre.findByPk(livre.livre_id, {
        include: [{ model: Auteur, as: 'auteur' }]
      });

      res.status(201).json(livreWithAuthor);
    } catch (error) {
      console.error('Failed to create book:', error);
      res.status(500).json({ 
        error: 'Failed to create book',
        details: error.message 
      });
    }
  }

  // Update book
  async updateBook(req, res) {
    try {
      const { livre_id } = req.params;
      const { titre, auteur_id, genre, annee_publication, statut } = req.body;

      const livre = await Livre.findByPk(livre_id);
      if (!livre) {
        return res.status(404).json({ error: 'Book not found' });
      }

      await livre.update({
        titre,
        auteur_id,
        genre,
        annee_publication,
        statut
      });

      const updatedLivre = await Livre.findByPk(livre_id, {
        include: [{ model: Auteur, as: 'auteur' }]
      });

      res.status(200).json(updatedLivre);
    } catch (error) {
      console.error('Failed to update book:', error);
      res.status(500).json({ 
        error: 'Failed to update book',
        details: error.message 
      });
    }
  }

  // Delete book (soft delete by marking as Lost)
  async deleteBook(req, res) {
    try {
      const { livre_id } = req.params;

      const livre = await Livre.findByPk(livre_id);
      if (!livre) {
        return res.status(404).json({ error: 'Book not found' });
      }

      // Check if book is currently borrowed
      const activeEmprunt = await Emprunt.findOne({
        where: {
          livre_id,
          date_retour_reelle: null
        }
      });

      if (activeEmprunt) {
        return res.status(400).json({ 
          error: 'Cannot delete book that is currently borrowed' 
        });
      }

      // Soft delete by marking as Lost
      await livre.update({ statut: 'Lost' });

      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Failed to delete book:', error);
      res.status(500).json({ 
        error: 'Failed to delete book',
        details: error.message 
      });
    }
  }

  // Get available books only
  async getAvailableBooks(req, res) {
    try {
      const livres = await Livre.findAll({
        where: { statut: 'Available' },
        include: [
          { 
            model: Auteur, 
            as: 'auteur',
            attributes: ['auteur_id', 'nom_complet']
          }
        ],
        order: [['titre', 'ASC']]
      });

      res.status(200).json(livres);
    } catch (error) {
      console.error('Failed to fetch available books:', error);
      res.status(500).json({ error: 'Failed to fetch available books' });
    }
  }
}

module.exports = new LivreController();
