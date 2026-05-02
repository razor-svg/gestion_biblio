const { Auteur, Livre } = require('../models');

class AuteurController {
  // Get all authors
  async getAllAuthors(req, res) {
    try {
      const auteurs = await Auteur.findAll({
        include: [
          {
            model: Livre,
            as: 'livres',
            attributes: ['livre_id', 'titre', 'statut']
          }
        ],
        order: [['nom_complet', 'ASC']]
      });

      res.status(200).json(auteurs);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
      res.status(500).json({ error: 'Failed to fetch authors' });
    }
  }

  // Get author by ID
  async getAuthorById(req, res) {
    try {
      const { auteur_id } = req.params;

      const auteur = await Auteur.findOne({
        where: { auteur_id },
        include: [
          {
            model: Livre,
            as: 'livres',
            attributes: ['livre_id', 'titre', 'genre', 'annee_publication', 'statut']
          }
        ]
      });

      if (!auteur) {
        return res.status(404).json({ error: 'Author not found' });
      }

      res.status(200).json(auteur);
    } catch (error) {
      console.error('Failed to fetch author:', error);
      res.status(500).json({ error: 'Failed to fetch author' });
    }
  }

  // Create new author
  async createAuthor(req, res) {
    try {
      const { nom_complet, biographie } = req.body;

      const auteur = await Auteur.create({
        nom_complet,
        biographie
      });

      res.status(201).json(auteur);
    } catch (error) {
      console.error('Failed to create author:', error);
      res.status(500).json({ 
        error: 'Failed to create author',
        details: error.message 
      });
    }
  }

  // Update author
  async updateAuthor(req, res) {
    try {
      const { auteur_id } = req.params;
      const { nom_complet, biographie } = req.body;

      const auteur = await Auteur.findByPk(auteur_id);
      if (!auteur) {
        return res.status(404).json({ error: 'Author not found' });
      }

      await auteur.update({
        nom_complet,
        biographie
      });

      res.status(200).json(auteur);
    } catch (error) {
      console.error('Failed to update author:', error);
      res.status(500).json({ 
        error: 'Failed to update author',
        details: error.message 
      });
    }
  }

  // Delete author (soft delete by checking if books exist)
  async deleteAuthor(req, res) {
    try {
      const { auteur_id } = req.params;

      const auteur = await Auteur.findByPk(auteur_id);
      if (!auteur) {
        return res.status(404).json({ error: 'Author not found' });
      }

      // Check if author has associated books
      const bookCount = await Livre.count({
        where: { auteur_id }
      });

      if (bookCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete author with associated books. Please delete or reassign books first.' 
        });
      }

      await auteur.destroy();

      res.status(200).json({ message: 'Author deleted successfully' });
    } catch (error) {
      console.error('Failed to delete author:', error);
      res.status(500).json({ 
        error: 'Failed to delete author',
        details: error.message 
      });
    }
  }

  // Get authors for dropdown/select
  async getAuthorsForSelect(req, res) {
    try {
      const auteurs = await Auteur.findAll({
        attributes: ['auteur_id', 'nom_complet'],
        order: [['nom_complet', 'ASC']]
      });

      res.status(200).json(auteurs);
    } catch (error) {
      console.error('Failed to fetch authors for select:', error);
      res.status(500).json({ error: 'Failed to fetch authors for select' });
    }
  }
}

module.exports = new AuteurController();
