const express = require('express');
const router = express.Router();
const auteurController = require('../controllers/auteurController');
const { validate, validateId, schemas } = require('../middlewares/validation');

// Get all authors - GET /api/auteurs
router.get('/', auteurController.getAllAuthors);

// Get authors for select dropdown - GET /api/auteurs/select
router.get('/select', auteurController.getAuthorsForSelect);

// Get author by ID - GET /api/auteurs/:id
router.get('/:id', 
  validateId, 
  auteurController.getAuthorById
);

// Create new author - POST /api/auteurs
router.post('/', 
  validate(schemas.auteur), 
  auteurController.createAuthor
);

// Update author - PUT /api/auteurs/:id
router.put('/:id', 
  validateId,
  validate(schemas.auteur), 
  auteurController.updateAuthor
);

// Delete author - DELETE /api/auteurs/:id
router.delete('/:id', 
  validateId, 
  auteurController.deleteAuthor
);

module.exports = router;
