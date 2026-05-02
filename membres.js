const express = require('express');
const router = express.Router();
const membreController = require('../controllers/membreController');
const { validate, validateId, schemas } = require('../middlewares/validation');

// Get all members - GET /api/membres
router.get('/', membreController.getAllMembers);

// Get active members - GET /api/membres/active
router.get('/active', membreController.getActiveMembers);

// Get members for select dropdown - GET /api/membres/select
router.get('/select', membreController.getMembersForSelect);

// Get member by ID - GET /api/membres/:id
router.get('/:id', 
  validateId, 
  membreController.getMemberById
);

// Create new member - POST /api/membres
router.post('/', 
  validate(schemas.membre), 
  membreController.createMember
);

// Update member - PUT /api/membres/:id
router.put('/:id', 
  validateId,
  validate(schemas.membre), 
  membreController.updateMember
);

// Delete member (soft delete) - DELETE /api/membres/:id
router.delete('/:id', 
  validateId, 
  membreController.deleteMember
);

// Suspend member - POST /api/membres/:id/suspend
router.post('/:id/suspend', 
  validateId, 
  membreController.suspendMember
);

// Reactivate member - POST /api/membres/:id/reactivate
router.post('/:id/reactivate', 
  validateId, 
  membreController.reactivateMember
);

module.exports = router;
