const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');

router.get('/', forumController.getPosts);
router.post('/', forumController.createPost);
router.put('/:id/vote', forumController.votePost);
router.post('/:id/comment', forumController.addComment);
router.delete('/:id', forumController.deletePost);

module.exports = router;