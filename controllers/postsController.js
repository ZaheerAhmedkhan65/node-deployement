const Post = require('../models/Post');
const User = require('../models/User');
const { format } = require('date-fns');
const { search } = require('../routes/authRoutes');

const PostsController = {
    // Create a new post
    async create(req, res) {
        try {
            const { title, content, published_at, user_id } = req.body;
            const post = await Post.createPost(title, content, published_at || null, user_id);
            post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
            res.status(201).json({ post, message: "Post created successfully" });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Get all posts
    async index(req, res) {
        try {
            console.log("user id ", req.user.userId);
            let posts = await Post.getPostsByUser(req.user.userId);
            
            // Get engagement data for each post
            posts = await Promise.all(posts.map(async post => {
                const reactions = await Post.getReactions(post.id);
                const repostCount = await Post.getRepostCount(post.id);
                const userReaction = await Post.getUserReaction(post.id, req.user.userId);
                const hasReposted = await Post.hasReposted(post.id, req.user.userId);
                
                return {
                    ...post,
                    published_at: post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published',
                    likes: reactions.likes,
                    dislikes: reactions.dislikes,
                    reposts: repostCount,
                    userReaction,
                    hasReposted
                };
            }));
            
            res.render("posts", { 
                posts, 
                title: 'posts', 
                userId: req.user.userId, 
                user: req.user 
            });
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
            const updatedPost = await Post.updatePost(req.params.id, title, content, published_at || null);
            if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
            res.json({ updatedPost, message: "Post updated successfully" });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Delete a post
    async destroy(req, res) {
        try {
            console.log("post id ;", req.params.id)
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
        try {
            const results = await Post.searchPost(query);
            results.forEach(post => { // Add formatted date to each post
                post.published_at = post.published_at ? format(new Date(post.published_at), 'dd-MM-yyyy') : 'Not Published';
            })
            res.render('search_results', {
                title: 'Search Results',
                posts: results,
                query: query,
                user: req.session.user || null
            });
        } catch (err) {
            console.log(err);
        }
    },

    async likePost(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user.userId; // From JWT
            const { type } = req.body; // 'like' or 'dislike'
            console.log("post id ", postId, "user id ", userId, "type ", type);
            if (!['like', 'dislike'].includes(type)) {
                return res.status(400).json({ error: 'Invalid reaction type' });
            }

            const result = await Post.toggleLike(postId, userId, type);
            const reactions = await Post.getReactions(postId);
            console.log("result", result);
            console.log("reactions", reactions);

            res.json({
                ...result,
                reactions,
                userReaction: await Post.getUserReaction(postId, userId)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to process reaction' });
        }
    },

    async repostPost(req, res) {
        try {
            const { postId } = req.params;
            const userId = req.user.userId;
console.log("post id ", postId, "user id ", userId);
            const result = await Post.toggleRepost(postId, userId);
            const repostCount = await Post.getRepostCount(postId);
console.log("result", result);
console.log("repostCount", repostCount);
            res.json({
                ...result,
                repostCount,
                hasReposted: await Post.hasReposted(postId, userId)
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to process repost' });
        }
    },

    // controllers/postsController.js
    async getTrendingPosts(req, res) {
        try {
            // Optional query parameters
            const limit = parseInt(req.query.limit) || 10;
            const timePeriod = req.query.period || '24 HOUR'; // Can be '1 HOUR', '24 HOUR', '7 DAY'
            console.log("timePeriod", timePeriod);
            console.log("limit", limit);

            // Get trending posts with some randomness
            const trendingPosts = await Post.getTrendingPosts(limit, timePeriod);
            console.log("trendingPosts", trendingPosts);
            // Add some randomness to prevent always showing exact same ranking
            const shuffled = trendingPosts
                .map(post => ({ post, sort: Math.random() }))
                .sort((a, b) => b.post.engagement_score - a.post.engagement_score || b.sort - a.sort)
                .map(({ post }) => post);

            // Get user data for each post
            const postsWithUsers = await Promise.all(
                shuffled.map(async post => {
                    const user = await User.findById(post.user_id);
                    return { ...post, user };
                })
            );

            res.json(postsWithUsers);
        } catch (error) {
            console.error('Error fetching trending posts:', error);
            res.status(500).json({ error: 'Failed to fetch trending posts' });
        }
    }

}

module.exports = PostsController;
