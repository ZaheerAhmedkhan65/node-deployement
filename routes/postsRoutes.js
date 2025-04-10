const express = require('express');
const router = express.Router();
const PostsController = require('../controllers/postsController');
const authenticate = require('../middlware/authenticate')

router.get('/',authenticate,PostsController.index);
router.get("/search",PostsController.searchPost)
router.get('/:id',PostsController.show);
router.post('/create', PostsController.create);
router.put('/:id/update', PostsController.update);
router.delete('/:id/delete', PostsController.destroy);


module.exports = router;
