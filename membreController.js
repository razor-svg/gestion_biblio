const { Membre, Emprunt } = require('../models');

class MembreController {
  // Get all members (with soft delete consideration)
  async getAllMembers(req, res) {
    try {
      const membres = await Membre.findAll({
        order: [['nom_complet', 'ASC']]
      });

      res.status(200).json(membres);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  // Get member by ID
  async getMemberById(req, res) {
    try {
      const { membre_id } = req.params;

      const membre = await Membre.findOne({
        where: { membre_id },
        include: [
          {
            model: Emprunt,
            as: 'emprunts',
            include: [
              {
                model: require('./livreController').Livre,
                as: 'livre',
                include: [{ model: require('./auteurController').Auteur, as: 'auteur' }]
              }
            ],
            order: [['date_emprunt', 'DESC']]
          }
        ]
      });

      if (!membre) {
        return res.status(404).json({ error: 'Member not found' });
      }

      res.status(200).json(membre);
    } catch (error) {
      console.error('Failed to fetch member:', error);
      res.status(500).json({ error: 'Failed to fetch member' });
    }
  }

  // Create new member
  async createMember(req, res) {
    try {
      const { nom_complet, email, statut_compte = 'Active' } = req.body;

      // Check if email already exists
      const existingMember = await Membre.findOne({
        where: { email }
      });

      if (existingMember) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const membre = await Membre.create({
        nom_complet,
        email,
        statut_compte
      });

      res.status(201).json(membre);
    } catch (error) {
      console.error('Failed to create member:', error);
      res.status(500).json({ 
        error: 'Failed to create member',
        details: error.message 
      });
    }
  }

  // Update member
  async updateMember(req, res) {
    try {
      const { membre_id } = req.params;
      const { nom_complet, email, statut_compte } = req.body;

      const membre = await Membre.findByPk(membre_id);
      if (!membre) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Check if email is being changed and if it already exists
      if (email && email !== membre.email) {
        const existingMember = await Membre.findOne({
          where: { email, membre_id: { [require('sequelize').Op.ne]: membre_id } }
        });

        if (existingMember) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      await membre.update({
        nom_complet,
        email,
        statut_compte
      });

      res.status(200).json(membre);
    } catch (error) {
      console.error('Failed to update member:', error);
      res.status(500).json({ 
        error: 'Failed to update member',
        details: error.message 
      });
    }
  }

  // Soft delete member (preserve audit trails)
  async deleteMember(req, res) {
    try {
      const { membre_id } = req.params;

      const membre = await Membre.findByPk(membre_id);
      if (!membre) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Check if member has active borrows
      const activeEmprunts = await Emprunt.count({
        where: {
          membre_id,
          date_retour_reelle: null
        }
      });

      if (activeEmprunts > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete member with active borrows. Please return all books first.' 
        });
      }

      // Soft delete by changing status to Inactive
      await membre.update({ statut_compte: 'Inactive' });

      res.status(200).json({ message: 'Member deactivated successfully' });
    } catch (error) {
      console.error('Failed to delete member:', error);
      res.status(500).json({ 
        error: 'Failed to delete member',
        details: error.message 
      });
    }
  }

  // Get active members only
  async getActiveMembers(req, res) {
    try {
      const membres = await Membre.findAll({
        where: { statut_compte: 'Active' },
        order: [['nom_complet', 'ASC']]
      });

      res.status(200).json(membres);
    } catch (error) {
      console.error('Failed to fetch active members:', error);
      res.status(500).json({ error: 'Failed to fetch active members' });
    }
  }

  // Get members for dropdown/select
  async getMembersForSelect(req, res) {
    try {
      const membres = await Membre.findAll({
        where: { statut_compte: 'Active' },
        attributes: ['membre_id', 'nom_complet', 'email'],
        order: [['nom_complet', 'ASC']]
      });

      res.status(200).json(membres);
    } catch (error) {
      console.error('Failed to fetch members for select:', error);
      res.status(500).json({ error: 'Failed to fetch members for select' });
    }
  }

  // Suspend member
  async suspendMember(req, res) {
    try {
      const { membre_id } = req.params;

      const membre = await Membre.findByPk(membre_id);
      if (!membre) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Check if member has active borrows
      const activeEmprunts = await Emprunt.count({
        where: {
          membre_id,
          date_retour_reelle: null
        }
      });

      if (activeEmprunts > 0) {
        return res.status(400).json({ 
          error: 'Cannot suspend member with active borrows. Please return all books first.' 
        });
      }

      await membre.update({ statut_compte: 'Suspended' });

      res.status(200).json({ message: 'Member suspended successfully' });
    } catch (error) {
      console.error('Failed to suspend member:', error);
      res.status(500).json({ 
        error: 'Failed to suspend member',
        details: error.message 
      });
    }
  }

  // Reactivate member
  async reactivateMember(req, res) {
    try {
      const { membre_id } = req.params;

      const membre = await Membre.findByPk(membre_id);
      if (!membre) {
        return res.status(404).json({ error: 'Member not found' });
      }

      await membre.update({ statut_compte: 'Active' });

      res.status(200).json({ message: 'Member reactivated successfully' });
    } catch (error) {
      console.error('Failed to reactivate member:', error);
      res.status(500).json({ 
        error: 'Failed to reactivate member',
        details: error.message 
      });
    }
  }
}

module.exports = new MembreController();
