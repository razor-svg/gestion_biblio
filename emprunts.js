const express = require('express');
const router = express.Router();
const empruntController = require('../controllers/empruntController');
const { validate, validateId, schemas } = require('../middlewares/validation');

// Get all active borrows - GET /api/emprunts
router.get('/', empruntController.getActiveBorrows);

// Get overdue books - GET /api/emprunts/overdue
router.get('/overdue', empruntController.getOverdueBooks);

// Get member's borrowing history - GET /api/emprunts/member/:membre_id
router.get('/member/:membre_id', 
  validateId, 
  empruntController.getMemberBorrowingHistory
);

// Borrow a book - POST /api/emprunts/borrow
router.post('/borrow', 
  validate(schemas.emprunt), 
  empruntController.borrowBook
);

// Return a book - POST /api/emprunts/return
router.post('/return', 
  validate(schemas.retour), 
  empruntController.returnBook
);

module.exports = router;
