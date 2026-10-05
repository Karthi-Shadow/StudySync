const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/session', studyController.logSession);
router.get('/recommendation', studyController.getRecommendations);
router.get('/stats', studyController.getStudyStats);

module.exports = router;
