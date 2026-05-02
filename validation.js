const Joi = require('joi');

// Validation schemas
const schemas = {
  // Book validation
  livre: Joi.object({
    titre: Joi.string().min(1).max(255).required(),
    auteur_id: Joi.number().integer().positive().required(),
    genre: Joi.string().max(100).optional(),
    annee_publication: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    statut: Joi.string().valid('Available', 'Borrowed', 'Lost').optional()
  }),

  // Author validation
  auteur: Joi.object({
    nom_complet: Joi.string().min(1).max(150).required(),
    biographie: Joi.string().optional().allow('')
  }),

  // Member validation
  membre: Joi.object({
    nom_complet: Joi.string().min(1).max(150).required(),
    email: Joi.string().email().max(150).required(),
    statut_compte: Joi.string().valid('Active', 'Suspended', 'Inactive').optional()
  }),

  // Borrow validation
  emprunt: Joi.object({
    livre_id: Joi.number().integer().positive().required(),
    membre_id: Joi.number().integer().positive().required()
  }),

  // Return validation
  retour: Joi.object({
    livre_id: Joi.number().integer().positive().required(),
    membre_id: Joi.number().integer().positive().required()
  }),

  // Search validation
  search: Joi.object({
    keyword: Joi.string().max(255).optional(),
    genre: Joi.string().max(100).optional(),
    year_min: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    year_max: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        error: 'Query validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    req.query = value;
    next();
  };
};

// ID parameter validation
const validateId = (req, res, next) => {
  const id = req.params.id || req.params.livre_id || req.params.auteur_id || req.params.membre_id || req.params.emprunt_id;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json({
      error: 'Invalid ID parameter',
      message: 'ID must be a positive integer'
    });
  }
  
  next();
};

module.exports = {
  validate,
  validateQuery,
  validateId,
  schemas
};
