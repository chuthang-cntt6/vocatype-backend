const express = require('express');
const router = express.Router();
const vocab = require('../controllers/vocabController');
const sentence = require('../controllers/sentenceController');

router.get('/', vocab.getAll);
router.get('/search', vocab.searchVocabulary);
router.get('/:id', vocab.getById);
router.post('/', vocab.create);
router.put('/:id', vocab.update);
router.delete('/:id', vocab.delete);
router.post('/generate-sentence', vocab.generateSentence);
router.post('/analyze-pronunciation', vocab.analyzePronunciation);
router.post('/sentence', sentence.create);

module.exports = router; 