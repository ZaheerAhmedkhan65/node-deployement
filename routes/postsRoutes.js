const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/postsController');
const authenticate = require('../middlware/authenticate')

router.get("/search",authenticate, PostsController.searchPost)
router.get('/trending',authenticate, PostsController.getTrendingPosts);
router.get('/:id', PostsController.show);
router.post('/create', PostsController.create);
router.get('/users/:id',authenticate,PostsController.getAllUserPosts);
router.put('/:id/update', PostsController.update);
router.delete('/:id/delete', PostsController.destroy);
router.post('/:postId/like', authenticate, PostsController.likePost); // Like/dislike a post
router.post('/:postId/repost', authenticate, PostsController.repostPost); // Repost a post

module.exports = router;