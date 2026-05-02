const express = require('express');
const router = express.Router();
const livreController = require('../controllers/livreController');
const { validate, validateQuery, validateId, schemas } = require('../middlewares/validation');

// Search books - GET /api/livres/search
router.get('/search', 
  validateQuery(schemas.search), 
  livreController.searchBooks
);

// Get all books - GET /api/livres
router.get('/', livreController.getAllBooks);

// Get available books - GET /api/livres/available
router.get('/available', livreController.getAvailableBooks);

// Get book by ID - GET /api/livres/:id
router.get('/:id', 
  validateId, 
  livreController.getBookById
);

// Create new book - POST /api/livres
router.post('/', 
  validate(schemas.livre), 
  livreController.createBook
);

// Update book - PUT /api/livres/:id
router.put('/:id', 
  validateId,
  validate(schemas.livre), 
  livreController.updateBook
);

// Delete book - DELETE /api/livres/:id
router.delete('/:id', 
  validateId, 
  livreController.deleteBook
);

module.exports = router;
