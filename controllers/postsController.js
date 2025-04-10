const Post = require('../models/Post');
const { format } = require('date-fns');
const { search } = require('../routes/authRoutes');

const PostsController = {
    // Create a new post
    async create(req, res) {
        try {
            const { title, content, published_at, user_id } = req.body;
            const post = await Post.createPost(title, content, published_at||null, user_id);
            post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
            res.status(201).json({post, message: "Post created successfully"});
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get all posts
    async index(req, res) {
        try {
            console.log("user id ",req.session.userId);
            console.log("user ",req.session.user.name);
            const posts = await Post.getPostsByUser(req.session.userId);
            posts.forEach(post => {
                post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
            })
            res.render("posts",{posts,title:'posts',userId:req.session.userId, user: req.session.user});
        } catch (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get a single post by ID
    async show(req, res) {
        try {
            const post = await Post.getPostById(req.params.id);
            if (!post) return res.status(404).json({ error: 'Post not found' });
            res.json(post);
        } catch (error) {
            console.error('Error fetching post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Update a post
    async update(req, res) {
        try {
            const { title, content, published_at } = req.body;
            const updatedPost = await Post.updatePost(req.params.id, title, content, published_at||null);
            if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
            res.json({updatedPost, message: "Post updated successfully"});
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Delete a post
    async destroy(req, res) {
        try {
            console.log("post id ;",req.params.id)
            const deletedPost = await Post.deletePost(req.params.id);
            if (!deletedPost) return res.status(404).json({ error: 'Post not found' });
            res.json({ message: 'Post deleted successfully.', post: deletedPost });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    //Search Post

    async searchPost(req, res) {
            const { query } = req.query; 
            console.log(query)
            try{
                const results = await Post.searchPost(query);
                results.forEach(post => { // Add formatted date to each post
                    post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
                })
                res.render('search_results', {
                    title: 'Search Results',
                    posts: results,
                    query: query,
                    user:req.session.user || null
                });
            } catch(err){
                console.log(err);
            }
    }
}

module.exports = PostsController;
