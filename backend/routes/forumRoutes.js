const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

router.get('/', forumController.getPosts);
router.post('/', forumController.createPost);
router.put('/:id/vote', forumController.votePost);
router.post('/:id/comment', forumController.addComment);

module.exports = router;