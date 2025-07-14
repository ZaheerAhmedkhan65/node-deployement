const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/postsController');
const authenticate = require('../middlware/authenticate')
router.use(authenticate)

router.get("/search", PostsController.searchPost)
router.get('/trending', PostsController.getTrendingPosts);
router.post('/create', PostsController.create);
router.get('/users/:id',PostsController.getAllUserPosts);
router.put('/:id/update', PostsController.update);
router.delete('/:id/delete', PostsController.destroy);
router.post('/:postId/like',  PostsController.likePost); // Like/dislike a post
router.post('/:postId/repost',  PostsController.repostPost); // Repost a post

module.exports = router;