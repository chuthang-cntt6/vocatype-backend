const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');

// Get all chapters for a topic
router.get('/topic/:topicId', chapterController.getChaptersByTopic);

// Get vocabulary for a specific chapter
router.get('/:chapterId/vocabulary', chapterController.getVocabularyByChapter);

// Get chapter details
router.get('/:chapterId', chapterController.getChapterDetails);

// Create new chapter
router.post('/', chapterController.createChapter);

// Update chapter
router.put('/:chapterId', chapterController.updateChapter);

// Delete chapter
router.delete('/:chapterId', chapterController.deleteChapter);

// Assign vocabulary to chapter
router.post('/:chapterId/assign-vocabulary', chapterController.assignVocabularyToChapter);

module.exports = router;
