const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');

// Import controllers (we'll create these)
const flashcardController = require('../controllers/flashcardController');

// List routes
router.get('/lists', verifyToken, flashcardController.getLists);
router.post('/lists', verifyToken, flashcardController.createList);
router.get('/lists/:id', verifyToken, flashcardController.getList);
router.put('/lists/:id', verifyToken, flashcardController.updateList);
router.delete('/lists/:id', verifyToken, flashcardController.deleteList);

// Card routes
router.get('/lists/:listId/cards', verifyToken, flashcardController.getCards);
router.post('/lists/:listId/cards', verifyToken, flashcardController.createCard);
router.post('/lists/:listId/cards/bulk', verifyToken, flashcardController.bulkCreateCards);
router.put('/cards/:id', verifyToken, flashcardController.updateCard);
router.delete('/cards/:id', verifyToken, flashcardController.deleteCard);

module.exports = router;
