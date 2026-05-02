const { Emprunt, Livre, Membre, sequelize } = require('../models');
const { Op } = require('sequelize');

class EmpruntController {
  // Borrowing Workflow - Must be in a single SQL Transaction
  async borrowBook(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { livre_id, membre_id } = req.body;

      // Validate member is Active
      const membre = await Membre.findOne({
        where: { 
          membre_id,
          statut_compte: 'Active' 
        },
        transaction
      });

      if (!membre) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Member not found or account is not active' 
        });
      }

      // Check book availability
      const livre = await Livre.findOne({
        where: { 
          livre_id,
          statut: 'Available' 
        },
        lock: true, // Prevent race conditions
        transaction
      });

      if (!livre) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Book not found or not available for borrowing' 
        });
      }

      // Check if member already has this book borrowed
      const existingEmprunt = await Emprunt.findOne({
        where: {
          livre_id,
          membre_id,
          date_retour_reelle: null
        },
        transaction
      });

      if (existingEmprunt) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'Member has already borrowed this book' 
        });
      }

      // Create borrow record and update book status
      const date_emprunt = new Date();
      const date_retour_prevue = new Date(date_emprunt);
      date_retour_prevue.setDate(date_retour_prevue.getDate() + 14);

      const emprunt = await Emprunt.create({
        livre_id,
        membre_id,
        date_emprunt,
        date_retour_prevue
      }, { transaction });

      // Update book status to Borrowed
      await livre.update({ statut: 'Borrowed' }, { transaction });

      await transaction.commit();

      res.status(201).json({
        message: 'Book borrowed successfully',
        emprunt: {
          emprunt_id: emprunt.emprunt_id,
          livre_id: emprunt.livre_id,
          membre_id: emprunt.membre_id,
          date_emprunt: emprunt.date_emprunt,
          date_retour_prevue: emprunt.date_retour_prevue
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Borrow transaction failed:', error);
      res.status(500).json({ 
        error: 'Failed to borrow book',
        details: error.message 
      });
    }
  }

  // Returning Workflow
  async returnBook(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const { livre_id, membre_id } = req.body;

      // Locate active borrow record where date_retour_reelle is NULL
      const emprunt = await Emprunt.findOne({
        where: {
          livre_id,
          membre_id,
          date_retour_reille: null
        },
        include: [
          { model: Livre, as: 'livre' }
        ],
        transaction
      });

      if (!emprunt) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: 'No active borrow record found for this book and member' 
        });
      }

      // Update return date and book status
      const date_retour_reelle = new Date();
      
      await emprunt.update({ 
        date_retour_reelle 
      }, { transaction });

      await emprunt.livre.update({ 
        statut: 'Available' 
      }, { transaction });

      await transaction.commit();

      res.status(200).json({
        message: 'Book returned successfully',
        emprunt: {
          emprunt_id: emprunt.emprunt_id,
          date_retour_reelle
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Return transaction failed:', error);
      res.status(500).json({ 
        error: 'Failed to return book',
        details: error.message 
      });
    }
  }

  // Get all active borrows
  async getActiveBorrows(req, res) {
    try {
      const emprunts = await Emprunt.findAll({
        where: {
          date_retour_reelle: null
        },
        include: [
          { model: Livre, as: 'livre', include: [{ model: require('./Auteur'), as: 'auteur' }] },
          { model: Membre, as: 'membre' }
        ],
        order: [['date_emprunt', 'DESC']]
      });

      res.status(200).json(emprunts);
    } catch (error) {
      console.error('Failed to fetch active borrows:', error);
      res.status(500).json({ error: 'Failed to fetch active borrows' });
    }
  }

  // Get overdue books
  async getOverdueBooks(req, res) {
    try {
      const currentDate = new Date();
      
      const overdueEmprunts = await Emprunt.findAll({
        where: {
          date_retour_reelle: null,
          date_retour_prevue: {
            [Op.lt]: currentDate
          }
        },
        include: [
          { model: Livre, as: 'livre', include: [{ model: require('./Auteur'), as: 'auteur' }] },
          { model: Membre, as: 'membre' }
        ],
        order: [['date_retour_prevue', 'ASC']]
      });

      res.status(200).json(overdueEmprunts);
    } catch (error) {
      console.error('Failed to fetch overdue books:', error);
      res.status(500).json({ error: 'Failed to fetch overdue books' });
    }
  }

  // Get member's borrowing history
  async getMemberBorrowingHistory(req, res) {
    try {
      const { membre_id } = req.params;

      const emprunts = await Emprunt.findAll({
        where: { membre_id },
        include: [
          { model: Livre, as: 'livre', include: [{ model: require('./Auteur'), as: 'auteur' }] }
        ],
        order: [['date_emprunt', 'DESC']]
      });

      res.status(200).json(emprunts);
    } catch (error) {
      console.error('Failed to fetch member borrowing history:', error);
      res.status(500).json({ error: 'Failed to fetch member borrowing history' });
    }
  }
}

module.exports = new EmpruntController();
